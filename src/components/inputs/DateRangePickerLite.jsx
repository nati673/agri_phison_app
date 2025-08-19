import React from 'react';
import { Box, TextField } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

export default function DateRangePickerLite({ value, onChange }) {
  const [from, to] = value;

  const handleFromChange = (date) => {
    // Prevent selecting after "to"
    if (to && date && date > to) return;
    onChange([date, to]);
  };
  const handleToChange = (date) => {
    // Prevent selecting before "from"
    if (from && date && date < from) return;
    onChange([from, date]);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DatePicker
          label="Date from"
          value={from}
          maxDate={to || undefined}
          onChange={handleFromChange}
          renderInput={(params) => <TextField {...params} size="small" fullWidth />}
        />
        <DatePicker
          label="Date to"
          value={to}
          minDate={from || undefined}
          onChange={handleToChange}
          renderInput={(params) => <TextField {...params} size="small" fullWidth />}
        />
      </Box>
    </LocalizationProvider>
  );
}
