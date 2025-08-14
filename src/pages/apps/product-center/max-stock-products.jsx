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
import { useGetOverStockedProducts } from 'api/products';
import RoundIconCard from 'components/cards/statistics/RoundIconCard';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';

export default function MaxStockProducts() {
  const { overstockedProducts, overstockedLoading, overstockedError, overstockedEmpty } = useGetOverStockedProducts();

  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'over_by', direction: 'desc' });
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return isNaN(date) ? '-' : date.toISOString().split('T')[0];
  };

  // Transform products
  const products = useMemo(() => {
    return (overstockedProducts || []).map((p) => {
      const qty = Number(p.quantity || 0);
      const maxQty = Number(p.max_quantity || 0);
      const over_by = qty - maxQty;
      const over_pct = maxQty > 0 ? (over_by / maxQty) * 100 : 0;
      return {
        ...p,
        qty,
        maxQty,
        over_by,
        over_pct
      };
    });
  }, [overstockedProducts]);

  const selectedBUObject = (BusinessUnits || []).find((b) => b.business_unit_id === selectedBusinessUnit);

  const locationOptions = selectedBusinessUnit
    ? (selectedBUObject?.locations || []).filter((loc) => loc.location_type !== 'branch')
    : (locations || []).filter((loc) => loc.location_type !== 'branch');

  // KPIs
  const kpis = useMemo(() => {
    if (!products.length) return null;
    const totalProducts = products.length;
    const totalOverUnits = products.reduce((sum, p) => sum + (p.over_by > 0 ? p.over_by : 0), 0);
    const avgOverPct = totalProducts > 0 ? products.reduce((sum, p) => sum + p.over_pct, 0) / totalProducts : 0;
    const totalOverValue = products.reduce((sum, p) => sum + (p.over_by > 0 ? p.over_by * (Number(p.unit_price) || 0) : 0), 0);
    const worstOverProduct = products.reduce((prev, curr) => (curr.over_pct > prev.over_pct ? curr : prev), products[0]);

    return { totalProducts, totalOverUnits, avgOverPct, totalOverValue, worstOverProduct };
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
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const csvHeaders = [
    { label: 'Product Name', key: 'product_name' },
    { label: 'SKU', key: 'sku' },
    { label: 'Unit', key: 'product_unit' },
    { label: 'Quantity', key: 'qty' },
    { label: 'Max Quantity', key: 'maxQty' },
    { label: 'Over By (Units)', key: 'over_by' },
    { label: 'Over By (%)', key: 'over_pct' },
    { label: 'Unit Price', key: 'unit_price' },
    { label: 'Location', key: 'location_name' },
    { label: 'Business Unit', key: 'business_unit_name' },
    { label: 'Expires At', key: 'expires_at' }
  ];

  return (
    <>
      {/* KPI CARDS */}
      {!overstockedLoading && kpis && !overstockedEmpty && (
        <Grid container spacing={2} sx={{ px: 2, pb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <RoundIconCard
              primary="Total Overstocked"
              secondary={kpis.totalProducts.toLocaleString()}
              content="Current calculated total"
              iconPrimary={ProductsIcon}
              color="primary.darker"
              bgcolor="primary.lighter"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <RoundIconCard
              primary="Overstocked Units"
              secondary={kpis.totalOverUnits.toLocaleString()}
              content="All units above set max"
              iconPrimary={UnitsIcon}
              color="warning.darker"
              bgcolor="warning.lighter"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <RoundIconCard
              primary="Average Over %"
              secondary={`${kpis.avgOverPct.toFixed(1)}%`}
              content="Across all products"
              iconPrimary={PercentIcon}
              color="success.darker"
              bgcolor="success.lighter"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <RoundIconCard
              primary="Overstock Value"
              secondary={`Birr ${kpis.totalOverValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              content="Monetary value over stock"
              iconPrimary={ValueIcon}
              color="error.darker"
              bgcolor="error.lighter"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <RoundIconCard
              primary="Worst Over % Product"
              secondary={`${kpis.worstOverProduct.product_name} (${kpis.worstOverProduct.over_pct.toFixed(1)}%)`}
              content="Highest percentage above max"
              iconPrimary={PercentIcon}
              color="secondary.darker"
              bgcolor="secondary.lighter"
            />
          </Grid>
        </Grid>
      )}

      <MainCard
        content={false}
        title="Overstocked Products"
        secondary={
          sorted.length > 0 && (
            <CSVExport
              data={sorted.map((p) => ({
                ...p,
                over_pct: p.over_pct.toFixed(2) + '%',
                expires_at: formatDate(p.expires_at)
              }))}
              headers={csvHeaders}
              filename="overstocked-products.csv"
            />
          )
        }
      >
        <Box p={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* Business Unit Filter */}
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

            {/* Search Field */}
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
        {overstockedLoading ? (
          <Box p={3} display="flex" justifyContent="center">
            <CircularProgress size={28} />
          </Box>
        ) : overstockedError ? (
          <Box p={3}>
            <Typography color="error">Failed to load products.</Typography>
          </Box>
        ) : overstockedEmpty ? (
          <Box p={3} textAlign="center">
            <Typography>No overstocked products found.</Typography>
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
                    { key: 'maxQty', label: 'Max Qty', align: 'right' },
                    { key: 'over_by', label: 'Over By', align: 'right' },
                    { key: 'over_pct', label: 'Over %', align: 'right' },
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
                  const overColor = p.over_pct >= 100 ? 'error' : p.over_pct >= 50 ? 'warning' : 'success';
                  return (
                    <TableRow hover key={p.product_id}>
                      <TableCell>{p.product_name}</TableCell>
                      <TableCell>{p.sku}</TableCell>
                      <TableCell>{p.product_unit}</TableCell>
                      <TableCell align="right">{p.qty}</TableCell>
                      <TableCell align="right">{p.maxQty}</TableCell>
                      <TableCell align="right">
                        <Chip label={p.over_by} color={overColor} size="small" />
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={`${p.over_pct.toFixed(1)}%`} color={overColor} size="small" />
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
