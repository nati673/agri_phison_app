import { Fragment, useEffect, useMemo, useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';

// material-ui
import { alpha, styled, useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

// project-imports
import ProductCard from 'components/cards/e-commerce/ProductCard';
import FloatingCart from 'components/cards/e-commerce/FloatingCart';

import ProductFilterDrawer from 'sections/apps/product-center/products/ProductFilterDrawer';
import SkeletonProductPlaceholder from 'components/cards/skeleton/ProductPlaceholder';
import ProductsHeader from 'sections/apps/product-center/products/ProductsHeader';
import ProductEmpty from 'sections/apps/product-center/products/ProductEmpty';

import useConfig from 'hooks/useConfig';
import { resetCart, useGetCart } from 'api/cart';
import { filterProducts } from 'api/products';
import useAuth from 'hooks/useAuth';
// material-ui
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
import {
  Add,
  ArrowDown2,
  ArrowUp2,
  Chart1,
  Copy,
  DocumentDownload,
  DocumentText1,
  Edit,
  Eye,
  InfoCircle,
  Information,
  More,
  More2,
  Share,
  ShoppingBag,
  TableDocument,
  Trash
} from 'iconsax-react';
import AlertProductDelete from 'sections/apps/product-center/products/AlertProductDelete';
import ProductView from 'sections/apps/product-center/products/ProductView';
import ProductModal from 'sections/apps/product-center/products/ProductModal';
import { ProductStockModal } from 'sections/apps/product-center/products/ProductStockModal';
import RestockProductModal from 'sections/apps/product-center/products/RestockProductModal';
import { ProductBatchesModal } from 'sections/apps/product-center/products/ProductBatchesModal';
import { ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import { useGetBusinessUnit } from 'api/business_unit';

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' && prop !== 'container' })(({ theme, open, container }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.shorter
  }),
  // marginLeft: -99,
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

function ReactTable({ data, columns, modalToggler }) {
  const theme = useTheme();
  const [sorting, setSorting] = useState([{ id: 'location_name', desc: false }]);
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
                  <Fragment key={row.product_id}>
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
// ==============================|| ECOMMERCE - PRODUCTS ||============================== //

export default function ProductsPage() {
  const theme = useTheme();

  const { cart } = useGetCart();
  const { user } = useAuth();
  const { container } = useConfig();
  const { BusinessUnits } = useGetBusinessUnit();

  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(false);
  }, []);
  const [open, setOpen] = useState(false);

  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ProductDeleteId, setProductDeleteId] = useState('');

  const [isStockModalOpen, setStockModalOpen] = useState(false);
  const [selectedProductForStock, setSelectedProductForStock] = useState(null);
  const [isBatchesModalOpen, setBatchesModalOpen] = useState(false);
  const [selectedProductForBatches, setSelectedProductForBatches] = useState(null);
  const [isRestockModalOpen, setRestockModalOpen] = useState(false);

  // Open stock modal
  const handleOpenStockModal = (product) => {
    setSelectedProductForStock(product);
    setStockModalOpen(true);
  };
  // Close stock modal
  const handleCloseStockModal = () => {
    setStockModalOpen(false);
    setSelectedProductForStock(null);
  };

  // Open restock modal
  const handleOpenRestockModal = () => {
    setRestockModalOpen(true);
  };
  // Close restock modal
  const handleCloseRestockModal = () => {
    setRestockModalOpen(false);
  };

  // When "Add Stock" is requested from ProductStockModal
  const handleAddStockFromStockModal = () => {
    setStockModalOpen(false); // close stock modal
    setRestockModalOpen(true); // open restock modal
  };

  const handleOpenBatchesModal = (product) => {
    setSelectedProductForBatches(product);
    setBatchesModalOpen(true);
  };
  const handleCloseBatchesModal = () => {
    setBatchesModalOpen(false);
    setSelectedProductForBatches(null);
  };

  const handleClose = () => {
    setOpen(!open);
  };
  const history = useNavigate();

  const initialProducts = useLoaderData();
  const [products, setProducts] = useState(initialProducts);

  useEffect(() => {
    if (cart && cart.step > 2) {
      resetCart();
    }
  }, []);

  const [openFilterDrawer, setOpenFilterDrawer] = useState(false);
  const handleDrawerOpen = () => {
    setOpenFilterDrawer((prevState) => !prevState);
  };
  const handleAddProduct = () => {
    history(`/workspace/product-center/add-new-product`);
  };
  // filter
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

  const filterData = async () => {
    const response = await filterProducts(user?.company_id, filter);
    setProducts(response);
    setLoading(false);
  };

  useEffect(() => {
    filterData();
  }, [actionDone, user, filter]);

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
        accessorKey: 'product_id',
        meta: {
          className: 'cell-center'
        }
      },
      // {
      //   header: 'Name',
      //   accessorKey: 'product_name'
      // },
      {
        header: 'Item Name',
        accessorKey: 'product_name',
        cell: ({ row, getValue }) => {
          const date = new Date(row.original.added_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Stack spacing={0}>
                <Typography>
                  {row.original.product_name} | {row.original.product_name_localized}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.original.sku} | {row.original.product_unit}
                </Typography>
              </Stack>
            </Stack>
          );
        }
      },
      // {
      //   header: 'Quantity',
      //   accessorKey: 'quantity'
      // },
      {
        header: 'Category',
        accessorKey: 'category_name'
      },

      {
        header: 'Unit',
        accessorKey: 'product_unit'
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
          const [anchorEl, setAnchorEl] = useState(null);
          const open = Boolean(anchorEl);

          const handleMenuOpen = (event) => {
            event.stopPropagation(); // prevent row click
            setAnchorEl(event.currentTarget);
          };

          const handleMenuClose = () => {
            setAnchorEl(null);
          };

          const collapseIcon = row.getCanExpand() && row.getIsExpanded() ? <ArrowUp2 /> : <ArrowDown2 />;
          return (
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
              {/* Inline actions you want visible */}
              <Tooltip title="View More">
                <IconButton color="secondary" onClick={row.getToggleExpandedHandler()}>
                  {collapseIcon}
                </IconButton>
              </Tooltip>

              <Tooltip title="View Stock">
                <IconButton
                  color="info"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenStockModal(row.original);
                  }}
                >
                  <Chart1 />
                </IconButton>
              </Tooltip>
              <Tooltip title="View Batches">
                <IconButton
                  color="info"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenBatchesModal(row.original);
                  }}
                >
                  <TableDocument />
                </IconButton>
              </Tooltip>
              {/* 3‑dot more button */}
              <Tooltip title="More Actions">
                <IconButton onClick={handleMenuOpen}>
                  <More />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                onClick={(e) => e.stopPropagation()} // don’t trigger row
              >
                {' '}
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose();
                    handleOpenStockModal(row.original);
                  }}
                >
                  <ListItemIcon>
                    <Chart1 />
                  </ListItemIcon>
                  <ListItemText primary="View Stock" />
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose();
                    handleOpenBatchesModal(row.original);
                  }}
                >
                  <ListItemIcon>
                    <TableDocument />
                  </ListItemIcon>
                  <ListItemText primary="View Batches" />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleViewDetails(row.original);
                  }}
                >
                  <ListItemIcon>
                    <Information fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Details" />
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    setSelectedProduct(row.original);
                    setProductModalOpen(true);
                  }}
                >
                  <ListItemIcon>
                    <Edit fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Edit" />
                </MenuItem>
                <MenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMenuClose();
                    setProductDeleteId(Number(row.original.product_id));
                    handleClose();
                  }}
                >
                  <ListItemIcon>
                    <Trash fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Delete" />
                </MenuItem>
              </Menu>
            </Stack>
          );
        }
      }
    ],
    [theme]
  );

  // if (loading) return <EmptyReactTable columns={columns} />;
  let productResult = <></>;
  if (products && products.length > 0) {
    productResult = (
      <Grid item xs={12} sm={12} md={12}>
        <ReactTable
          {...{
            data: products,
            columns,
            modalToggler: () => {
              setLocationModalOpen(true);
              setSelectedLocation(null);
            }
          }}
        />
        <AlertProductDelete
          id={Number(ProductDeleteId)}
          company_id={user?.company_id}
          title={ProductDeleteId}
          open={open}
          handleClose={handleClose}
          actionDone={setActionDone}
        />
        <ProductModal
          open={isProductModalOpen}
          actionDone={setActionDone}
          modalToggler={setProductModalOpen}
          Product={selectedProduct}
          filters={filter}
        />
        <ProductStockModal
          open={isStockModalOpen}
          onClose={handleCloseStockModal}
          product={selectedProductForStock}
          onAddStock={handleAddStockFromStockModal}
          BusinessUnits={BusinessUnits}
        />
        <RestockProductModal open={isRestockModalOpen} onClose={handleCloseRestockModal} product={selectedProductForStock} />
        <ProductBatchesModal open={isBatchesModalOpen} onClose={handleCloseBatchesModal} product={selectedProductForBatches} />
      </Grid>
    );
  } else {
    productResult = (
      <Grid item xs={12} sx={{ mt: 3 }}>
        <EmptyReactTable columns={columns} />
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
              addTitle={'Add Product'}
              handleAdd={handleAddProduct}
              SerachLable={'Search Product'}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={3}>
              {productResult}
            </Grid>
          </Grid>
        </Grid>
      </Main>
      <FloatingCart />
    </Box>
  );
}
