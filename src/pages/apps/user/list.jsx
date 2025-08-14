import PropTypes from 'prop-types';
import { useMemo, useState, Fragment } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import { PatternFormat } from 'react-number-format';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';

// project-import
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';

import UserModal from 'sections/apps/user/UserModal';
import AlertUserDelete from 'sections/apps/user/AlertUserDelete';
import UserView from 'sections/apps/user/UserView';
import EmptyReactTable from 'pages/tables/react-table/empty';

import {
  CSVExport,
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// assets
import { Add, Edit, Eye, Trash, UserRemove, UserTick } from 'iconsax-react';
import { useGetUsers } from 'api/users';
import useAuth from 'hooks/useAuth';

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, modalToggler }) {
  const theme = useTheme();
  const [sorting, setSorting] = useState([{ id: 'name', desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
      sorting,
      rowSelection,
      globalFilter
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  });
  const backColor = alpha(theme.palette.primary.lighter, 0.1);

  let headers = [];
  columns.map(
    (columns) =>
      // @ts-ignore
      columns.accessorKey &&
      headers.push({
        label: typeof columns.header === 'string' ? columns.header : '#',
        // @ts-ignore
        key: columns.accessorKey
      })
  );

  return (
    <MainCard content={false}>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ padding: 3 }}>
        <DebouncedInput
          value={globalFilter ?? ''}
          onFilterChange={(value) => setGlobalFilter(String(value))}
          placeholder={`Search ${data.length} records...`}
        />

        <Stack direction="row" alignItems="center" spacing={2}>
          <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} />
          <Button variant="contained" startIcon={<Add />} onClick={modalToggler} size="large">
            Add Employee
          </Button>
          <CSVExport {...{ data: table.getSelectedRowModel().flatRows.map((row) => row.original), headers, filename: 'user-list.csv' }} />
        </Stack>
      </Stack>
      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer>
            <Table>
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      if (header.column.columnDef.meta !== undefined && header.column.getCanSort()) {
                        Object.assign(header.column.columnDef.meta, {
                          className: header.column.columnDef.meta.className + ' cursor-pointer prevent-select'
                        });
                      }

                      return (
                        <TableCell
                          key={header.id}
                          {...header.column.columnDef.meta}
                          onClick={header.column.getToggleSortingHandler()}
                          {...(header.column.getCanSort() &&
                            header.column.columnDef.meta === undefined && {
                              className: 'cursor-pointer prevent-select'
                            })}
                        >
                          {header.isPlaceholder ? null : (
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                              {header.column.getCanSort() && <HeaderSort column={header.column} />}
                            </Stack>
                          )}
                        </TableCell>
                      );
                    })}
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
                      <TableRow sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` }, overflow: 'hidden' }}>
                        <TableCell colSpan={row.getVisibleCells().length} sx={{ p: 2.5, overflow: 'hidden' }}>
                          <UserView data={row.original} />
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <>
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
          </>
        </Stack>
      </ScrollX>
    </MainCard>
  );
}
// ==============================|| USERS LIST ||============================== //

export default function UserListPage() {
  const theme = useTheme();
  const { user } = useAuth();

  const { usersLoading: loading, users: lists } = useGetUsers();

  const [open, setOpen] = useState(false);

  const [userModal, setUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDeleteId, setUserDeleteId] = useState('');

  const handleClose = () => {
    setOpen(!open);
  };

  const columns = useMemo(
    () => [
      {
        id: 'Row Selection',
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler()
            }}
          />
        ),
        cell: ({ row }) => (
          <IndeterminateCheckbox
            {...{
              checked: row.getIsSelected(),
              disabled: !row.getCanSelect(),
              indeterminate: row.getIsSomeSelected(),
              onChange: row.getToggleSelectedHandler()
            }}
          />
        )
      },
      {
        header: '#',
        accessorKey: 'user_id',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Employee Name',
        accessorKey: 'name',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar alt="Avatar" size="sm" src={`${import.meta.env.VITE_APP_API_URL}/user/profile/${row.original.profile_image}`} />

            <Stack spacing={0}>
              <Typography variant="subtitle1">{getValue()}</Typography>
              {user.role === row.original.role_id ? <Typography variant="h6">(You)</Typography> : null}
              {row.original.email}
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Phone Number',
        accessorKey: 'phone'
      },
      {
        header: 'Role',
        accessorKey: 'role',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Account Active',
        accessorKey: 'is_active',
        meta: {
          className: 'cell-center'
        },
        cell: ({ row }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            {row.original.is_active ? <UserTick size="32" color="#37d67a" /> : <UserRemove size="32" color="#f47373" />}
          </Stack>
        )
      },
      {
        header: 'Actions',
        meta: {
          className: 'cell-center'
        },
        disableSortBy: true,
        cell: ({ row }) => {
          const collapseIcon =
            row.getCanExpand() && row.getIsExpanded() ? (
              <Add style={{ color: theme.palette.error.main, transform: 'rotate(45deg)' }} />
            ) : (
              <Eye />
            );
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              <Tooltip title="View">
                <IconButton color="secondary" onClick={row.getToggleExpandedHandler()}>
                  {collapseIcon}
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedUser(row.original);
                    setUserModal(true);
                  }}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                    setUserDeleteId(Number(row.original.user_id));
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ],
    [theme]
  );

  if (loading) return <EmptyReactTable columns={columns} />;

  return (
    <>
      <ReactTable
        {...{
          data: lists,
          columns,
          modalToggler: () => {
            setUserModal(true);
            setSelectedUser(null);
          }
        }}
      />
      <AlertUserDelete id={Number(userDeleteId)} company_id={user?.company_id} title={userDeleteId} open={open} handleClose={handleClose} />
      <UserModal open={userModal} modalToggler={setUserModal} user={selectedUser} />
    </>
  );
}

ReactTable.propTypes = { data: PropTypes.array, columns: PropTypes.array, modalToggler: PropTypes.func };
