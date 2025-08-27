import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  TextField,
  CircularProgress,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Autocomplete,
  Chip,
  Stack,
  useMediaQuery,
  Tooltip,
  Collapse,
  Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { updateProductBatch, useGetProductStock } from 'api/products';
import { CloseCircle, Refresh, Edit, ArrowDown, ArrowUp, AddSquare, CalendarAdd, MoneyRecive, Building3 } from 'iconsax-react';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import EcommerceMetrix from 'components/cards/statistics/EcommerceMetrix';
import RestockProductModal from './RestockProductModal';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import toast from 'react-hot-toast';

// Empty-state component for adding stock
function NoStockFound({ product, onAddStock, onCloseCurrentModal }) {
  return (
    <Box
      sx={{
        p: 4,
        textAlign: 'center',
        bgcolor: 'grey.100',
        borderRadius: 2,
        boxShadow: 0,
        my: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <AddSquare size="48" color="#555" style={{ marginBottom: 12 }} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        No stock found for <strong>{product?.product_name}</strong>
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        It looks like this product isn't available at any location yet.
        <br />
        To add the first stock entry for this product, click below.
      </Typography>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onAddStock(); // Call parent handler
        }}
        variant="contained"
        color="primary"
        size="large"
        startIcon={<AddSquare />}
      >
        Add Stock
      </Button>
    </Box>
  );
}
function EditableBatchCell({ value, field, batchId, businessUnitId, locationId, onUpdate }) {
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState(field.includes('date') && value ? value.split('T')[0] : value);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNewValue(field.includes('date') && value ? value.split('T')[0] : value);
  }, [value]);

  const handleSave = async () => {
    if (newValue !== value) {
      setLoading(true);
      try {
        await onUpdate(batchId, { [field]: newValue, business_unit_id: businessUnitId, location_id: locationId });
      } catch (e) {
        // handle error (propagate to parent if needed)
      }
      setLoading(false);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        type={field.includes('date') ? 'date' : 'text'}
        value={newValue || ''}
        autoFocus
        onChange={(e) => setNewValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
        }}
        style={{ minWidth: 80 }}
        disabled={loading}
      />
    );
  }

  return (
    <span
      style={{ cursor: 'pointer', background: '#fafbfd', padding: 3, borderRadius: 2 }}
      onDoubleClick={() => setEditing(true)}
      title="Double-click to edit"
    >
      {field.includes('date') ? (value ? new Date(value).toLocaleDateString() : '-') : value || '-'}
    </span>
  );
}
export function ProductStockModal({ open, onClose, product, onAddStock, BusinessUnits }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  // const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();

  const [isStockModalOpen, setStockModalOpen] = useState(false);

  const handleOpenStockModal = () => setStockModalOpen(true);
  const handleCloseStockModal = () => setStockModalOpen(false);

  // ✅ Single ID for filters, not arrays
  const [filters, setFilters] = useState({
    business_unit_id: '',
    location_id: '',
    min_quantity: '',
    max_quantity: '',
    price: '',
    search: ''
  });

  const [expanded, setExpanded] = useState({});

  const { productStock, productStockLoading, productStockError, productStockEmpty, refetch } = useGetProductStock(product?.product_id);

  useEffect(() => {
    if (open && product?.product_id) {
      refetch();
    }
  }, [open, product?.product_id, refetch]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChipDelete = (key) => {
    setFilters((prev) => ({
      ...prev,
      [key]: ''
    }));
  };

  const handleClearAllFilters = () =>
    setFilters({
      business_unit_id: '',
      location_id: '',
      min_quantity: '',
      max_quantity: '',
      price: '',
      search: ''
    });

  // Filtering logic
  const filteredStock = useMemo(() => {
    if (!productStock) return [];
    return productStock.filter((stock) => {
      const buId = String(stock.business_unit_id);
      const locId = String(stock.location_id);
      if (filters.business_unit_id && String(filters.business_unit_id) !== buId) return false;
      if (filters.location_id && String(filters.location_id) !== locId) return false;
      if (filters.min_quantity && Number(stock.quantity) < Number(filters.min_quantity)) return false;
      if (filters.max_quantity && Number(stock.quantity) > Number(filters.max_quantity)) return false;
      if (filters.price && Number(stock.unit_price) !== Number(filters.price)) return false;
      if (filters.search) {
        const searchStr = filters.search.toLowerCase();
        if (
          !(
            stock.location_name?.toLowerCase().includes(searchStr) ||
            stock.business_unit?.toLowerCase().includes(searchStr) ||
            stock.product_name?.toLowerCase().includes(searchStr)
          )
        )
          return false;
      }
      return true;
    });
  }, [productStock, filters]);

  // KPI summary
  const kpi = useMemo(() => {
    if (!filteredStock || filteredStock.length === 0) return null;
    const totalQty = filteredStock.reduce((sum, x) => sum + Number(x.quantity), 0);
    const avgPrice = filteredStock.reduce((sum, x) => sum + Number(x.unit_price), 0) / filteredStock.length;
    const locationsSet = new Set(filteredStock.map((x) => x.location_name));
    return {
      totalQty,
      avgPrice,
      locationsCount: locationsSet.size,
      locationsList: Array.from(locationsSet).join(', ')
    };
  }, [filteredStock]);

  // Active filter chips
  const activeChips = [];
  if (filters.business_unit_id) {
    const bu = BusinessUnits?.find((bu) => String(bu.business_unit_id) === String(filters.business_unit_id));
    if (bu)
      activeChips.push({
        key: 'business_unit_id',
        label: `Business unit: ${bu.unit_name}`
      });
  }
  if (filters.location_id) {
    const loc = locations?.find((loc) => String(loc.location_id) === String(filters.location_id));
    if (loc)
      activeChips.push({
        key: 'location_id',
        label: `Location: ${loc.location_name}`
      });
  }
  if (filters.min_quantity)
    activeChips.push({
      key: 'min_quantity',
      label: `Min Qty ≥ ${filters.min_quantity}`
    });
  if (filters.max_quantity)
    activeChips.push({
      key: 'max_quantity',
      label: `Max Qty ≤ ${filters.max_quantity}`
    });
  if (filters.price)
    activeChips.push({
      key: 'price',
      label: `Price = $${filters.price}`
    });
  if (filters.search)
    activeChips.push({
      key: 'search',
      label: `Search: ${filters.search}`
    });

  const handleExpandClick = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  const handleBatchFieldUpdate = async (batchId, payload) => {
    try {
      const result = await updateProductBatch(batchId, payload);
      if (result.success) {
        toast.success(result.message);
        refetch();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const showNoStock = !productStockLoading && productStock.length === 0;

  return (
    <Dialog open={open} onClose={onClose} fullScreen={fullScreen} maxWidth="xl" fullWidth scroll="paper" sx={{ zIndex: 1400 }}>
      <DialogTitle sx={{ position: 'relative' }}>
        Stock for <strong>{product?.product_name}</strong>
        <IconButton aria-label="close" color="error" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseCircle color="red" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        {kpi && (
          <Box sx={{ mb: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <EcommerceMetrix
                  primary="Total Quantity"
                  secondary={kpi ? kpi.totalQty : 0}
                  color={theme.palette.primary.main}
                  iconPrimary={CalendarAdd}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <EcommerceMetrix
                  primary="Avg Unit Price"
                  secondary={kpi ? `ETB ${kpi.avgPrice.toFixed(2)}` : 'ETB 0.00'}
                  color={theme.palette.secondary.main}
                  iconPrimary={MoneyRecive}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <EcommerceMetrix
                  primary="Locations With Stock"
                  secondary={kpi ? kpi.locationsCount : 0}
                  color={theme.palette.warning.main}
                  iconPrimary={Building3}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* FILTERS */}
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2} alignItems="flex-end">
            {/* Business Unit */}
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={BusinessUnits || []}
                getOptionLabel={(opt) => opt.unit_name || ''}
                value={BusinessUnits?.find((bu) => String(bu.business_unit_id) === String(filters.business_unit_id)) || null}
                onChange={(e, newVal) => handleFilterChange('business_unit_id', newVal ? String(newVal.business_unit_id) : '')}
                renderOption={(props, option, { selected, inputValue }) =>
                  renderBusinessUnitOption(props, option, {
                    selected,
                    inputValue
                  })
                }
                isOptionEqualToValue={(o, v) => String(o.business_unit_id) === String(v.business_unit_id)}
                renderInput={(params) => <TextField {...params} label="Business Unit" size="small" />}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={locations || []}
                getOptionLabel={(option) => option.location_name || ''}
                value={locations?.find((loc) => String(loc.location_id) === String(filters.location_id)) || null}
                onChange={(e, newValue) => handleFilterChange('location_id', newValue ? String(newValue.location_id) : '')}
                isOptionEqualToValue={(option, value) => String(option.location_id) === String(value.location_id)}
                renderInput={(params) => <TextField {...params} name="location_id" placeholder="Location" fullWidth />}
              />
            </Grid>

            {/* Min Qty */}
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Min Qty"
                type="number"
                value={filters.min_quantity}
                onChange={(e) => handleFilterChange('min_quantity', e.target.value)}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Max Qty */}
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Max Qty"
                type="number"
                value={filters.max_quantity}
                onChange={(e) => handleFilterChange('max_quantity', e.target.value)}
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>

            {/* Price */}
            <Grid item xs={6} sm={4} md={2}>
              <TextField
                label="Price"
                type="number"
                value={filters.price}
                onChange={(e) => handleFilterChange('price', e.target.value)}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            {/* Search */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField label="Search" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} fullWidth />
            </Grid>
          </Grid>
        </Box>

        {/* FILTER CHIPS */}
        {activeChips.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
            {activeChips.map((chip, idx) => (
              <Chip key={idx} label={chip.label} onDelete={() => handleChipDelete(chip.key)} sx={{ mb: 1 }} />
            ))}
          </Stack>
        )}

        {/* Onboarding/Empty State */}
        {showNoStock && <NoStockFound product={product} onCloseCurrentModal={onClose} onAddStock={onAddStock} />}

        {/* Error Loading */}
        {productStockError && (
          <Typography color="error" sx={{ py: 3 }}>
            Error loading stock. Please try again.
          </Typography>
        )}

        {/* Loading Spinner */}
        {productStockLoading && (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Data Table */}
        {/* STOCK TABLE */}
        {productStock?.length > 0 && filteredStock.length > 0 && (
          <TableContainer sx={{ maxHeight: '65vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell>Business Unit</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Min Qty</TableCell>
                  <TableCell align="right">Max Qty</TableCell>
                  {/* <TableCell align="right">Unit Price</TableCell> */}
                  {/* <TableCell align="right">Total Price</TableCell> */}
                  <TableCell>Last Updated</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStock.map((stock) => (
                  <React.Fragment key={stock.stock_id}>
                    {/* STOCK ROW */}
                    <TableRow hover>
                      <TableCell>{stock.location_name}</TableCell>
                      <TableCell>{stock.business_unit}</TableCell>
                      <TableCell align="right">{stock.quantity}</TableCell>
                      <TableCell align="right">{stock.min_quantity}</TableCell>
                      <TableCell align="right">{stock.max_quantity ?? '-'}</TableCell>
                      {/* <TableCell align="right">ETB {stock.unit_price}</TableCell> */}
                      {/* <TableCell align="right">ETB {stock.total_price}</TableCell> */}
                      <TableCell>{new Date(stock.last_updated).toLocaleString()}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={expanded[stock.stock_id] ? 'Hide Batches' : 'Show Batches'}>
                          <IconButton size="small" onClick={() => handleExpandClick(stock.stock_id)}>
                            {expanded[stock.stock_id] ? <ArrowUp /> : <ArrowDown />}
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>

                    {/* BATCHES ROW */}
                    <TableRow>
                      <TableCell colSpan={9} sx={{ p: 0, border: 0 }}>
                        <Collapse in={expanded[stock.stock_id]} timeout="auto" unmountOnExit>
                          <Box sx={{ bgcolor: 'grey.100', p: 2 }}>
                            <Typography variant="subtitle2" mb={1}>
                              Batches for {stock.product_name}
                            </Typography>

                            {stock.batches?.length > 0 ? (
                              <Table size="small">
                                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                                  <TableRow>
                                    <TableCell>Batch Code</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="right">Initial Quantity</TableCell>
                                    <TableCell align="right">Purchase Price</TableCell>
                                    <TableCell align="right">Selling Price</TableCell>
                                    <TableCell>Manufacture Date</TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell>Created At</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {stock.batches.map((batch) => (
                                    <TableRow key={batch.batch_id}>
                                      <TableCell>
                                        <EditableBatchCell
                                          value={batch.batch_code}
                                          field="batch_code"
                                          batchId={batch.batch_id}
                                          businessUnitId={stock.business_unit_id}
                                          locationId={stock.location_id}
                                          onUpdate={handleBatchFieldUpdate}
                                        />
                                      </TableCell>
                                      <TableCell align="right">{parseFloat(batch.quantity).toLocaleString()}</TableCell>
                                      <TableCell align="right">{parseFloat(batch.initial_quantity).toLocaleString()}</TableCell>
                                      <TableCell align="right">
                                        ETB {parseFloat(batch.purchase_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </TableCell>
                                      <TableCell align="right">
                                        ETB {parseFloat(batch.selling_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                      </TableCell>
                                      <TableCell>
                                        <EditableBatchCell
                                          value={batch.manufacture_date}
                                          field="manufacture_date"
                                          batchId={batch.batch_id}
                                          businessUnitId={stock.business_unit_id}
                                          locationId={stock.location_id}
                                          onUpdate={handleBatchFieldUpdate}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <EditableBatchCell
                                          value={batch.expiry_date}
                                          field="expiry_date"
                                          batchId={batch.batch_id}
                                          businessUnitId={stock.business_unit_id}
                                          locationId={stock.location_id}
                                          onUpdate={handleBatchFieldUpdate}
                                        />
                                      </TableCell>
                                      <TableCell>{batch.created_at ? new Date(batch.created_at).toLocaleString() : '-'}</TableCell>
                                    </TableRow>
                                  ))}
                                  {(() => {
                                    const batchTotals = stock.batches.reduce(
                                      (acc, batch) => ({
                                        quantity: acc.quantity + Number(batch.quantity),
                                        purchase: acc.purchase + Number(batch.quantity) * Number(batch.purchase_price),
                                        selling: acc.selling + Number(batch.quantity) * Number(batch.selling_price)
                                      }),
                                      { quantity: 0, purchase: 0, selling: 0 }
                                    );
                                    return (
                                      <TableRow sx={{ backgroundColor: '#E3C84C', fontWeight: 'bold' }}>
                                        <TableCell colSpan={1} sx={{ fontWeight: 'bold' }}>
                                          Total
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                          {batchTotals.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell />
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                          ETB {batchTotals.purchase.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                          ETB {batchTotals.selling.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell colSpan={3} />
                                      </TableRow>
                                    );
                                  })()}
                                </TableBody>
                              </Table>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No batches found for this stock.
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
