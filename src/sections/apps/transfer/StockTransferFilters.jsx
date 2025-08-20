import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Chip, IconButton, Drawer, Stack, TextField, InputAdornment, Autocomplete, Button, Divider } from '@mui/material';
import { More, SearchNormal1 } from 'iconsax-react';
import DateRangePickerLite from 'components/inputs/DateRangePickerLite';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import WiderPopper from 'components/inputs/WiderPopper';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function StockTransferFilters({
  data,
  activeTab,
  setActiveTab,
  globalFilter,
  setGlobalFilter,
  filter,
  setFilter,
  BusinessUnits,
  locations
}) {
  const safeData = Array.isArray(data) ? data : [];
  const safeBusinessUnits = Array.isArray(BusinessUnits) ? BusinessUnits : [];
  const safeLocations = Array.isArray(locations) ? locations : [];

  // Status groups (transfer_status)
  const groups = ['All', ...new Set(safeData.map((item) => item.transfer_status))];
  const counts = safeData.reduce((acc, val) => {
    acc[val.transfer_status] = (acc[val.transfer_status] || 0) + 1;
    return acc;
  }, {});

  // Drawer & date range
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState([
    filter.date_from ? new Date(filter.date_from) : null,
    filter.date_to ? new Date(filter.date_to) : null
  ]);

  useEffect(() => {
    setDateRange([filter.date_from ? new Date(filter.date_from) : null, filter.date_to ? new Date(filter.date_to) : null]);
  }, [filter.date_from, filter.date_to]);

  const handleDateRangeChange = (newValue) => {
    setDateRange(newValue);
    setFilter((prev) => ({
      ...prev,
      date_from: newValue[0] ? newValue.toISOString().slice(0, 10) : '',
      date_to: newValue ? newValue.toISOString().slice(0, 10) : ''
    }));
  };

  const handleClearFilters = () => {
    setFilter({
      business_unit_id: '',
      from_location_id: '',
      to_location_id: '',
      transfer_status: '',
      date_from: '',
      date_to: '',
      search: ''
    });
    setDateRange([null, null]);
    setDrawerOpen(false);
  };

  const safeArray = (arr) => (Array.isArray(arr) ? arr : []);

  // From Location options (exclude branch)
  const locationOptions = filter.business_unit_id
    ? safeArray(safeBusinessUnits.find((b) => b.business_unit_id === filter.business_unit_id)?.locations).filter(
        (l) => l.location_type !== 'branch'
      )
    : safeLocations.filter((l) => l.location_type !== 'branch');

  // To Location options (also exclude branch)
  const toLocationOptions = filter.business_unit_id
    ? safeArray(safeBusinessUnits.find((b) => b.business_unit_id === filter.business_unit_id)?.locations).filter(
        (l) => l.location_type !== 'branch'
      )
    : safeLocations.filter((l) => l.location_type !== 'branch');

  return (
    <Box>
      {/* Top Tabs */}
      <Box sx={{ p: { xs: 1, sm: 2.5 }, pb: 0 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} variant="scrollable" scrollButtons="auto" sx={{ minHeight: 38 }}>
          {groups.map((status, index) => (
            <Tab
              key={index}
              label={status}
              value={status}
              icon={
                <Chip
                  label={status === 'All' ? safeData.length : counts[status]}
                  color={status === 'All' ? 'primary' : status === 'received' ? 'success' : status === 'pending' ? 'warning' : 'error'}
                  variant="light"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              }
              iconPosition="end"
              sx={{ px: 1.5, minHeight: 36, fontWeight: 600, fontSize: { xs: '0.85rem', sm: '1rem' } }}
            />
          ))}
        </Tabs>

        {/* Search + Filter Drawer Toggle */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: { xs: 2, md: 2 } }}>
          <TextField
            placeholder="Search..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={18} />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: { xs: '100%', md: 220 } }}
          />
          <IconButton size="large" color="primary" onClick={() => setDrawerOpen(true)}>
            <More size={24} />
          </IconButton>
        </Stack>
      </Box>

      {/* Drawer for Advanced Filters */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 370 }, px: 3, pt: 2 } }}
      >
        <Stack spacing={2} sx={{ pt: 1, pb: 2 }}>
          <Box fontWeight={600} fontSize="1.15rem" mb={1}>
            Advanced Filters
          </Box>

          {/* Business Unit */}
          <Autocomplete
            size="small"
            options={safeBusinessUnits}
            getOptionLabel={(o) => o.unit_name || ''}
            value={safeBusinessUnits.find((b) => b.business_unit_id === filter.business_unit_id) || null}
            renderOption={renderBusinessUnitOption}
            onChange={(_, v) =>
              setFilter((prev) => ({
                ...prev,
                business_unit_id: v?.business_unit_id || '',
                from_location_id: '',
                to_location_id: ''
              }))
            }
            renderInput={(params) => <TextField {...params} label="Business unit" fullWidth />}
            PopperComponent={WiderPopper}
          />

          {/* From Location */}
          <Autocomplete
            size="small"
            options={locationOptions}
            getOptionLabel={(opt) => `${opt.location_name || ''} (${opt.location_type || ''})`}
            value={locationOptions.find((l) => l.location_id === filter.from_location_id) || null}
            onChange={(_, v) =>
              setFilter((prev) => ({
                ...prev,
                from_location_id: v?.location_id || ''
              }))
            }
            renderOption={renderLocationOption}
            renderInput={(params) => <TextField {...params} label="From Location" fullWidth />}
            PopperComponent={WiderPopper}
          />

          {/* To Location */}
          <Autocomplete
            size="small"
            options={toLocationOptions}
            getOptionLabel={(opt) => `${opt.location_name || ''} (${opt.location_type || ''})`}
            value={toLocationOptions.find((l) => l.location_id === filter.to_location_id) || null}
            onChange={(_, v) =>
              setFilter((prev) => ({
                ...prev,
                to_location_id: v?.location_id || ''
              }))
            }
            renderOption={renderLocationOption}
            renderInput={(params) => <TextField {...params} label="To Location" fullWidth />}
            PopperComponent={WiderPopper}
          />

          {/* Transfer Status */}
          <Autocomplete
            size="small"
            options={[
              { label: 'All', value: '' },
              { label: 'Pending', value: 'pending' },
              { label: 'Received', value: 'received' },
              { label: 'Rejected', value: 'rejected' }
            ]}
            getOptionLabel={(opt) => opt.label}
            value={
              [
                { label: 'All', value: '' },
                { label: 'Pending', value: 'pending' },
                { label: 'Received', value: 'received' },
                { label: 'Rejected', value: 'rejected' }
              ].find((s) => s.value === filter.transfer_status) || null
            }
            onChange={(_, v) =>
              setFilter((prev) => ({
                ...prev,
                transfer_status: v?.value || ''
              }))
            }
            renderInput={(params) => <TextField {...params} label="Status" fullWidth />}
          />

          <Divider sx={{ my: 2 }} />

          {/* Date Range */}
          <Box>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateRangePickerLite
                value={dateRange}
                onChange={handleDateRangeChange}
                inputFormat="yyyy-MM-dd"
                renderInput={(startProps, endProps) => (
                  <Stack direction="row" spacing={2}>
                    <TextField {...startProps} label="From" size="small" fullWidth />
                    <TextField {...endProps} label="To" size="small" fullWidth />
                  </Stack>
                )}
              />
            </LocalizationProvider>
          </Box>
        </Stack>

        <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
          <Button variant="contained" color="primary" onClick={() => setDrawerOpen(false)}>
            Apply
          </Button>
          <Button variant="text" color="error" onClick={handleClearFilters}>
            Clear All
          </Button>
        </Stack>
      </Drawer>
    </Box>
  );
}
