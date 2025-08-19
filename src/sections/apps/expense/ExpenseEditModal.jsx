import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, Box, Button, TextField, Typography, Autocomplete, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import toast from 'react-hot-toast';

import { expenseCategories, paymentMethods } from './ExpenseSettings'; // import your categories, methods array
import { useGetLocation } from 'api/location';
import { useGetBusinessUnit } from 'api/business_unit';
import { updateExpense } from 'api/expense'; // <-- your PATCH/PUT API
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import useAuth from 'hooks/useAuth';

const inputStyle = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px', transition: 'all 0.2s' },
  '& .MuiInputLabel-root': { fontWeight: 500 }
};

function ExpenseEditModal({ open, onClose, expense }) {
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  // Set initial form state from expense prop
  const [form, setForm] = useState({
    business_unit: null,
    location: null,
    expense_date: new Date(),
    paid_to: '',
    description: '',
    amount: '',
    category: '',
    payment_method: ''
  });

  // When expense changes, reset form with its values
  useEffect(() => {
    if (expense) {
      setForm({
        business_unit: BusinessUnits?.find((bu) => bu.business_unit_id === expense.business_unit_id) || null,
        location: locations?.find((loc) => loc.location_id === expense.location_id) || null,
        expense_date: new Date(expense.expense_date),
        paid_to: expense.paid_to || '',
        description: expense.description || '',
        amount: expense.amount,
        category: expense.category,
        payment_method: expense.payment_method
      });
    }
  }, [expense, BusinessUnits, locations]);

  const locationOptions = form.business_unit
    ? (form.business_unit.locations || []).filter((loc) => loc.location_type !== 'branch')
    : (locations || []).filter((loc) => loc.location_type !== 'branch');

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValidAmount = (val) => !!val && parseFloat(val) > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.business_unit || !form.location) {
      toast.error('Business unit and location are required.');
      return;
    }
    if (!isValidAmount(form.amount) || !form.category || !form.payment_method) {
      toast.error('Valid amount, category, and payment method required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        business_unit_id: form.business_unit.business_unit_id,
        location_id: form.location.location_id,
        expense_date: form.expense_date,
        company_id: user?.company_id,
        paid_to: form.paid_to,
        description: form.description,
        amount: parseFloat(form.amount),
        category: form.category,
        payment_method: form.payment_method
      };
      const res = await updateExpense(expense.expense_id, payload);
      if (res.success) {
        toast.success(res.message);

        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ pb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
              Edit Expense
            </Typography>
            {/* Business Unit */}
            <Autocomplete
              fullWidth
              options={BusinessUnits || []}
              getOptionLabel={(o) => o.unit_name || ''}
              value={form.business_unit}
              onChange={(e, v) => handleChange('business_unit', v)}
              renderOption={renderBusinessUnitOption}
              isOptionEqualToValue={(o, v) => o.business_unit_id === v.business_unit_id}
              renderInput={(p) => <TextField {...p} size="small" required label="Business Unit" />}
              sx={inputStyle}
            />
            {/* Location */}
            <Autocomplete
              fullWidth
              options={locationOptions}
              getOptionLabel={(o) => o.location_name || ''}
              value={form.location}
              onChange={(e, v) => handleChange('location', v)}
              renderOption={renderLocationOption}
              isOptionEqualToValue={(o, v) => o.location_id === v.location_id}
              renderInput={(p) => <TextField {...p} size="small" required label="Location" />}
              sx={inputStyle}
              disabled={!form.business_unit}
            />
            {/* Paid To */}
            <TextField
              fullWidth
              value={form.paid_to}
              onChange={(e) => handleChange('paid_to', e.target.value)}
              size="small"
              required
              label="Paid To"
              sx={inputStyle}
            />
            {/* Expense Date */}
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={form.expense_date}
                onChange={(date) => handleChange('expense_date', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    required: true,
                    label: 'Expense Date',
                    sx: inputStyle
                  }
                }}
              />
            </LocalizationProvider>
            {/* Description */}
            <TextField
              fullWidth
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              size="small"
              multiline
              rows={2}
              label="Description"
              sx={inputStyle}
            />
            {/* Payment Method */}
            <Autocomplete
              options={paymentMethods}
              fullWidth
              getOptionLabel={(o) => o.label || ''}
              value={paymentMethods.find((pm) => pm.value === form.payment_method) || null}
              onChange={(e, v) => handleChange('payment_method', v ? v.value : '')}
              renderInput={(p) => <TextField {...p} size="small" required label="Payment Method" />}
              sx={inputStyle}
            />
            {/* Category */}
            <Autocomplete
              options={expenseCategories}
              fullWidth
              getOptionLabel={(o) => o.label || ''}
              value={expenseCategories.find((ec) => ec.value === form.category) || null}
              onChange={(e, v) => handleChange('category', v ? v.value : '')}
              renderInput={(p) => <TextField {...p} size="small" required label="Category" />}
              sx={inputStyle}
            />
            {/* Amount */}
            <TextField
              type="number"
              fullWidth
              value={form.amount}
              onChange={(e) => handleChange('amount', e.target.value)}
              size="small"
              required
              error={form.amount !== '' && !isValidAmount(form.amount)}
              helperText={form.amount !== '' && !isValidAmount(form.amount) ? 'Amount must be greater than zero!' : ''}
              label="Amount"
              sx={inputStyle}
            />
            <Box display="flex" gap={2} alignItems="center" mt={2}>
              <Button variant="contained" type="submit" disabled={loading}>
                {loading ? <CircularProgress size={22} /> : 'Update'}
              </Button>
              <Button variant="text" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
}

ExpenseEditModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  expense: PropTypes.object,
  onSave: PropTypes.func
};

export default ExpenseEditModal;
