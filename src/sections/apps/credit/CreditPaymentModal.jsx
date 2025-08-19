import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Fade
} from '@mui/material';

import { payCredits } from 'api/credit';

export default function CreditPaymentModal({ open, handleClose, credit, onPaymentSuccess }) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const inputRef = useRef();

  useEffect(() => {
    // Auto-focus on input when modal opens
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 200);
    }
    // Reset state on modal open
    setPaymentAmount('');
    setError('');
    setSuccess(false);
  }, [open, credit.credit_id]);

  const paidAmount = Number(credit.total_paid || 0);
  const maxAmount = Number(credit.remaining_balance || 0);
  const fullyPaid = maxAmount <= 0;

  const quickPayValues = maxAmount > 0 ? [maxAmount, Math.round(maxAmount / 2), Math.round(maxAmount / 3)].filter((v) => v >= 1) : [];

  const handlePay = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);

    const amount = Number(paymentAmount);

    // Validation
    if (fullyPaid) {
      setError('This credit is already paid.');
      setLoading(false);
      return;
    }
    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount.');
      setLoading(false);
      return;
    }
    if (amount > maxAmount) {
      setError(`Payment cannot exceed remaining balance (Birr ${maxAmount}).`);
      setLoading(false);
      return;
    }

    try {
      await payCredits(credit.credit_id, amount);
    //   await new Promise((resolve) => setTimeout(resolve, 700));
      setSuccess(true);
      setPaymentAmount('');
      if (onPaymentSuccess) onPaymentSuccess();
      setTimeout(() => {
        setSuccess(false);
        handleClose();
      }, 1400);
    } catch (e) {
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    let val = e.target.value;
    if (val && Number(val) > maxAmount) val = maxAmount;
    setPaymentAmount(val);
    setError('');
  };

  const handleQuickPay = (v) => {
    setPaymentAmount(v);
    setError('');
    if (inputRef.current) inputRef.current.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) handlePay();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle fontWeight={700}>Pay Credit #{credit.credit_id}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Typography>
              <b>Customer:</b> {credit.customer_name}
            </Typography>
            <Chip
              label={credit.status?.toUpperCase() || ''}
              color={credit.status === 'paid' ? 'success' : credit.status === 'unpaid' ? 'error' : 'warning'}
              size="small"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
          <Typography>
            <b>Total Credit:</b> Birr {Number(credit.credit_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Chip label={`Paid: Birr ${paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} color="primary" size="small" />
            <Chip
              label={fullyPaid ? 'Paid in Full' : `Remaining: Birr ${maxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              color={fullyPaid ? 'success' : 'error'}
              size="small"
            />
          </Stack>
          <TextField
            fullWidth
            inputRef={inputRef}
            label="Payment Amount"
            type="number"
            inputProps={{ min: 1, max: maxAmount, step: '0.01', autoFocus: true }}
            value={paymentAmount}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            autoFocus
            disabled={loading || fullyPaid}
            helperText={`Enter an amount up to Birr ${maxAmount}`}
          />
          {!fullyPaid && quickPayValues.length > 0 && (
            <Stack direction="row" spacing={1}>
              {quickPayValues.map((v, i) => (
                <Button
                  key={v}
                  size="small"
                  variant="outlined"
                  color="info"
                  sx={{ minWidth: 0, fontWeight: 600 }}
                  onClick={() => handleQuickPay(v)}
                  disabled={loading}
                >
                  {v === maxAmount ? 'Full' : `Birr ${v}`}
                </Button>
              ))}
            </Stack>
          )}
          <Fade in={!!error}>
            <Alert severity="error">{error}</Alert>
          </Fade>
          <Fade in={!!success}>
            <Alert severity="success">Payment successful!</Alert>
          </Fade>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading || success}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={handlePay} disabled={loading || fullyPaid || success}>
          {loading ? <CircularProgress size={22} /> : fullyPaid ? 'Paid' : 'Confirm Payment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
