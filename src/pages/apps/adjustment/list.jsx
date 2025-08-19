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
import TableFilters from 'components/TableFilters';

// Defensive: always ensure arrays
function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

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



function ReactTable({ data, columns }) {
  const theme = useTheme();
  const safeData = safeArray(data);
  const [sorting, setSorting] = useState([{ id: 'location_name', desc: false }]);
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data: safeData,
    columns,
    state: { sorting, rowSelection },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
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
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableCell key={header.id} onClick={header.column.getToggleSortingHandler()} {...header.column.columnDef.meta}>
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
  );
}

export default function InventoryAdjustmentListPage() {
  const theme = useTheme();
  const { cart } = useGetCart();
  const { user } = useAuth();
  const { container } = useConfig();

  const initialAdjustments = useLoaderData();
  const [adjustments, setAdjustments] = useState(safeArray(initialAdjustments));
  const [openDelete, setOpenDelete] = useState(false);
  const [isAdjustmentModalOpen, setAdjustmentModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState(null);
  const [AdjustmentDeleteId, setAdjustmentDeleteId] = useState('');
  const [actionDone, setActionDone] = useState(false);
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatusAdjustment, setSelectedStatusAdjustment] = useState(null);

const [filter, setFilter] = useState({
  business_unit_id: '',
  location_id: '',
  status: '',
  date_from: '',
  date_to: '',
  search: ''
});
  const [activeTab, setActiveTab] = useState('All');
  const [globalFilter, setGlobalFilter] = useState('');

  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();

  const safeBusinessUnits = safeArray(BusinessUnits);
  const safeLocations = safeArray(locations);

  const locationOptions = useMemo(() => {
    if (filter.business_unit_id) {
      const bu = safeBusinessUnits.find((b) => b.business_unit_id === filter.business_unit_id);
      return safeArray(bu?.locations).filter((loc) => loc.location_type !== 'branch');
    }
    return safeLocations.filter((loc) => loc.location_type !== 'branch');
  }, [safeBusinessUnits, safeLocations, filter.business_unit_id]);

  useEffect(() => {
    if (cart && cart.step > 2) resetCart();
  }, [cart]);

  useEffect(() => {
    (async () => {
      const sendFilters = { ...filter };
      if (activeTab !== 'All' && !sendFilters.adjustment_status) sendFilters.adjustment_status = activeTab;
      try {
        const response = await filterAdjustments(user?.company_id, sendFilters);
        setAdjustments(safeArray(response));
      } catch {
        setAdjustments([]);
      }
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

        <MainCard content={false}>
          <TableFilters
            data={adjustments}
            filter={filter}
            setFilter={setFilter}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            statusOptions={[
              { label: 'All', value: '' },
              { label: 'Approved', value: 'approved' },
              { label: 'Submitted', value: 'submitted' },
              { label: 'Rejected', value: 'rejected' }
            ]}
            statusLabel="Status"
          />

          <Divider />

          {adjustments.length > 0 ? <ReactTable data={adjustments} columns={columns} /> : <EmptyInventoryAdjustments />}
        </MainCard>

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
