import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { alpha, styled, useTheme } from '@mui/material/styles';
import {
  Box,
  Grid,
  Tabs,
  Tab,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  Autocomplete
} from '@mui/material';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { HeaderSort, IndeterminateCheckbox, RowSelection, TablePagination } from 'components/third-party/react-table';
import { ArrowDown2, ArrowUp2, Edit, SearchNormal1, Setting2, Trash } from 'iconsax-react';

import OrderView from '../../../sections/apps/order/OrderView';
import OrderOverview from '../../../sections/apps/order/OrderOverview';
import EmptyOrders from '../../../sections/apps/order/EmptyOrders';
import OrderModal from '../../../sections/apps/order/OrderModal';
import OrderStatusModal from '../../../sections/apps/order/OrderStatusModal';
import OrderDeleteModal from '../../../sections/apps/order/OrderDeleteModal';

import { filterOrders } from 'api/order';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import WiderPopper from 'components/inputs/WiderPopper';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';

// ==============================
// Styled container
// ==============================
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'container' })(({ theme, open, container }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.shorter }),
  ...(container && { [theme.breakpoints.only('lg')]: { marginLeft: !open ? -240 : 0 } }),
  [theme.breakpoints.down('lg')]: { paddingLeft: 0, marginLeft: 0 },
  [theme.breakpoints.down('sm')]: { paddingLeft: theme.spacing(1), paddingRight: theme.spacing(1) },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shorter
    }),
    marginLeft: 0
  })
}));

