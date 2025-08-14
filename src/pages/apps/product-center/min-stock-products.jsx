import React, { useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
  Typography,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Stack,
  Grid,
  Autocomplete
} from '@mui/material';
import {
  ArrowDown,
  ArrowUp,
  CloseSquare,
  SearchNormal,
  Box1 as ProductsIcon,
  Archive as UnitsIcon,
  PercentageCircle as PercentIcon,
  Money4 as ValueIcon
} from 'iconsax-react';

import MainCard from 'components/MainCard';
import { CSVExport } from 'components/third-party/react-table';
import { useGetSmallQuantityProducts } from 'api/products';
import RoundIconCard from 'components/cards/statistics/RoundIconCard';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';

export default function LowStockProducts() {
  const { smallQtyProducts, smallQtyLoading, smallQtyError, smallQtyEmpty } = useGetSmallQuantityProducts();
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();

  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'below_by', direction: 'desc' });
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return isNaN(date) ? '-' : date.toISOString().split('T')[0];
  };

  // Transform products
  const products = useMemo(() => {
    return (smallQtyProducts || []).map((p) => {
      const qty = Number(p.quantity || 0);
      const minQty = Number(p.min_quantity || 0);
      const below_by = minQty - qty;
      const below_pct = minQty > 0 ? (below_by / minQty) * 100 : 0;
      return {
        ...p,
        qty,
        minQty,
        below_by: below_by > 0 ? below_by : 0,
        below_pct: below_pct > 0 ? below_pct : 0
      };
    });
  }, [smallQtyProducts]);

  const selectedBUObject = (BusinessUnits || []).find((b) => b.business_unit_id === selectedBusinessUnit);

  const locationOptions = selectedBusinessUnit
    ? (selectedBUObject?.locations || []).filter((loc) => loc.location_type !== 'branch')
    : (locations || []).filter((loc) => loc.location_type !== 'branch');

  // KPIs
  const kpis = useMemo(() => {
    if (!products.length) return null;
    const totalProducts = products.length;
    const totalBelowUnits = products.reduce((sum, p) => sum + p.below_by, 0);
    const avgBelowPct = totalProducts > 0 ? products.reduce((sum, p) => sum + p.below_pct, 0) / totalProducts : 0;
    const totalBelowValue = products.reduce((sum, p) => sum + p.below_by * (Number(p.unit_price) || 0), 0);
    const worstBelowProduct = products.reduce((prev, curr) => (curr.below_pct > prev.below_pct ? curr : prev), products[0]);

    return { totalProducts, totalBelowUnits, avgBelowPct, totalBelowValue, worstBelowProduct };
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        (p.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.location_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.business_unit_name || '').toLowerCase().includes(search.toLowerCase());

      const matchesBU = !selectedBusinessUnit || p.business_unit_id === selectedBusinessUnit;
      const matchesLocation = !selectedLocation || p.location_id === selectedLocation;
      return matchesSearch && matchesBU && matchesLocation;
    });
  }, [products, search, selectedBusinessUnit, selectedLocation]);

  const sorted = useMemo(() => {
    const sortedData = [...filtered];
    sortedData.sort((a, b) => {
      const aVal = a[sortConfig.key] ?? '';
      const bVal = b[sortConfig.key] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortConfig.direction === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });
    return sortedData;
  }, [filtered, sortConfig]);

  const requestSort = (key) => {
    setSortConfig((prev) => (prev.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }));
  };

  const csvHeaders = [
    { label: 'Product Name', key: 'product_name' },
    { label: 'SKU', key: 'sku' },
    { label: 'Unit', key: 'product_unit' },
    { label: 'Quantity', key: 'qty' },
    { label: 'Min Quantity', key: 'minQty' },
    { label: 'Below By (Units)', key: 'below_by' },
    { label: 'Below By (%)', key: 'below_pct' },
    { label: 'Unit Price', key: 'unit_price' },
    { label: 'Location', key: 'location_name' },
    { label: 'Business Unit', key: 'business_unit_name' },
    { label: 'Expires At', key: 'expires_at' }
  ];

  return (
    <>
      {/* KPI Cards */}
      {!smallQtyLoading && kpis && !smallQtyEmpty && (
        <Grid container spacing={2} sx={{ px: 2, pb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <RoundIconCard
              primary="Total Low Stock"
              secondary={kpis.totalProducts.toLocaleString()}
              content="Total products below min quantity"
              iconPrimary={ProductsIcon}
              color="warning.darker"
              bgcolor="warning.lighter"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <RoundIconCard
              primary="Shortage Units"
              secondary={kpis.totalBelowUnits.toLocaleString()}
              content="Total units below min"
              iconPrimary={UnitsIcon}
              color="error.darker"
              bgcolor="error.lighter"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <RoundIconCard
              primary="Average Shortage %"
              secondary={`${kpis.avgBelowPct.toFixed(1)}%`}
              content="Across all low stock products"
              iconPrimary={PercentIcon}
              color="primary.darker"
              bgcolor="primary.lighter"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <RoundIconCard
              primary="Shortage Value"
              secondary={`Birr ${kpis.totalBelowValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              content="Value of shortage"
              iconPrimary={ValueIcon}
              color="secondary.darker"
              bgcolor="secondary.lighter"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <RoundIconCard
              primary="Worst Shortage Product"
              secondary={`${kpis.worstBelowProduct.product_name} (${kpis.worstBelowProduct.below_pct.toFixed(1)}%)`}
              content="Highest % below min"
              iconPrimary={PercentIcon}
              color="error.darker"
              bgcolor="error.lighter"
            />
          </Grid>
        </Grid>
      )}

      <MainCard
        content={false}
        title="Low Stock Products"
        secondary={
          sorted.length > 0 && (
            <CSVExport
              data={sorted.map((p) => ({
                ...p,
                below_pct: p.below_pct.toFixed(2) + '%',
                expires_at: formatDate(p.expires_at)
              }))}
              headers={csvHeaders}
              filename="low-stock-products.csv"
            />
          )
        }
      >
        <Box p={2}>
          {/* Filters */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Autocomplete
              size="small"
              options={BusinessUnits || []}
              getOptionLabel={(option) => option.unit_name || ''}
              value={(BusinessUnits || []).find((b) => b.business_unit_id === selectedBusinessUnit) || null}
              renderOption={renderBusinessUnitOption}
              onChange={(_, newValue) => setSelectedBusinessUnit(newValue?.business_unit_id || '')}
              renderInput={(params) => <TextField {...params} placeholder="Select business unit" fullWidth />}
              sx={{ width: 220 }}
              clearOnEscape
            />
            <Autocomplete
              size="small"
              options={locationOptions}
              getOptionLabel={(option) => `${option.location_name || ''} (${option.location_type || ''})`}
              value={(locations || []).find((l) => l.location_id === selectedLocation) || null}
              onChange={(_, newValue) => setSelectedLocation(newValue?.location_id || '')}
              renderOption={renderLocationOption}
              renderInput={(params) => <TextField {...params} placeholder="Select location" fullWidth />}
              sx={{ width: 220 }}
              clearOnEscape
            />
            <TextField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              label="Search"
              placeholder="Search by name, SKU, location, business unit"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchNormal fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <CloseSquare fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ width: 300 }}
            />
          </Stack>
        </Box>

        {/* States */}
        {smallQtyLoading ? (
          <Box p={3} display="flex" justifyContent="center">
            <CircularProgress size={28} />
          </Box>
        ) : smallQtyError ? (
          <Box p={3}>
            <Typography color="error">Failed to load products.</Typography>
          </Box>
        ) : smallQtyEmpty ? (
          <Box p={3} textAlign="center">
            <Typography>No low stock products found.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {[
                    { key: 'product_name', label: 'Product Name' },
                    { key: 'sku', label: 'SKU' },
                    { key: 'product_unit', label: 'Unit' },
                    { key: 'qty', label: 'Quantity', align: 'right' },
                    { key: 'minQty', label: 'Min Qty', align: 'right' },
                    { key: 'below_by', label: 'Below By', align: 'right' },
                    { key: 'below_pct', label: 'Below %', align: 'right' },
                    { key: 'unit_price', label: 'Unit Price', align: 'right' },
                    { key: 'location_name', label: 'Location' },
                    { key: 'business_unit_name', label: 'Business Unit' },
                    { key: 'expires_at', label: 'Expires' }
                  ].map((col) => (
                    <TableCell
                      key={col.key}
                      align={col.align || 'left'}
                      sx={{ fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => requestSort(col.key)}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {col.label}
                        {sortConfig.key === col.key && (sortConfig.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                      </Stack>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sorted.map((p) => {
                  const shortageColor = p.below_pct >= 75 ? 'error' : p.below_pct >= 50 ? 'warning' : 'success';
                  return (
                    <TableRow hover key={p.product_id}>
                      <TableCell>{p.product_name}</TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>{p.product_unit}</TableCell>
                      <TableCell align="right">{p.qty}</TableCell>
                      <TableCell align="right">{p.minQty}</TableCell>
                      <TableCell align="right">
                        <Chip label={p.below_by} color={shortageColor} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={`${p.below_pct.toFixed(1)}%`} color={shortageColor} size="small" />
                      </TableCell>
                      <TableCell align="right">{p.unit_price}</TableCell>
                      <TableCell>{p.location_name}</TableCell>
                      <TableCell>{p.business_unit_name}</TableCell>
                      <TableCell>{formatDate(p.expires_at)}</TableCell>
                    </TableRow>
                  );
                })}
                {sorted.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                      No products match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>
    </>
  );
}
