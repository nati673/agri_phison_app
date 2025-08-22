import React, { useState, useMemo } from 'react';
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
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useGetProductStock } from 'api/products';
import { CloseCircle } from 'iconsax-react';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';

export function ProductStockModal({ open, onClose, product }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const [filters, setFilters] = useState({
    business_unit_id: [],
    location_id: [],
    min_quantity: '',
    max_quantity: '',
    price: '',
    search: ''
  });

  const { productStock, productStockLoading, productStockError, productStockEmpty } = useGetProductStock(product?.product_id);

  const handleFilterChange = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  // Remove a value from filter chips
  const handleChipDelete = (key, value) => {
    if (Array.isArray(filters[key])) {
      handleFilterChange(
        key,
        filters[key].filter((v) => v !== value)
      );
    } else {
      handleFilterChange(key, '');
    }
  };

  // Reset all filters
  const handleClearAllFilters = () => {
    setFilters({
      business_unit_id: [],
      location_id: [],
      min_quantity: '',
      max_quantity: '',
      price: '',
      search: ''
    });
  };

  // Type-safe local filtering
  const filteredStock = useMemo(() => {
    if (!productStock) return [];
    return productStock.filter((stock) => {
      const buId = String(stock.business_unit_id);
      const locId = String(stock.location_id);

      if (filters.business_unit_id.length > 0 && !filters.business_unit_id.map(String).includes(buId)) return false;
      if (filters.location_id.length > 0 && !filters.location_id.map(String).includes(locId)) return false;
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

  // KPI/Report: totals, average price, locations
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

  // Displayed chips for all filter values in use
  const activeChips = [];
  filters.business_unit_id.forEach((id) => {
    const bu = BusinessUnits?.find((bu) => String(bu.business_unit_id) === String(id));
    if (bu)
      activeChips.push({
        key: 'business_unit_id',
        value: id,
        label: `Business unit: ${bu.unit_name}`
      });
  });
  filters.location_id.forEach((id) => {
    const loc = locations?.find((loc) => String(loc.location_id) === String(id));
    if (loc)
      activeChips.push({
        key: 'location_id',
        value: id,
        label: `Location: ${loc.location_name}`
      });
  });
  if (filters.min_quantity)
    activeChips.push({
      key: 'min_quantity',
      value: filters.min_quantity,
      label: `Min Qty ≥ ${filters.min_quantity}`
    });
  if (filters.max_quantity)
    activeChips.push({
      key: 'max_quantity',
      value: filters.max_quantity,
      label: `Max Qty ≤ ${filters.max_quantity}`
    });
  if (filters.price)
    activeChips.push({
      key: 'price',
      value: filters.price,
      label: `Price = $${filters.price}`
    });
  if (filters.search)
    activeChips.push({
      key: 'search',
      value: filters.search,
      label: `Search: ${filters.search}`
    });

  return (
    <Dialog open={open} onClose={onClose} fullScreen maxWidth="xl" fullWidth scroll="paper">
      <DialogTitle>
        Stock for: <strong>{product?.product_name}</strong>
        <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseCircle />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        {/* KPI REPORT */}
        {kpi && (
          <Box sx={{ mb: 2, bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              KPI Report
            </Typography>
            <Typography variant="body2">
              <strong>Total Quantity:</strong> {kpi.totalQty}
            </Typography>
            <Typography variant="body2">
              <strong>Average Price:</strong> ${kpi.avgPrice.toFixed(2)}
            </Typography>
            <Typography variant="body2">
              <strong>Locations Count:</strong> {kpi.locationsCount}
            </Typography>
            <Typography variant="body2">
              <strong>Locations List:</strong> {kpi.locationsList}
            </Typography>
          </Box>
        )}

        {/* FILTERS */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Autocomplete
            multiple
            options={BusinessUnits || []}
            getOptionLabel={(option) => option.unit_name || ''}
            value={
              BusinessUnits ? BusinessUnits.filter((bu) => filters.business_unit_id.map(String).includes(String(bu.business_unit_id))) : []
            }
            onChange={(e, newValue) =>
              handleFilterChange(
                'business_unit_id',
                newValue.map((bu) => String(bu.business_unit_id))
              )
            }
            isOptionEqualToValue={(option, value) => String(option.business_unit_id) === String(value.business_unit_id)}
            renderInput={(params) => <TextField {...params} name="business_unit_id" placeholder="Business unit(s)" fullWidth />}
            sx={{ minWidth: 200 }}
          />
          <Autocomplete
            multiple
            options={locations || []}
            getOptionLabel={(option) => option.location_name || ''}
            value={locations ? locations.filter((loc) => filters.location_id.map(String).includes(String(loc.location_id))) : []}
            onChange={(e, newValue) =>
              handleFilterChange(
                'location_id',
                newValue.map((loc) => String(loc.location_id))
              )
            }
            isOptionEqualToValue={(option, value) => String(option.location_id) === String(value.location_id)}
            renderInput={(params) => <TextField {...params} name="location_id" placeholder="Location(s)" fullWidth />}
            sx={{ minWidth: 200 }}
          />
          <TextField
            label="Min Qty"
            type="number"
            value={filters.min_quantity}
            onChange={(e) => handleFilterChange('min_quantity', e.target.value)}
            sx={{ width: 110 }}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Max Qty"
            type="number"
            value={filters.max_quantity}
            onChange={(e) => handleFilterChange('max_quantity', e.target.value)}
            sx={{ width: 110 }}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Price"
            type="number"
            value={filters.price}
            onChange={(e) => handleFilterChange('price', e.target.value)}
            sx={{ width: 110 }}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <TextField
            label="Search"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            sx={{ width: 180 }}
          />
          <Button onClick={handleClearAllFilters} sx={{ ml: 1, height: 56 }} color="secondary" variant="outlined">
            Clear
          </Button>
        </Box>

        {/* FILTER CHIPS */}
        {activeChips.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
            {activeChips.map((chip, idx) => (
              <Chip key={idx} label={chip.label} onDelete={() => handleChipDelete(chip.key, chip.value)} sx={{ mb: 1 }} />
            ))}
          </Stack>
        )}

        {/* DATA TABLE */}
        {productStockLoading ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : productStockError ? (
          <Typography color="error" sx={{ py: 3 }}>
            Error loading stock. Please try again.
          </Typography>
        ) : productStockEmpty ? (
          <Typography sx={{ py: 3 }}>No stock data found for selected filters.</Typography>
        ) : filteredStock.length === 0 ? (
          <Typography sx={{ py: 3 }}>No stock matches your filters.</Typography>
        ) : (
          <TableContainer sx={{ maxHeight: '65vh' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Location</TableCell>
                  <TableCell>Business Unit</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Min Qty</TableCell>
                  <TableCell align="right">Max Qty</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total Price</TableCell>
                  <TableCell>Last Updated</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStock.map((stock) => (
                  <TableRow key={stock.stock_id}>
                    <TableCell>{stock.location_name}</TableCell>
                    <TableCell>{stock.business_unit}</TableCell>
                    <TableCell align="right">{stock.quantity}</TableCell>
                    <TableCell align="right">{stock.min_quantity}</TableCell>
                    <TableCell align="right">{stock.max_quantity ?? '-'}</TableCell>
                    <TableCell align="right">${stock.unit_price}</TableCell>
                    <TableCell align="right">${stock.total_price}</TableCell>
                    <TableCell>{new Date(stock.last_updated).toLocaleString()}</TableCell>
                  </TableRow>
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
