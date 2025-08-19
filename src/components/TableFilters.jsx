import React, { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Chip, IconButton, Drawer, Stack, TextField, InputAdornment, Autocomplete, Button, Divider } from '@mui/material';
import { More, SearchNormal1 } from 'iconsax-react';

// IMPORT YOUR UTILS/HOOKS/RENDERERS
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import DateRangePickerLite from 'components/inputs/DateRangePickerLite';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import { renderLocationOption } from 'components/inputs/renderLocationOption';

function safeArray(arr) {
  return Array.isArray(arr) ? arr : [];
}

export default function TableFilters({
  data,
  filter,
  setFilter,
  globalFilter,
  setGlobalFilter,
  activeTab,
  setActiveTab,
  statusOptions = [
    { label: 'All', value: '' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Partially Paid', value: 'partially paid' },
    { label: 'Paid', value: 'paid' },
    { label: 'Refunded', value: 'refunded' }
  ],
  statusLabel = 'Status'
}) {
  const safeData = safeArray(data);
  const groups = statusOptions.map((s) => s.label);

  const counts = safeData.reduce((acc, val) => {
    acc[val.status] = (acc[val.status] || 0) + 1;
    return acc;
  }, {});

  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const safeBusinessUnits = safeArray(BusinessUnits);
  const safeLocations = safeArray(locations);

  const locationOptions = filter.business_unit_id
    ? safeArray(safeBusinessUnits.find((b) => b.business_unit_id === filter.business_unit_id)?.locations).filter(
        (l) => l.location_type !== 'branch'
      )
    : safeLocations.filter((l) => l.location_type !== 'branch');

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [dateRange, setDateRange] = useState([null, null]);

  const handleDateRangeChange = (newValue) => {
    setDateRange(newValue);

    setFilter((prev) => {
      let date_from = prev.date_from;
      let date_to = prev.date_to;

      if (newValue && typeof newValue[0].getTime === 'function' && !isNaN(newValue[0].getTime())) {
        date_from = newValue[0].toISOString().slice(0, 10);
      } else if (newValue[0] == null) {
        date_from = '';
      }

      if (newValue[1] && typeof newValue[1].getTime === 'function' && !isNaN(newValue[1].getTime())) {
        date_to = newValue[1].toISOString().slice(0, 10);
      } else if (newValue[1] == null) {
        date_to = '';
      }

      return { ...prev, date_from, date_to };
    });
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilter({
      business_unit_id: '',
      location_id: '',
      status: '',
      date_from: '',
      date_to: '',
      search: ''
    });
    setDateRange([null, null]);
    setDrawerOpen(false);
  };

  return (
    <Box>
      {/* Status Tabs */}
      <Box sx={{ p: { xs: 1, sm: 2.5 }, pb: 0 }}>
        {/* Status Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 38,
            '& .MuiTabs-scrollButtons.Mui-disabled': { opacity: 0.3 },
            px: { xs: 0.5, sm: 1, md: 2 }
          }}
        >
          {statusOptions.map((status, index) => (
            <Tab
              key={index}
              label={status.label}
              value={status.value} // ✅ use real value here
              icon={
                <Chip
                  label={
                    status.value === ''
                      ? safeData.length // "All"
                      : counts[status.value] || 0 // ✅ count by value not label
                  }
                  color={
                    status.value === '' ? 'primary' : status.value === 'paid' ? 'success' : status.value === 'unpaid' ? 'error' : 'warning'
                  }
                  variant="light"
                  size="small"
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                    height: { xs: 18, sm: 22 }
                  }}
                />
              }
              iconPosition="end"
              sx={{
                px: { xs: 0.5, sm: 1.5 },
                minHeight: { xs: 32, sm: 36 },
                minWidth: { xs: 'auto', sm: 120 },
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1rem' },
                textTransform: 'none'
              }}
            />
          ))}
        </Tabs>

        {/* Search & drawer toggle */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
          <TextField
            placeholder="Search adjustments..."
            value={filter.search || ''}
            onChange={(e) =>
              setFilter((prev) => ({
                ...prev,
                search: e.target.value
              }))
            }
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={18} />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: { xs: '90%', md: 220 } }}
          />

          <IconButton size="large" color="primary" onClick={() => setDrawerOpen(true)}>
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
          />
          {/* Location */}
          <Autocomplete
            size="small"
            options={locationOptions}
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
          />
          {/* Status */}
          <Autocomplete
            size="small"
            options={statusOptions}
            getOptionLabel={(opt) => opt.label}
            value={statusOptions.find((s) => s.value === filter.status) || null}
            onChange={(_, v) =>
              setFilter((prev) => ({
                ...prev,
                status: v?.value || ''
              }))
            }
            renderInput={(params) => <TextField {...params} label={statusLabel} fullWidth />}
          />
          {/* Date Range */}
          <Divider sx={{ my: 2 }} />
          <DateRangePickerLite value={dateRange} onChange={handleDateRangeChange} />
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
