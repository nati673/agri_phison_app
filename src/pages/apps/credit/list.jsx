import React, { Fragment, useEffect, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import {
  Box,
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
  Chip
} from '@mui/material';
import { styled, useTheme, alpha } from '@mui/material/styles';
import { format, formatDistanceToNow } from 'date-fns';

// Components
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import { HeaderSort, RowSelection, TablePagination } from 'components/third-party/react-table';
import { ArrowDown2, ArrowUp2, Edit, Filter, MoneyAdd, ProfileCircle, SearchNormal1, Setting2, Trash } from 'iconsax-react';

import TableFilters from 'components/TableFilters';
import useAuth from 'hooks/useAuth';
import useConfig from 'hooks/useConfig';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';

import { filterCredit } from 'api/credit';
import EmptySales from 'sections/apps/credit/EmptyCredit';
import CreditsView from 'sections/apps/credit/CreditsView';

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';
import CreditPaymentModal from 'sections/apps/credit/CreditPaymentModal';

// ------- helpers
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

// ------------------- TABLE -------------------
function ReactTable({ data, columns, setActionDone }) {
  const theme = useTheme();
  const safeData = safeArray(data);
  const [sorting, setSorting] = useState([{ id: 'added_date', desc: true }]);
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
                        <CreditsView data={row.original} onPaymentSuccess={() => setActionDone((ad) => !ad)} />
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

// ------------------- PAGE -------------------
export default function CreditsListPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const { container } = useConfig();
  const initialCredits = useLoaderData();
  const [credits, setCredits] = useState(safeArray(initialCredits));

  const [actionDone, setActionDone] = useState(false);
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
  const [creditToPay, setCreditToPay] = useState(null);

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

  useEffect(() => {
    (async () => {
      const sendFilters = { ...filter };
      if (activeTab !== 'All' && !sendFilters.status) sendFilters.status = activeTab;
      try {
        const response = await filterCredit(user?.company_id, sendFilters);
        setCredits(safeArray(response));
      } catch {
        setCredits([]);
      }
    })();
  }, [actionDone, user, filter, activeTab]);

  // -------- TABLE COLUMNS --------
  const columns = useMemo(
    () => [
      { header: 'ID', accessorKey: 'credit_id', meta: { className: 'cell-center' } },
      {
        header: 'Customer',
        accessorKey: 'customer_name',
        cell: ({ row, getValue }) => {
          const addedDate = new Date(row.original.added_date);
          const relativeDate = formatDistanceToNow(addedDate, { addSuffix: true });
          const exactDate = format(addedDate, 'PPpp');
          const [showExactDate, setShowExactDate] = useState(false);

          return (
            <Stack direction="row" spacing={1.5}>
              <ProfileCircle size="45" color={theme.palette.primary.main} variant="Bulk" />
              <Stack spacing={0}>
                <Typography fontWeight={600}>{getValue()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.original.unit_name} | {row.original.location_name}
                </Typography>
                <Typography
                  onClick={() => setShowExactDate((prev) => !prev)}
                  sx={{ userSelect: 'none', cursor: 'pointer' }}
                  variant="caption"
                >
                  {showExactDate ? exactDate : relativeDate}
                </Typography>
              </Stack>
            </Stack>
          );
        }
      },
      {
        header: 'Total Credit',
        accessorKey: 'credit_total',
        cell: ({ getValue }) => <Typography fontWeight={600}>Birr {getValue()}</Typography>
      },
      {
        header: 'Paid',
        accessorKey: 'total_paid',
        cell: ({ getValue }) => <Typography>{getValue()}</Typography>
      },
      {
        header: 'Remaining',
        accessorKey: 'remaining_balance',
        cell: ({ getValue }) => <Typography color="error.main">{getValue()}</Typography>
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ getValue }) => (
          <Chip
            variant="outlined"
            // label={}
            label={getValue().charAt(0).toUpperCase() + getValue().slice(1)}
            color={
              getValue() === 'paid' ? 'success' : getValue() === 'unpaid' ? 'error' : getValue() === 'partially paid' ? 'warning' : 'info'
            }
            size="small"
          />
        )
      },
      {
        header: 'Actions',
        meta: { className: 'cell-center' },
        cell: ({ row }) => (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Tooltip title="View More">
              <IconButton onClick={() => row.toggleExpanded()}>{row.getIsExpanded() ? <ArrowUp2 /> : <ArrowDown2 />}</IconButton>
            </Tooltip>

            <Tooltip title="Add Payment">
              <IconButton
                color="warning"
                onClick={(e) => {
                  e.stopPropagation();
                  setCreditToPay(row.original);
                  setPaymentModalOpen(true);
                }}
              >
                <MoneyAdd />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    [theme]
  );
  console.log(credits);
  return (
    <Box>
      <Main theme={theme} open={false} container={container}>
        <MainCard content={false}>
          <TableFilters
            data={credits}
            filter={filter}
            setFilter={setFilter}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          <Divider />
          {credits.length > 0 ? <ReactTable data={credits} columns={columns} setActionDone={setActionDone} /> : <EmptySales />}
        </MainCard>

        <CreditPaymentModal
          open={isPaymentModalOpen}
          handleClose={() => setPaymentModalOpen(false)}
          credit={creditToPay || {}}
          onPaymentSuccess={() => setActionDone((ad) => !ad)}
        />
      </Main>
    </Box>
  );
}
