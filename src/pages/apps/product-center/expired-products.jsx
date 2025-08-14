// pages/ExpiredProducts.js
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
  Autocomplete,
  Popper
} from '@mui/material';
import {
  ArrowDown,
  ArrowUp,
  CloseSquare,
  SearchNormal,
  Box1 as ProductsIcon,
  Archive as UnitsIcon,
  Money4 as ValueIcon,
  Warning2 as ExpiredIcon,
  Warning2
} from 'iconsax-react';

import MainCard from 'components/MainCard';
import { CSVExport } from 'components/third-party/react-table';
import { useGetExpiredProducts } from 'api/products';
import RoundIconCard from 'components/cards/statistics/RoundIconCard';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import WiderPopper from 'components/inputs/WiderPopper';
const priorityColors = {
  Expired: 'error',
  Critical: 'error',
  Medium: 'warning',
  Low: 'info',
  Safe: 'success'
};

const priorityIcons = {
  Expired: <Warning2 size={16} />,
  Critical: <Warning2 size={16} />,
  Medium: <Warning2 size={16} />,
  Low: <Warning2 size={16} />,
  Safe: null
};
export default function ExpiredProductsPage() {
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'expires_at', direction: 'asc' });
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [expiryFilter, setExpiryFilter] = useState('all');
  const [horizon, setHorizon] = useState('3m');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const includeParam = expiryFilter === 'all' ? 'expired,soon_expire' : expiryFilter;

  const { expiredProducts, expiredLoading, expiredError, expiredEmpty } = useGetExpiredProducts({ horizon, include: includeParam });

  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return isNaN(date) ? '-' : date.toISOString().split('T')[0];
  };

  // Filter lists
  const selectedBUObject = (BusinessUnits || []).find((b) => b.business_unit_id === selectedBusinessUnit);
  const locationOptions = selectedBusinessUnit
    ? (selectedBUObject?.locations || []).filter((loc) => loc.location_type !== 'branch')
    : (locations || []).filter((loc) => loc.location_type !== 'branch');

  const products = useMemo(() => expiredProducts || [], [expiredProducts]);
  // Search filter
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
      const matchesPriority = priorityFilter === 'all' || p.priority_level === priorityFilter;

      return matchesSearch && matchesBU && matchesLocation && matchesPriority;
    });
  }, [products, search, selectedBusinessUnit, selectedLocation, priorityFilter]);

  // KPI
  const kpis = useMemo(() => {
    if (!filtered.length) return null;
    const totalItems = filtered.length;
    const totalUnitsAffected = filtered.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);
    const totalValueAffected = filtered.reduce((sum, p) => sum + (Number(p.quantity) || 0) * (Number(p.unit_price) || 0), 0);
    const oldestProduct = filtered.reduce(
      (prev, curr) => (new Date(curr.expires_at) < new Date(prev.expires_at) ? curr : prev),
      filtered[0]
    );
    return { totalItems, totalUnitsAffected, totalValueAffected, oldestProduct };
  }, [filtered]);
  const kpiByPriority = useMemo(() => {
    const groups = {};
    filtered.forEach((p) => {
      if (!groups[p.priority_level]) groups[p.priority_level] = { count: 0, value: 0 };
      groups[p.priority_level].count++;
      groups[p.priority_level].value += p.inventory_value || 0;
    });
    return groups;
  }, [filtered]);

  // Sorting
  const sorted = useMemo(() => {
    const sortedData = [...filtered];
    sortedData.sort((a, b) => {
      const aVal = a[sortConfig.key] ?? '';
      const bVal = b[sortConfig.key] ?? '';
      if (sortConfig.key === 'expires_at') {
        return sortConfig.direction === 'asc' ? new Date(aVal) - new Date(bVal) : new Date(bVal) - new Date(aVal);
      }
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
    { label: 'Product', key: 'product_name' },
    { label: 'SKU', key: 'sku' },
    { label: 'Unit', key: 'product_unit' },
    { label: 'Quantity', key: 'quantity' },
    { label: 'Location', key: 'location_name' },
    { label: 'Business Unit', key: 'business_unit_name' },
    { label: 'Expired Date', key: 'expires_at' },
    { label: 'Expiry Type', key: 'expiry_type' },
    { label: 'Days Left', key: 'days_to_expiry' },
    { label: 'Inventory Value', key: 'inventory_value' }
  ];
  const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return '-';
    return `Birr ${Number(amount).toLocaleString('en-ET', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  return (
    <>
      {/* KPI */}
      {!expiredLoading && kpis && !expiredEmpty && (
        <Grid container spacing={2} sx={{ px: 2, pb: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <RoundIconCard
              primary="Total Items"
              secondary={kpis.totalItems.toLocaleString()}
              content="Expired or Soon Expire"
              iconPrimary={ProductsIcon}
              color="error.darker"
              bgcolor="error.lighter"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <RoundIconCard
              primary="Units Affected"
              secondary={kpis.totalUnitsAffected.toLocaleString()}
              content="Total quantity"
              iconPrimary={UnitsIcon}
              color="warning.darker"
              bgcolor="warning.lighter"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <RoundIconCard
              primary="Value Affected"
              secondary={`Birr ${kpis.totalValueAffected.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              content="Monetary risk/loss"
              iconPrimary={ValueIcon}
              color="primary.darker"
              bgcolor="primary.lighter"
            />
          </Grid>
        </Grid>
      )}

      <MainCard
        content={false}
        title="Expired / Soon Expire Products"
        secondary={
          sorted.length > 0 && (
            <CSVExport
              data={sorted.map((p) => ({
                ...p,
                expires_at: formatDate(p.expires_at)
              }))}
              headers={csvHeaders}
              filename="products-expiry.csv"
            />
          )
        }
      >
        <Box p={2}>
          <Grid container spacing={1.5}>
            {/* Search */}
            <Grid item xs={12} sm={6} md={3} lg={2.5}>
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                placeholder="Search by name, SKU, location, BU"
                fullWidth
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
              />
            </Grid>

            {/* Expiry Type */}
            <Grid item xs={12} sm={6} md={2.5} lg={2}>
              <Autocomplete
                size="small"
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Expired Only', value: 'expired' },
                  { label: 'Soon Expire Only', value: 'soon_expire' }
                ]}
                getOptionLabel={(o) => o.label}
                value={[
                  { label: 'All', value: 'all' },
                  { label: 'Expired Only', value: 'expired' },
                  { label: 'Soon Expire Only', value: 'soon_expire' }
                ].find((o) => o.value === expiryFilter)}
                onChange={(_, v) => setExpiryFilter(v?.value ?? 'all')}
                renderInput={(params) => <TextField {...params} placeholder="Expiry type" fullWidth />}
                clearOnEscape
              />
            </Grid>

            {/* Horizon */}
            <Grid item xs={12} sm={6} md={2} lg={1.8}>
              <Autocomplete
                size="small"
                options={[
                  { label: '7 days', value: '7d' },
                  { label: '30 days', value: '30d' },
                  { label: '3 months', value: '3m' },
                  { label: '6 months', value: '6m' }
                ]}
                getOptionLabel={(o) => o.label}
                value={[
                  { label: '7 days', value: '7d' },
                  { label: '30 days', value: '30d' },
                  { label: '3 months', value: '3m' },
                  { label: '6 months', value: '6m' }
                ].find((o) => o.value === horizon)}
                onChange={(_, v) => setHorizon(v?.value ?? '3m')}
                renderInput={(params) => <TextField {...params} placeholder="Horizon" fullWidth />}
                clearOnEscape
              />
            </Grid>

            {/* Business unit */}
            <Grid item xs={12} sm={6} md={2.5} lg={2}>
              <Autocomplete
                size="small"
                options={BusinessUnits || []}
                getOptionLabel={(option) => option.unit_name || ''}
                value={(BusinessUnits || []).find((b) => b.business_unit_id === selectedBusinessUnit) || null}
                renderOption={renderBusinessUnitOption}
                onChange={(_, v) => setSelectedBusinessUnit(v?.business_unit_id || '')}
                renderInput={(params) => <TextField {...params} placeholder="Select business unit" fullWidth />}
                clearOnEscape
                PopperComponent={WiderPopper}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12} sm={6} md={2.5} lg={2}>
              <Autocomplete
                size="small"
                options={locationOptions}
                getOptionLabel={(option) => `${option.location_name || ''} (${option.location_type || ''})`}
                value={(locations || []).find((l) => l.location_id === selectedLocation) || null}
                onChange={(_, v) => setSelectedLocation(v?.location_id || '')}
                renderOption={renderLocationOption}
                renderInput={(params) => <TextField {...params} placeholder="Select location" fullWidth />}
                clearOnEscape
                PopperComponent={WiderPopper}
              />
            </Grid>
          </Grid>
        </Box>

        <Stack direction="row" spacing={1} p={2}>
          {['all', 'Expired', 'Critical', 'Medium', 'Low', 'Safe'].map((label) => (
            <Chip
              key={label}
              label={`${label}${label !== 'all' && kpiByPriority[label] ? ` (${kpiByPriority[label].count})` : ''}`}
              onClick={() => setPriorityFilter(label)}
              color={priorityColors[label] || 'default'}
              variant={priorityFilter === label ? 'filled' : 'outlined'}
              icon={priorityIcons[label] || null}
            />
          ))}
        </Stack>

        {/* States */}
        {expiredLoading ? (
          <Box p={3} display="flex" justifyContent="center">
            <CircularProgress size={28} />
          </Box>
        ) : expiredError ? (
          <Box p={3}>
            <Typography color="error">Failed to load data.</Typography>
          </Box>
        ) : expiredEmpty ? (
          <Box p={3} textAlign="center">
            <Typography>No products found.</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {csvHeaders.map((col) => (
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
                {sorted.map((p) => (
                  <TableRow hover key={p.product_id}>
                    <TableCell>{p.product_name}</TableCell>
                    <TableCell>{p.sku}</TableCell>
                    <TableCell>{p.product_unit}</TableCell>
                    <TableCell align="right">{p.quantity}</TableCell>
                    <TableCell>{p.location_name}</TableCell>
                    <TableCell>{p.business_unit_name}</TableCell>
                    <TableCell>
                      <Chip
                        variant="outlined"
                        label={formatDate(p.expires_at)}
                        color={p.expiry_type === 'expired' ? 'error' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={p.expiry_type === 'expired' ? 'Expired' : 'Soon Expire'}
                        color={p.expiry_type === 'expired' ? 'error' : 'warning'}
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ color: p.days_to_expiry < 0 ? 'error.main' : 'success.main' }}>
                      {p.days_to_expiry}
                    </TableCell>
                    <TableCell align="right">{formatCurrency(p.inventory_value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </MainCard>
    </>
  );
}
