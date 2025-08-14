import PropTypes from 'prop-types';
import { useMemo, useState, Fragment } from 'react';

// material-ui
import { alpha, useTheme } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
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
import IconButton from 'components/@extended/IconButton';

import CategoryModal from 'sections/apps/category/CategoryModal';
import AlertCategoryDelete from 'sections/apps/category/AlertCategory';
import CategoryView from 'sections/apps/category/CategoryView';
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

// assets
import { Add, Edit, Eye, Trash } from 'iconsax-react';
import { useGetProductCategories } from 'api/product_category';
import useAuth from 'hooks/useAuth';

// ==============================|| REACT TABLE - LIST ||============================== //

function ReactTable({ data, columns, modalToggler }) {
  const theme = useTheme();
  const [sorting, setSorting] = useState([{ id: 'unit_name', desc: false }]);
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
            Add Category
          </Button>
          <CSVExport
            {...{ data: table.getSelectedRowModel().flatRows.map((row) => row.original), headers, filename: 'Category-list.csv' }}
          />
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
                          <CategoryView data={row.original} />
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
// ==============================|| PRODUCT CATEGORY LIST ||============================== //

export default function ProductCategoryListPage() {
  const theme = useTheme();

  const { user } = useAuth();

  const { productCategoriesLoading: loading, productCategories: lists } = useGetProductCategories();

  const [open, setOpen] = useState(false);

  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [CategoryDeleteId, setCategoryDeleteId] = useState('');

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
        accessorKey: 'category_id',
        meta: {
          className: 'cell-center'
        }
      },
      {
        header: 'Category Name',
        accessorKey: 'category_name'
      },

      {
        header: 'Description',
        accessorKey: 'description'
      },

      {
        header: 'Status',
        accessorKey: 'is_active',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              color={row.original.is_active ? 'success' : 'error'}
              label={row.original.is_active ? 'Active' : 'Inactive'}
              size="small"
              variant="light"
            />
          </Stack>
        )
      },
      {
        header: 'Created At',
        accessorKey: 'created_at',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography color="text.secondary">{new Date(row.original.created_at).toLocaleDateString()}</Typography>
          </Stack>
        )
      },
      {
        header: 'Updated At',
        accessorKey: 'updated_at',
        cell: ({ row, getValue }) => (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography color="text.secondary">{new Date(row.original.updated_at).toLocaleDateString()}</Typography>
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
                    setSelectedCategory(row.original);
                    setCategoryModalOpen(true);
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
                    setCategoryDeleteId(Number(row.original.category_id));
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
            setCategoryModalOpen(true);
            setSelectedCategory(null);
          }
        }}
      />
      <AlertCategoryDelete
        id={Number(CategoryDeleteId)}
        company_id={user?.company_id}
        title={CategoryDeleteId}
        open={open}
        handleClose={handleClose}
      />
      <CategoryModal open={isCategoryModalOpen} modalToggler={setCategoryModalOpen} Category={selectedCategory} />
    </>
  );
}

ReactTable.propTypes = { data: PropTypes.array, columns: PropTypes.array, modalToggler: PropTypes.func };
