import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
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
  Typography
} from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';

import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { HeaderSort, IndeterminateCheckbox, RowSelection, TablePagination } from 'components/third-party/react-table';
import { ArrowDown2, ArrowUp2, Edit, Eye, Filter, Setting2, Trash } from 'iconsax-react';

import StockTransferView from 'sections/apps/transfer/StockTransferView';
import StockTransferOverview from 'sections/apps/transfer/StockTransferOverview';
import StockTransferModal from 'sections/apps/transfer/StockTransferModal';
import AlertStockTransferDelete from 'sections/apps/transfer/AlertStockTransferDelete';
import StockTransferStatusModal from 'sections/apps/transfer/StockTransferStatusModal';
import EmptyStockTransfer from 'sections/apps/transfer/EmptyStockTransfer';

import { filterTransfer } from 'api/transfer';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import useConfig from 'hooks/useConfig';
import useAuth from 'hooks/useAuth';
import { format, formatDistanceToNow } from 'date-fns';

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';
import StockTransferFilters from 'sections/apps/transfer/StockTransferFilters';
import RestaurantInvoice from 'components/invoices/pages/RestaurantInvoice';
import PhotostudioInvoice from 'components/invoices/pages/PhotostudioInvoice';

function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'container'
})(({ theme, open, container }) => ({
  flexGrow: 1,
  ...(container && { [theme.breakpoints.only('lg')]: { marginLeft: !open ? -240 : 0 } }),
  [theme.breakpoints.down('lg')]: { paddingLeft: 0, marginLeft: 0 }
}));

// ----------------- TABLE -----------------
function ReactTable({ data, columns }) {
  const theme = useTheme();
  const safeData = safeArray(data);
  const [sorting, setSorting] = useState([{ id: 'transfer_date', desc: true }]);
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
                    <TableRow>
                      <TableCell colSpan={row.getVisibleCells().length}>
                        <StockTransferView data={row.original} />
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

// ----------------- PAGE -----------------
export default function StockTransferListPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const { container } = useConfig();
  const initialTransfers = useLoaderData();
  const [transfers, setTransfers] = useState(safeArray(initialTransfers));
  const [openDelete, setOpenDelete] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [deleteId, setDeleteId] = useState('');
  const [isStatusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatusTransfer, setSelectedStatusTransfer] = useState(null);
  const [actionDone, setActionDone] = useState(false);
  const navigate = useNavigate();
  const [filter, setFilter] = useState({
    business_unit_id: '',
    from_location_id: '',
    to_location_id: '',
    transfer_status: '',
    date_from: '',
    date_to: '',
    search: ''
  });
  const [activeTab, setActiveTab] = useState('All');
  const [globalFilter, setGlobalFilter] = useState('');

  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const safeUnits = safeArray(BusinessUnits);
  const safeLocations = safeArray(locations);

  useEffect(() => {
    (async () => {
      const sendFilters = { ...filter };
      if (activeTab !== 'All' && !sendFilters.transfer_status) sendFilters.transfer_status = activeTab;
      try {
        const response = await filterTransfer(user?.company_id, sendFilters);
        setTransfers(safeArray(response));
      } catch {
        setTransfers([]);
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
      { header: 'ID', accessorKey: 'transfer_id', meta: { className: 'cell-center' } },
      {
        header: 'From → To',
        accessorFn: (row) => `${row.from_location_name} → ${row.to_location_name}`,
        cell: ({ getValue }) => <Typography fontWeight={600}>{getValue()}</Typography>
      },
      {
        header: 'Transferred By',
        accessorKey: 'transferred_by_name',
        cell: ({ row, getValue }) => {
          const transferDate = new Date(row.original.transfer_date);
          const relativeDate = formatDistanceToNow(transferDate, { addSuffix: true });
          const exactDate = format(transferDate, 'PPpp');

          return (
            <Stack spacing={0}>
              <Typography fontWeight={600}>{getValue()}</Typography>
              <Typography variant="caption">{relativeDate}</Typography>
              <Tooltip title={exactDate}>
                <Typography variant="caption" color="text.secondary">
                  {row.original.unit_name || ''}
                </Typography>
              </Tooltip>
            </Stack>
          );
        }
      },
      {
        header: 'Status',
        accessorKey: 'transfer_status',
        cell: ({ getValue }) => (
          <Chip
            variant="outlined"
            size="small"
            label={getValue()}
            color={getValue() === 'received' ? 'success' : getValue() === 'pending' ? 'warning' : 'error'}
          />
        )
      },
      {
        header: 'Actions',
        meta: { className: 'cell-center' },
        cell: ({ row }) => (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Tooltip title="View More">
              <IconButton
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();

                  navigate(`/workspace/transfers/detail/${row.original.invoice_access_token}`);
                }}
              >
                <Eye />
              </IconButton>{' '}
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTransfer(row.original);
                  setModalOpen(true);
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
                  setSelectedStatusTransfer(row.original);
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
                  setDeleteId(row.original.transfer_id);
                  setSelectedStatusTransfer(row.original);
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
    <Box>
      <Main theme={theme} open={false} container={container}>
        <StockTransferOverview transfers={transfers} />
        <MainCard content={false}>
          <StockTransferFilters
            data={transfers}
            filter={filter}
            BusinessUnits={BusinessUnits}
            locations={locations}
            setFilter={setFilter}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <Divider />
          {transfers.length > 0 ? <ReactTable data={transfers} columns={columns} /> : <EmptyStockTransfer />}
        </MainCard>

        {/* Modals */}
        <AlertStockTransferDelete
          id={Number(deleteId)}
          company_id={user?.company_id}
          title={deleteId}
          open={openDelete}
          handleClose={() => setOpenDelete(false)}
          actionDone={setActionDone}
          status={selectedStatusTransfer?.transfer_status}
        />
        <StockTransferStatusModal
          open={isStatusModalOpen}
          handleClose={() => setStatusModalOpen(false)}
          transfer={selectedStatusTransfer}
          actionDone={setActionDone}
        />
        <StockTransferModal
          open={isModalOpen}
          actionDone={setActionDone}
          modalToggler={setModalOpen}
          transfer={selectedTransfer}
          filters={filter}
        />
      </Main>
    </Box>
  );
}
