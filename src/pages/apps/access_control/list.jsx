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

import RoleModal from 'sections/apps/access_control/RoleModal';
import AlertRoleDelete from 'sections/apps/access_control/AlertRoleDelete';
import RoleView from 'sections/apps/access_control/RoleView';
import EmptyReactTable from 'pages/tables/react-table/empty';

import {
  DebouncedInput,
  HeaderSort,
  IndeterminateCheckbox,
  RowSelection,
  SelectColumnSorting,
  TablePagination
} from 'components/third-party/react-table';

// assets
import { Add, Edit, Eye, SecurityUser, ShieldCross, ShieldTick, Trash } from 'iconsax-react';
import { useGetRoles } from 'api/access_control';
import useAuth from 'hooks/useAuth';

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, modalToggler }) {
  const theme = useTheme();
  const [sorting, setSorting] = useState([{ id: 'role_name', desc: false }]);
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
            Add Role
          </Button>
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
                          <RoleView data={row.original} />
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
// ==============================|| ROLES LIST ||============================== //

export default function RoleListPage() {
  const theme = useTheme();
  const { user } = useAuth();
  const { rolesLoading: loading, roles: lists } = useGetRoles();

  const [open, setOpen] = useState(false);

  const [roleModal, setRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleDeleteId, setRoleDeleteId] = useState('');

  const handleClose = () => {
    setOpen(!open);
  };

  const columns = useMemo(
    () => [
      {
        header: '#',
        accessorKey: 'role_id',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Role Name',
        accessorKey: 'role_name',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SecurityUser />
            <Stack spacing={0}>
              <Typography variant="subtitle1">{getValue()}</Typography>
              {user.role === row.original.role_id && <Typography variant="h5">(You)</Typography>}
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Default',
        meta: {
          className: 'cell-center'
        },
        accessorKey: 'contact',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={'center'}>
            {row.original.is_default ? <ShieldTick color="green" /> : <ShieldCross color="red" />}
            <Stack spacing={0}>
              <Typography variant="subtitle1">{getValue()}</Typography>
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Editable',
        meta: {
          className: 'cell-center'
        },
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={'center'}>
            {row.original.is_editable ? <ShieldTick color="green" /> : <ShieldCross color="red" />}
            <Stack spacing={0}>
              <Typography variant="subtitle1">{getValue()}</Typography>
            </Stack>
          </Stack>
        )
      },
      {
        header: 'Can Edit Permissions',
        meta: {
          className: 'cell-center'
        },
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent={'center'}>
            {row.original.can_edit_permissions ? <ShieldTick color="green" /> : <ShieldCross color="red" />}
            <Stack spacing={0}>
              <Typography variant="subtitle1">{getValue()}</Typography>
            </Stack>
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
              <Tooltip title={row.original.is_default === 1 ? 'Edit (disabled)' : 'Edit'}>
                <IconButton
                  color="primary"
                  disabled={row.original.is_default === 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRole(row.original);
                    setRoleModal(true);
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
                    setRoleDeleteId(Number(row.original.role_id));
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          );
        }
      }
    ], // eslint-disable-next-line
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
            setRoleModal(true);
            setSelectedRole(null);
          }
        }}
      />
      <AlertRoleDelete id={Number(roleDeleteId)} company_id={user?.company_id} title={roleDeleteId} open={open} handleClose={handleClose} />
      <RoleModal open={roleModal} modalToggler={setRoleModal} role={selectedRole} />
    </>
  );
}

ReactTable.propTypes = { data: PropTypes.array, columns: PropTypes.array, modalToggler: PropTypes.func };
