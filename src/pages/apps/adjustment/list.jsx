import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { alpha, styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import FloatingCart from 'components/cards/e-commerce/FloatingCart';
import ProductFilterDrawer from 'sections/apps/product-center/products/ProductFilterDrawer';
import ProductsHeader from 'sections/apps/product-center/products/ProductsHeader';
import useConfig from 'hooks/useConfig';
import { resetCart, useGetCart } from 'api/cart';
import { filterAdjustments } from 'api/adjustment';
import useAuth from 'hooks/useAuth';
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
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  useReactTable
} from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import IconButton from 'components/@extended/IconButton';
import EmptyReactTable from 'pages/tables/react-table/empty';
import { HeaderSort, IndeterminateCheckbox, RowSelection, TablePagination } from 'components/third-party/react-table';
import { Add, ArrowDown2, ArrowUp2, Edit, Setting2, ShoppingBag, Trash } from 'iconsax-react';
import AlertProductDelete from 'sections/apps/purchase/AlertProductDelete';
import ProductView from 'sections/apps/purchase/PurchaseView';
import ProductModal from 'sections/apps/purchase/ProductModal';

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
  const [sorting, setSorting] = useState([{ id: 'location_name', desc: false }]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { columnFilters, sorting, rowSelection, globalFilter },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getRowCanExpand: () => true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  });

  const backColor = alpha(theme.palette.primary.lighter, 0.1);

  return (
    <MainCard
      content={false}
      sx={{
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: `1px solid ${theme.palette.grey[100]}`,
        overflow: 'hidden'
      }}
    >
      <ScrollX>
        <Stack>
          <RowSelection selected={Object.keys(rowSelection).length} />
          <TableContainer
            sx={{
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Table>
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
                          <ProductView data={row.original} />
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
  const navigate = useNavigate();

  const [isLoading, setLoading] = useState(true);
  const [openDelete, setOpenDelete] = useState(false);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ProductDeleteId, setProductDeleteId] = useState('');
  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);

  const initialProducts = useLoaderData();
  const [products, setProducts] = useState(initialProducts);

  const initialState = {
    search: '',
    sort: 'low',
    location_id: ['all'],
    category_id: ['all'],
    business_unit_id: ['all'],
    product_unit: ['all'],
    price: '',
    rating: 0
  };
  const [filter, setFilter] = useState(initialState);
  const [actionDone, setActionDone] = useState(false);

  const handleDrawerOpen = () => setOpenFilterDrawer((prev) => !prev);
  const handleCloseDelete = () => setOpenDelete(!openDelete);
  const handleAddProduct = () => navigate('/workspace/purchase/add-new-purchase');

  useEffect(() => {
    setLoading(false);
  }, []);

  useEffect(() => {
    if (cart && cart.step > 2) resetCart();
  }, [cart]);

  const filterData = async () => {
    const response = await filterAdjustments(user?.company_id, filter);
    setProducts(response);
    setLoading(false);
  };

  useEffect(() => {
    filterData();
  }, [actionDone, user, filter]);

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
      {
        header: 'ID',
        accessorKey: 'header_id',
        meta: { className: 'cell-center' }
      },

      {
        header: 'Item Name',
        accessorKey: 'product_name',
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
                <Typography>
                  {row.original.adjusted_by_name} • {date}
                </Typography>
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
            color={getValue() === 'approved' ? 'success' : getValue() === 'pending' ? 'warning' : 'error'}
            size="small"
          />
        )
      },

      {
        header: 'Adjustment Date',
        accessorKey: 'adjustment_date',
        cell: ({ getValue }) =>
          new Date(getValue()).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
      },

      {
        header: 'Actions',
        meta: { className: 'cell-center' },
        cell: ({ row }) => (
          <Stack direction="row" spacing={1} justifyContent="center">
            <Tooltip title="View More">
              <IconButton
                onClick={() => {
                  row.toggleExpanded();
                }}
              >
                {row.getCanExpand() && row.getIsExpanded() ? <ArrowUp2 /> : <ArrowDown2 />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedProduct(row.original);
                  setProductModalOpen(true);
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
                  handleCloseDelete();
                  setProductDeleteId(row.original.header_id);
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

  let productResult;
  if (products && products.length > 0) {
    productResult = (
      <Grid item xs={12}>
        <ReactTable data={products} columns={columns} />

        <AlertProductDelete
          id={Number(ProductDeleteId)}
          company_id={user?.company_id}
          title={ProductDeleteId}
          open={openDelete}
          handleClose={handleCloseDelete}
          actionDone={setActionDone}
        />

        <ProductModal
          open={isProductModalOpen}
          actionDone={setActionDone}
          modalToggler={setProductModalOpen}
          purchase={selectedProduct}
          filters={filter}
        />
      </Grid>
    );
  } else {
    productResult = (
      <Grid item xs={12} sx={{ mt: 3 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            border: `1px dashed ${theme.palette.grey[300]}`,
            borderRadius: 3
          }}
        >
          <ShoppingBag size="48" color={theme.palette.primary.main} variant="Bulk" />
          <Typography variant="h6" sx={{ mt: 2 }}>
            No purchases found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Start by adding a new purchase to manage your records.
          </Typography>
          <Button onClick={handleAddProduct} variant="contained" startIcon={<Add />} sx={{ mt: 3 }}>
            Add Purchase
          </Button>
        </Box>
      </Grid>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <ProductFilterDrawer
        filter={filter}
        setFilter={setFilter}
        openFilterDrawer={openFilterDrawer}
        handleDrawerOpen={handleDrawerOpen}
        setLoading={setLoading}
        initialState={initialState}
      />

      <Main theme={theme} open={openFilterDrawer} container={container}>
        <Grid container spacing={2.5}>
          <Grid item xs={12}>
            <ProductsHeader
              filter={filter}
              handleDrawerOpen={handleDrawerOpen}
              setFilter={setFilter}
              addTitle={'Add New Purchase'}
              handleAdd={handleAddProduct}
              SerachLable={'Search Purchase'}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {productResult}
            </Grid>
          </Grid>
        </Grid>
      </Main>

      {/* <FloatingCart /> */}
    </Box>
  );
}