// ==============================
// Filters Component
// ==============================
function OrderFilters({ filter, setFilter, activeTab, setActiveTab, BusinessUnits, locations, locationOptions, orders }) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const groups = ['All', ...new Set(safeOrders.map((item) => item.status))];
  const counts = safeOrders.reduce((acc, val) => {
    acc[val.status] = (acc[val.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {/* Tabs */}
      <Box sx={{ p: { xs: 1, sm: 2.5 }, pb: 0 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} variant="scrollable" scrollButtons="auto">
          {groups.map((status, index) => (
            <Tab
              key={index}
              label={status}
              value={status}
              icon={
                <Chip
                  label={status === 'All' ? safeOrders.length : counts[status]}
                  color={
                    status === 'All'
                      ? 'primary'
                      : status === 'approved'
                        ? 'success'
                        : status === 'pending'
                          ? 'warning'
                          : status === 'delivered'
                            ? 'info'
                            : status === 'cancelled'
                              ? 'error'
                              : 'default'
                  }
                  variant="light"
                  size="small"
                />
              }
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Box>

      {/* Search + Filters */}
      <Grid container spacing={{ xs: 1, sm: 1.5 }} alignItems="center" p={{ xs: 1, sm: 2 }}>
        {/* Search */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            placeholder="Search customer name, phone, address..."
            value={filter.customer_search || ''}
            onChange={(e) => setFilter((prev) => ({ ...prev, customer_search: e.target.value }))}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={18} />
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* Business Unit */}
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            size="small"
            options={BusinessUnits || []}
            getOptionLabel={(o) => o.unit_name || ''}
            value={(BusinessUnits || []).find((b) => b.business_unit_id === filter.business_unit_id) || null}
            renderOption={renderBusinessUnitOption}
            onChange={(_, v) => setFilter((prev) => ({ ...prev, business_unit_id: v?.business_unit_id || '', location_id: '' }))}
            renderInput={(params) => <TextField {...params} placeholder="Business unit" fullWidth />}
            PopperComponent={WiderPopper}
          />
        </Grid>

        {/* Location */}
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            size="small"
            options={locationOptions || []}
            getOptionLabel={(opt) => `${opt.location_name || ''} (${opt.location_type || ''})`}
            value={(locations || []).find((l) => l.location_id === filter.location_id) || null}
            onChange={(_, v) => setFilter((prev) => ({ ...prev, location_id: v?.location_id || '' }))}
            renderOption={renderLocationOption}
            renderInput={(params) => <TextField {...params} placeholder="Location" fullWidth />}
            PopperComponent={WiderPopper}
          />
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            size="small"
            options={[
              { label: 'All', value: '' },
              { label: 'Pending', value: 'pending' },
              { label: 'Approved', value: 'approved' },
              { label: 'Delivered', value: 'delivered' },
              { label: 'Cancelled', value: 'cancelled' }
            ]}
            getOptionLabel={(opt) => opt.label}
            value={
              [
                { label: 'All', value: '' },
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'Delivered', value: 'delivered' },
                { label: 'Cancelled', value: 'cancelled' }
              ].find((s) => s.value === filter.status) || null
            }
            onChange={(_, v) => setFilter((prev) => ({ ...prev, status: v?.value || '' }))}
            renderInput={(params) => <TextField {...params} placeholder="Status" fullWidth />}
          />
        </Grid>
      </Grid>
    </>
  );
}

// ==============================
// Table Component
// ==============================
function ReactTable({
  data,
  columns,
  globalFilter,
  setGlobalFilter,
  setSelectedOrder,
  setOrderModalOpen,
  setSelectedStatusOrder,
  setStatusModalOpen,
  setOpenDelete
}) {
  const theme = useTheme();
  const [sorting, setSorting] = useState([{ id: 'order_date', desc: true }]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: Array.isArray(data) ? data : [],
    columns,
    state: { sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const backColor = alpha(theme.palette.primary.lighter, 0.1);

  return (
    <ScrollX>
      <Stack>
        <RowSelection selected={Object.keys(rowSelection).length} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableCell key={header.id} {...header.column.columnDef.meta} onClick={header.column.getToggleSortingHandler()}>
                      {header.isPlaceholder ? null : (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                          {header.column.getCanSort() && <HeaderSort column={header.column} />}
                        </Stack>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow sx={{ '&:hover': { bgcolor: `${backColor} !important` } }}>
                      <TableCell colSpan={row.getVisibleCells().length}>
                        <OrderView data={row.original} />
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Divider />
        <Box sx={{ p: 2 }}>
          <TablePagination
            {...{
              setPageSize: table.setPageSize,
              setPageIndex: table.setPageIndex,
              getState: table.getState,
              getPageCount: table.getPageCount
            }}
          />
        </Box>
      </Stack>
    </ScrollX>
  );
}

// ==============================
// Main Page Component
// ==============================
export default function OrderListPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const { container } = useConfig();

  const initialOrders = useLoaderData();
  const [orders, setOrders] = useState(Array.isArray(initialOrders) ? initialOrders : []);
  const [filter, setFilter] = useState({ business_unit_id: '', location_id: '', status: '', customer_search: '' });
  const [activeTab, setActiveTab] = useState('All');
  const [globalFilter, setGlobalFilter] = useState('');
  const [openDelete, setOpenDelete] = useState(false);
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionDone, setActionDone] = useState(false);
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatusOrder, setSelectedStatusOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();

  const locationOptions = useMemo(() => {
    if (filter.business_unit_id) {
      const bu = BusinessUnits?.find((b) => b.business_unit_id === filter.business_unit_id);
      return (bu?.locations || []).filter((loc) => loc.location_type !== 'branch');
    }
    return (locations || []).filter((loc) => loc.location_type !== 'branch');
  }, [BusinessUnits, locations, filter.business_unit_id]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const sendFilters = { ...filter };
      if (activeTab !== 'All' && !sendFilters.status) sendFilters.status = activeTab;
      try {
        const response = await filterOrders(user?.company_id, sendFilters);
        setOrders(Array.isArray(response) ? response : []);
      } catch (error) {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [actionDone, user, filter, activeTab]);

  // Table Columns
  const columns = useMemo(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <IndeterminateCheckbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()} />
        )
      },
      { header: 'Order ID', accessorKey: 'order_id', meta: { className: 'cell-center' } },
      {
        header: 'Customer',
        accessorKey: 'customer_name',
        cell: ({ getValue, row }) => (
          <Stack>
            <Typography variant="body1" fontWeight={600}>
              {getValue()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {row.original.customer_id ? `ID: ${row.original.customer_id}` : ''}
            </Typography>
          </Stack>
        )
      },
      {
        header: 'Total Amount',
        accessorKey: 'total_amount',
        cell: ({ getValue }) => `$${parseFloat(getValue()).toFixed(2)}`
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => (
          <Chip
            label={getValue()}
            size="small"
            color={
              getValue() === 'approved' ? 'success' : getValue() === 'pending' ? 'warning' : getValue() === 'delivered' ? 'info' : 'error'
            }
          />
        )
      },
      {
        header: 'Order Date',
        accessorKey: 'order_date',
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString()
      },
      {
        header: 'Actions',
        cell: ({ row }) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="View More">
              <IconButton onClick={() => row.toggleExpanded()}>
                {row.getCanExpand() && row.getIsExpanded() ? <ArrowUp2 /> : <ArrowDown2 />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrder(row.original);
                  setOrderModalOpen(true);
                }}
              >
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip title="Update Status">
              <IconButton
                color="warning"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedStatusOrder(row.original);
                  setStatusModalOpen(true);
                }}
              >
                <Setting2 />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrder(row.original);
                  setOpenDelete(true);
                }}
              >
                <Trash />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [theme]
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Main theme={theme} open={false} container={container}>
        <OrderOverview orders={orders} />

        {/* All in one MainCard */}
        <MainCard content={false}>
          <OrderFilters
            filter={filter}
            setFilter={setFilter}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            BusinessUnits={BusinessUnits}
            locations={locations}
            locationOptions={locationOptions}
            orders={orders}
          />

          <Divider />

          {orders && orders.length > 0 ? (
            <ReactTable
              data={orders}
              columns={columns}
              globalFilter={globalFilter}
              setGlobalFilter={setGlobalFilter}
              setSelectedOrder={setSelectedOrder}
              setOrderModalOpen={setOrderModalOpen}
              setSelectedStatusOrder={setSelectedStatusOrder}
              setStatusModalOpen={setStatusModalOpen}
              setOpenDelete={setOpenDelete}
            />
          ) : (
            <EmptyOrders />
          )}
        </MainCard>

        {/* Modals */}
        <OrderDeleteModal open={openDelete} handleClose={() => setOpenDelete(false)} order={selectedOrder} actionDone={setActionDone} />
        <OrderStatusModal
          open={isStatusModalOpen}
          handleClose={() => setStatusModalOpen(false)}
          order={selectedStatusOrder}
          actionDone={setActionDone}
        />
        <OrderModal
          open={isOrderModalOpen}
          actionDone={setActionDone}
          modalToggler={setOrderModalOpen}
          order={selectedOrder}
          filters={filter}
        />
      </Main>
    </Box>
  );
}
