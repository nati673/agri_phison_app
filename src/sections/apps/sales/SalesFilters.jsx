import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Chip, IconButton, Drawer, Stack, TextField, InputAdornment, Autocomplete, Button, Divider } from '@mui/material';
import { Filter, More, SearchNormal1 } from 'iconsax-react';
import DateRangePickerLite from 'components/inputs/DateRangePickerLite';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import WiderPopper from 'components/inputs/WiderPopper';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

export default function SalesFilters({
  data,
  activeTab,
  setActiveTab,
  globalFilter,
  setGlobalFilter,
  filter,
  setFilter,
  BusinessUnits,
  locations,
  locationOptions
}) {
  const safeData = Array.isArray(data) ? data : [];
  const safeBusinessUnits = Array.isArray(BusinessUnits) ? BusinessUnits : [];
  const safeLocations = Array.isArray(locations) ? locations : [];
  const safeLocationOptions = Array.isArray(locationOptions) ? locationOptions : [];

  const groups = ['All', ...new Set(safeData.map((item) => item.status))];
  const counts = safeData.reduce((acc, val) => {
    acc[val.status] = (acc[val.status] || 0) + 1;
    return acc;
  }, {});

  // Drawer for advanced filters
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Local state for date range picker
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

  // Clear all filters
  const handleClearFilters = () => {
    setFilter({
      business_unit_id: '',
      location_id: '',
      status: '',
      date_from: '',
      date_to: ''
    });
    setDateRange([null, null]);
    setDrawerOpen(false);
  };

  return (
    <Box>
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
                  color={status === 'All' ? 'primary' : status === 'paid' ? 'success' : status === 'unpaid' ? 'error' : 'warning'}
                  variant="light"
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              }
              iconPosition="end"
              sx={{
                px: 1.5,
                minHeight: 36,
                fontWeight: 600,
                fontSize: { xs: '0.85rem', sm: '1rem' }
              }}
            />
          ))}
        </Tabs>

        {/* Search and Filter toggle */}
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
          <IconButton size="large" color="primary" sx={{}} onClick={() => setDrawerOpen(true)}>
            <More size={24} />
          </IconButton>
        </Stack>
      </Box>
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
                location_id: ''
              }))
            }
            renderInput={(params) => <TextField {...params} label="Business unit" fullWidth />}
            PopperComponent={WiderPopper}
          />
          <Autocomplete
            size="small"
            options={safeLocationOptions}
            getOptionLabel={(opt) => `${opt.location_name || ''} (${opt.location_type || ''})`}
            value={safeLocations.find((l) => l.location_id === filter.location_id) || null}
            onChange={(_, v) =>
              setFilter((prev) => ({
                ...prev,
                location_id: v?.location_id || ''
              }))
            }
            renderOption={renderLocationOption}
            renderInput={(params) => <TextField {...params} label="Location" fullWidth />}
            PopperComponent={WiderPopper}
          />
          <Autocomplete
            size="small"
            options={[
              { label: 'All', value: '' },
              { label: 'Unpaid', value: 'unpaid' },
              { label: 'Partially Paid', value: 'partially paid' },
              { label: 'Paid', value: 'paid' },
              { label: 'Refunded', value: 'refunded' }
            ]}
            getOptionLabel={(opt) => opt.label}
            value={
              [
                { label: 'All', value: '' },
                { label: 'Unpaid', value: 'unpaid' },
                { label: 'Partially Paid', value: 'partially paid' },
                { label: 'Paid', value: 'paid' },
                { label: 'Refunded', value: 'refunded' }
              ].find((s) => s.value === filter.status) || null
            }
            onChange={(_, v) =>
              setFilter((prev) => ({
                ...prev,
                status: v?.value || ''
              }))
            }
            renderInput={(params) => <TextField {...params} label="Status" fullWidth />}
          />
          {/* Date Range Picker */}
          <Divider sx={{ my: 2 }} />
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
