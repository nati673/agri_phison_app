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

import AdjustmentView from 'sections/apps/adjustment/AdjustmentView';
import AlertAdjustmentDelete from 'sections/apps/adjustment/AlertAdjustmentDelete';
import AdjustmentModal from 'sections/apps/adjustment/AdjustmentModal';
import AdjustmentOverview from 'sections/apps/adjustment/AdjustmentOverview';
import EmptyInventoryAdjustments from 'sections/apps/adjustment/EmptyInventoryAdjustments';
import AdjustmentStatusModal from 'sections/apps/adjustment/AdjustmentStatusModal';

import { resetCart, useGetCart } from 'api/cart';
import { filterAdjustments } from 'api/adjustment';
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

// Responsive Main container
const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'container'
})(({ theme, open, container }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter
  }),
  ...(container && {
    [theme.breakpoints.only('lg')]: {
      marginLeft: !open ? -240 : 0
    }
  }),
  [theme.breakpoints.down('lg')]: {
    paddingLeft: 0,
    marginLeft: 0
  },
  [theme.breakpoints.down('sm')]: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1)
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shorter
    }),
    marginLeft: 0
  })
}));

function ReactTable({
  data,
  columns,
  activeTab,
  setActiveTab,
  globalFilter,
  setGlobalFilter,
  filter,
  setFilter,
  BusinessUnits,
  locations,
  locationOptions
}) {
  const theme = useTheme();
  const [sorting, setSorting] = useState([{ id: 'location_name', desc: false }]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
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

  const groups = ['All', ...new Set(data.map((item) => item.adjustment_status))];
  const counts = data.reduce((acc, val) => {
    acc[val.adjustment_status] = (acc[val.adjustment_status] || 0) + 1;
    return acc;
  }, {});
  const backColor = alpha(theme.palette.primary.lighter, 0.1);

  return (
    <MainCard content={false}>
      {/* Tabs - now scrollable for mobile */}
      <Box sx={{ p: { xs: 1, sm: 2.5 }, pb: 0 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {groups.map((status, index) => (
            <Tab
              key={index}
              label={status}
              value={status}
              icon={
                <Chip
                  label={status === 'All' ? data.length : counts[status]}
                  color={status === 'All' ? 'primary' : status === 'approved' ? 'success' : status === 'submitted' ? 'warning' : 'error'}
                  variant="light"
                  size="small"
                />
              }
              iconPosition="end"
            />
          ))}
        </Tabs>
      </Box>

      {/* Search + Filters - adjusted spacing for small screens */}
      <Grid container spacing={{ xs: 1, sm: 1.5 }} alignItems="center" p={{ xs: 1, sm: 2 }}>
        {/* Search */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            placeholder="Search adjustments..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={18} color={theme.palette.text.secondary} />
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
            onChange={(_, v) =>
              setFilter((prev) => ({
                ...prev,
                business_unit_id: v?.business_unit_id || '',
                location_id: ''
              }))
            }
            renderInput={(params) => <TextField {...params} placeholder="Select business unit" fullWidth />}
            PopperComponent={WiderPopper}
          />
        </Grid>

        {/* Location */}
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            size="small"
            options={locationOptions}
            getOptionLabel={(opt) => `${opt.location_name || ''} (${opt.location_type || ''})`}
            value={(locations || []).find((l) => l.location_id === filter.location_id) || null}
            onChange={(_, v) => setFilter((prev) => ({ ...prev, location_id: v?.location_id || '' }))}
            renderOption={renderLocationOption}
            renderInput={(params) => <TextField {...params} placeholder="Select location" fullWidth />}
            PopperComponent={WiderPopper}
          />
        </Grid>

        {/* Status */}
        <Grid item xs={12} sm={6} md={3}>
          <Autocomplete
            size="small"
            options={[
              { label: 'All', value: '' },
              { label: 'Approved', value: 'approved' },
              { label: 'Submitted', value: 'submitted' },
              { label: 'Rejected', value: 'rejected' }
            ]}
            getOptionLabel={(opt) => opt.label}
            value={
              [
                { label: 'All', value: '' },
                { label: 'Approved', value: 'approved' },
                { label: 'Submitted', value: 'submitted' },
                { label: 'Rejected', value: 'rejected' }
              ].find((s) => s.value === filter.adjustment_status) || null
            }
            onChange={(_, v) => setFilter((prev) => ({ ...prev, adjustment_status: v?.value || '' }))}
            renderInput={(params) => <TextField {...params} placeholder="Select status" fullWidth />}
          />
        </Grid>
      </Grid>

      {/* Table */}
      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        {...header.column.columnDef.meta}
                        onClick={header.column.getToggleSortingHandler()}
                        className={header.column.getCanSort() ? 'cursor-pointer prevent-select' : ''}
                      >
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
                        <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                    {row.getIsExpanded() && (
                      <TableRow sx={{ '&:hover': { bgcolor: `${backColor} !important` } }}>
                        <TableCell colSpan={row.getVisibleCells().length}>
                          <AdjustmentView data={row.original} />
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
    </MainCard>
  );
}

export default function InventoryAdjustmentListPage() {
  const theme = useTheme();
  const { cart } = useGetCart();
  const { user } = useAuth();
  const { container } = useConfig();

  const [openDelete, setOpenDelete] = useState(false);
  const [isAdjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [AdjustmentDeleteId, setAdjustmentDeleteId] = useState('');
  const [actionDone, setActionDone] = useState(false);
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatusAdjustment, setSelectedStatusAdjustment] = useState(null);

  const initialAdjustments = useLoaderData();
  const [adjustments, setAdjustments] = useState(initialAdjustments);

  const [filter, setFilter] = useState({
    business_unit_id: '',
    location_id: '',
    adjustment_status: ''
  });
  const [activeTab, setActiveTab] = useState('All');
  const [globalFilter, setGlobalFilter] = useState('');

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
    if (cart && cart.step > 2) resetCart();
  }, [cart]);

  useEffect(() => {
    (async () => {
      const sendFilters = { ...filter };
      if (activeTab !== 'All' && !sendFilters.adjustment_status) {
        sendFilters.adjustment_status = activeTab;
      }
      const response = await filterAdjustments(user?.company_id, sendFilters);
      setAdjustments(response);
    })();
  }, [actionDone, user, filter, activeTab]);

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
          <IndeterminateCheckbox
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            indeterminate={row.getIsSomeSelected()}
            onChange={row.getToggleSelectedHandler()}
          />
        )
      },
      { header: 'ID', accessorKey: 'header_id', meta: { className: 'cell-center' } },
      {
        header: 'Item Name',
        accessorKey: 'adjusted_by_name',
        cell: ({ row, getValue }) => {
          const date = new Date(row.original.adjustment_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Setting2 size="32" color={theme.palette.primary.main} variant="Bulk" />
              <Stack spacing={0}>
                <Typography variant="body1" fontWeight={600}>
                  {getValue()}
                </Typography>
                <Typography>{date}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.original.business_unit_name} | {row.original.location_name}
                </Typography>
              </Stack>
            </Stack>
          );
        }
      },
      {
        header: 'Type',
        accessorKey: 'adjustment_type',
        cell: ({ getValue }) => (
          <Chip variant="outlined" label={getValue()} color={getValue() === 'quantity' ? 'primary' : 'secondary'} size="small" />
        )
      },
      {
        header: 'Status',
        accessorKey: 'adjustment_status',
        cell: ({ getValue }) => (
          <Chip
            variant="outlined"
            label={getValue()}
            color={getValue() === 'approved' ? 'success' : getValue() === 'submitted' ? 'warning' : 'error'}
            size="small"
          />
        )
      },
      {
        header: 'Adjustment Date',
        accessorKey: 'adjustment_date',
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      },
      {
        header: 'Actions',
        meta: { className: 'cell-center' },
        cell: ({ row }) => (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center" alignItems="center">
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
                  setSelectedAdjustment(row.original);
                  setAdjustmentModalOpen(true);
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
                  setSelectedStatusAdjustment(row.original);
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
                  setOpenDelete(true);
                  setAdjustmentDeleteId(row.original.header_id);
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
        <AdjustmentOverview adjustments={adjustments} />
        {adjustments && adjustments.length > 0 ? (
          <ReactTable
            data={adjustments}
            columns={columns}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            filter={filter}
            setFilter={setFilter}
            BusinessUnits={BusinessUnits}
            locations={locations}
            locationOptions={locationOptions}
          />
        ) : (
          <EmptyInventoryAdjustments />
        )}

        {/* Modals */}
        <AlertAdjustmentDelete
          id={Number(AdjustmentDeleteId)}
          company_id={user?.company_id}
          title={AdjustmentDeleteId}
          open={openDelete}
          handleClose={() => setOpenDelete(false)}
          actionDone={setActionDone}
        />
        <AdjustmentStatusModal
          open={isStatusModalOpen}
          handleClose={() => setStatusModalOpen(false)}
          adjustment={selectedStatusAdjustment}
          actionDone={setActionDone}
        />
        <AdjustmentModal
          open={isAdjustmentModalOpen}
          actionDone={setActionDone}
          modalToggler={setAdjustmentModalOpen}
          adjustment={selectedAdjustment}
          filters={filter}
        />
      </Main>
    </Box>
  );
}
