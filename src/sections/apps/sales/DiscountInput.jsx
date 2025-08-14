import React, { useState, useRef } from 'react';
import { TextField, Popover, Stack, ToggleButtonGroup, ToggleButton, Typography, Box, Button } from '@mui/material';

export default function DiscountInput({
  discountPercent,
  discountAmount,
  price,
  quantity,
  onChangeDiscountPercent,
  onChangeDiscountAmount
}) {
  const [mode, setMode] = useState('percent'); // 'percent' or 'amount'
  const [anchorEl, setAnchorEl] = useState(null);
  const inputRef = useRef(null);

  const openPopover = (event) => setAnchorEl(event.currentTarget);
  const closePopover = () => setAnchorEl(null);

  const open = Boolean(anchorEl);
  const id = open ? 'discount-popover' : undefined;

  // Show a summary string when not editing
  const discountSummary = () => {
    const dp = discountPercent ? `${discountPercent}%` : '';
    const da = discountAmount ? `ETB ${discountAmount}` : '';
    if (dp && da) return `${dp} / ${da}`;
    if (dp) return dp;
    if (da) return da;
    return 'No discount';
  };

  // Handlers clamp and sync fields on user input
  const handlePercentChange = (e) => {
    let val = e.target.value;
    if (val === '') {
      onChangeDiscountPercent('');
      onChangeDiscountAmount('');
      return;
    }
    val = Math.min(100, Math.max(0, Number(val)));
    onChangeDiscountPercent(val.toFixed(2));
    if (price && quantity) {
      const amt = (price * quantity * val) / 100;
      onChangeDiscountAmount(amt.toFixed(2));
    }
  };

  const handleAmountChange = (e) => {
    let val = e.target.value;
    if (val === '') {
      onChangeDiscountPercent('');
      onChangeDiscountAmount('');
      return;
    }
    val = Math.max(0, Number(val));
    onChangeDiscountAmount(val.toFixed(2));
    if (price && quantity) {
      const pct = (val / (price * quantity)) * 100;
      onChangeDiscountPercent(pct > 100 ? '100.00' : pct.toFixed(2));
    }
  };

  // Toggle input mode
  const handleModeChange = (event, newMode) => {
    if (newMode !== null) setMode(newMode);
  };

  return (
    <>
      <TextField
        label="Discount"
        value={discountSummary()}
        onClick={openPopover}
        inputRef={inputRef}
        size="small"
        fullWidth
        InputProps={{
          readOnly: true,
          sx: { cursor: 'pointer' }
        }}
        aria-describedby={id}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        disableRestoreFocus
        sx={{ p: 2 }}
      >
        <Stack spacing={2} sx={{ width: 240, p: 1 }}>
          <ToggleButtonGroup value={mode} exclusive onChange={handleModeChange} size="small" aria-label="Discount input mode">
            <ToggleButton value="percent" aria-label="Percent discount mode">
              Percent %
            </ToggleButton>
            <ToggleButton value="amount" aria-label="Amount discount mode">
              Amount ETB
            </ToggleButton>
          </ToggleButtonGroup>

          {mode === 'percent' ? (
            <TextField
              label="Discount %"
              type="number"
              inputProps={{ min: 0, max: 100, step: '0.01' }}
              value={discountPercent}
              onChange={handlePercentChange}
              autoFocus
              fullWidth
              size="small"
            />
          ) : (
            <TextField
              label="Discount Amount"
              type="number"
              inputProps={{ min: 0, step: '0.01' }}
              value={discountAmount}
              onChange={handleAmountChange}
              autoFocus
              fullWidth
              size="small"
            />
          )}

          <Typography variant="caption" color="text.secondary">
            {price && quantity ? `Max discount: ETB ${(price * quantity).toFixed(2)}` : 'Select product and enter quantity first'}
          </Typography>

          <Box textAlign="right">
            <Button variant="text" onClick={closePopover}>
              Close
            </Button>
          </Box>
        </Stack>
      </Popover>
    </>
  );
}
