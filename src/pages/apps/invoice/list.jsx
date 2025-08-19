import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import {
  Box,
  Chip,
  Divider,
  Grid,
  Stack,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
  LinearProgress,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';
import { rankItem } from '@tanstack/match-sorter-utils';
import { format, formatDistanceToNow } from 'date-fns';

import ScrollX from 'components/ScrollX';
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import EmptyReactTable from 'pages/tables/react-table/empty';
import AlertProductDelete from 'sections/apps/invoice/AlertProductDelete';
import { APP_DEFAULT_PATH } from 'config';
import { openSnackbar } from 'api/snackbar';
import { handlerDelete, deleteInvoice, useGetInvoice, useGetInvoiceMaster } from 'api/invoice';
import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';
import { DocumentText, Edit2, Eye, Trash } from 'iconsax-react';

// Fuzzy global filter for table
const fuzzyFilter = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value);
  addMeta(itemRank);
  return itemRank.passed;
};

function LinearWithLabel({ value, ...others }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress color="warning" variant="determinate" value={value} {...others} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="white">{`${Math.round(value)}%`}</Typography>
      </Box>
    </Box>
  );
}

function DateCell({ value }) {
  const [showExact, setShowExact] = useState(false);
  const date = new Date(value);
  const relative = formatDistanceToNow(date, { addSuffix: true });
  const exact = format(date, 'PPpp');
  return (
    <Tooltip title={showExact ? relative : exact} arrow>
      <Typography
        variant="caption"
        sx={{ userSelect: 'none', cursor: 'pointer' }}
        onClick={() => setShowExact((prev) => !prev)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') setShowExact((prev) => !prev);
        }}
        aria-label="toggle date format"
      >
        {showExact ? exact : relative}
      </Typography>
    </Tooltip>
  );
}

function StatusChip({ status }) {
  return status === 'active' ? (
    <Chip color="success" label="Active" size="small" variant="light" />
  ) : (
    <Chip color="error" label="Inactive" size="small" variant="light" />
  );
}

function ReactTable({ data, columns }) {
  const groups = useMemo(() => ['All', ...new Set(data.map((item) => item.status))], [data]);
  const [activeTab, setActiveTab] = useState(groups[0]);
  const [sorting, setSorting] = useState([{ id: 'customer_name', desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    setColumnFilters(activeTab === 'All' ? [] : [{ id: 'status', value: activeTab }]);
  }, [activeTab]);

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: fuzzyFilter,
    debugTable: false
  });

  const headers = useMemo(
    () =>
      columns
        .filter((col) => col.accessorKey)
        .map((col) => ({
          label: typeof col.header === 'string' ? col.header : '#',
          key: col.accessorKey
        })),
    [columns]
  );

  return (
    <MainCard content={false}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(v) => setGlobalFilter(String(v))}
          placeholder={`Search ${data.length} records...`}
        />
        <Stack direction="row" alignItems="center" spacing={2}>
          <SelectColumnSorting getState={table.getState} getAllColumns={table.getAllColumns} setSorting={setSorting} />
          <CSVExport
            data={table.getSelectedRowModel().flatRows.map((row) => row.original)}
            headers={headers}
            filename="customer-list.csv"
          />
        </Stack>
      </Stack>
      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer>
            <MuiTable>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        {...header.column.columnDef.meta}
                        onClick={header.column.getToggleSortingHandler()}
                        className={
                          header.column.getCanSort()
                            ? `${header.column.columnDef.meta?.className ?? ''} cursor-pointer prevent-select`
                            : header.column.columnDef.meta?.className
                        }
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
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} {...cell.column.columnDef.meta}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </MuiTable>
          </TableContainer>
          <Divider />
          <Box sx={{ p: 2 }}>
            <TablePagination
              setPageSize={table.setPageSize}
              setPageIndex={table.setPageIndex}
              getState={table.getState}
              getPageCount={table.getPageCount}
              initialPageSize={5}
            />
          </Box>
        </Stack>
      </ScrollX>
    </MainCard>
  );
}

export default function InvoiceList() {
  const { invoiceLoading, invoice: list } = useGetInvoice();
  const { invoiceMaster } = useGetInvoiceMaster();
  const [invoiceId, setInvoiceId] = useState(0);
  const navigation = useNavigate();

  const handleClose = useCallback(
    (status) => {
      if (status) {
        deleteInvoice(invoiceId);
        openSnackbar({
          open: true,
          message: 'Column deleted successfully',
          anchorOrigin: { vertical: 'top', horizontal: 'right' },
          variant: 'alert',
          alert: { color: 'success' }
        });
      }
      handlerDelete(false);
    },
    [invoiceId]
  );

  const columns = useMemo(
    () => [
      {
        id: 'Row Selection',
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
      {
        header: 'Invoice Id',
        accessorKey: 'invoice_id',
        meta: { className: 'cell-center' }
      },
      {
        header: 'User Info',
        accessorKey: 'invoice_number',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <DocumentText size="22" color="#37d67a" />
            <Stack spacing={0}>
              <Typography variant="subtitle1">{getValue()}</Typography>
              <Typography color="text.secondary">{row.original.transaction_type}</Typography>
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Create Date',
        accessorKey: 'created_at',
        cell: ({ getValue }) => <DateCell value={getValue()} />
      },
      {
        header: 'Updated Date',
        accessorKey: 'updated_at',
        cell: ({ getValue }) => <DateCell value={getValue()} />
      },
      {
        header: 'Shared',
        accessorKey: 'share_status',
        cell: ({ getValue }) => <StatusChip status={getValue()} />
      },
      {
        header: 'Actions',
        meta: { className: 'cell-center' },
        cell: ({ row }) => (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
            <Tooltip title="View">
              <IconButton
                color="secondary"
                aria-label="View"
                onClick={(e) => {
                  e.stopPropagation();
                  navigation(`/apps/invoice/details/${row.original.id}`);
                }}
              >
                <Eye />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                aria-label="Edit"
                onClick={(e) => {
                  e.stopPropagation();
                  navigation(`/apps/invoice/edit/${row.original.id}`);
                }}
              >
                <Edit2 />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                color="error"
                aria-label="Delete"
                onClick={(e) => {
                  e.stopPropagation();
                  setInvoiceId(row.original.id);
                  handlerDelete(true);
                }}
              >
                <Trash />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [navigation]
  );

  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  const breadcrumbLinks = useMemo(
    () => [{ title: 'Home', to: APP_DEFAULT_PATH }, { title: 'Invoice', to: '/apps/invoice/dashboard' }, { title: 'List' }],
    []
  );

  return (
    <>
      <Breadcrumbs custom heading="Invoice List" links={breadcrumbLinks} />
      <Grid container direction={matchDownSM ? 'column' : 'row'} spacing={2} sx={{ pb: 2 }}>
        <Grid item xs={12}>
          {invoiceLoading ? <EmptyReactTable columns={columns} /> : <ReactTable data={list ?? []} columns={columns} />}
          <AlertProductDelete title={String(invoiceId)} open={!!invoiceMaster?.alertPopup} handleClose={handleClose} />
        </Grid>
      </Grid>
    </>
  );
}
