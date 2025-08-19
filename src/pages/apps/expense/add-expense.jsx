import React, { useState, useMemo } from 'react';
import { Box, Button, TextField, Typography, Autocomplete, Tooltip, CircularProgress } from '@mui/material';
import { Add } from 'iconsax-react';
import toast from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useAuth from 'hooks/useAuth';
import { useGetLocation } from 'api/location';
import { useGetBusinessUnit } from 'api/business_unit';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import { requiredInputStyle } from 'components/inputs/requiredInputStyle';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import { createExpenses } from 'api/expense';
import { expenseCategories, paymentMethods } from 'sections/apps/expense/ExpenseSettings';
import { useNavigate } from 'react-router';

// Expense categories

const recentPaidTo = ['Amazon', 'Acme Supplies', 'Best Taxi'];
const suggestedCategories = expenseCategories.filter((ec) => ['Office Supplies', 'Transport', 'Travel'].includes(ec.label));

const inputStyle = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px', transition: 'all 0.2s' },
  '& .MuiInputLabel-root': { fontWeight: 500 }
};

function ResponsiveHeaderRow({ label, children, tooltip }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        gap: 1
      }}
    >
      <Tooltip title={tooltip || ''}>
        <Typography sx={{ width: { sm: 140 }, minWidth: { sm: 140 } }} color="text.secondary">
          {label}
        </Typography>
      </Tooltip>
      {children}
    </Box>
  );
}

export default function AddExpense() {
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { user } = useAuth();

  const [headerInfo, setHeaderInfo] = useState({
    business_unit: null,
    location: null,
    expense_date: new Date(),
    paid_to: '',
    description: '',
    amount: '',
    category: '',
    payment_method: ''
  });

  const [receiptFile, setReceiptFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const locationOptions = headerInfo.business_unit
    ? (headerInfo.business_unit.locations || []).filter((loc) => loc.location_type !== 'branch')
    : (locations || []).filter((loc) => loc.location_type !== 'branch');

  const isValidAmount = (val) => !!val && parseFloat(val) > 0;

  const autoCategories = useMemo(
    () => (suggestedCategories.length ? suggestedCategories : expenseCategories),
    [headerInfo.business_unit, headerInfo.location]
  );

  // Handlers
  const handleHeaderChange = (field, value) => {
    setHeaderInfo((prev) => {
      if (field === 'business_unit') {
        return { ...prev, business_unit: value, location: null };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!headerInfo.business_unit || !headerInfo.location) {
      toast.error('Business unit and location are required.');
      return;
    }
    if (!isValidAmount(headerInfo.amount) || !headerInfo.category || !headerInfo.payment_method) {
      toast.error('Valid amount, category, and payment method required.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        company_id: user?.company_id,
        business_unit_id: headerInfo.business_unit?.business_unit_id,
        location_id: headerInfo.location?.location_id,
        expense_date: headerInfo.expense_date,
        paid_to: headerInfo.paid_to,
        added_by: user?.user_id,
        amount: parseFloat(headerInfo.amount),
        category: headerInfo.category,
        description: headerInfo.description,
        payment_method: headerInfo.payment_method,
        receipt: receiptFile || null
      };

      const res = await createExpenses(payload);

      if (res.success) {
        toast.success(res.message);
      }

      setHeaderInfo({
        business_unit: null,
        location: null,
        expense_date: new Date(),
        paid_to: '',
        amount: '',
        category: '',
        description: '',
        payment_method: ''
      });
      setReceiptFile(null);
      navigate('/workspace/expense/add-expense');
      // navigate to
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, maxWidth: 600 }}>
        {/* Business Unit */}
        <ResponsiveHeaderRow label="Business Unit:" tooltip="Select your business unit">
          <Autocomplete
            fullWidth
            options={BusinessUnits || []}
            getOptionLabel={(o) => o.unit_name || ''}
            value={headerInfo.business_unit}
            onChange={(e, v) => handleHeaderChange('business_unit', v)}
            renderOption={(props, option, params) => renderBusinessUnitOption(props, option, params)}
            isOptionEqualToValue={(o, v) => o.business_unit_id === v.business_unit_id}
            renderInput={(p) => <TextField {...p} size="small" required />}
            sx={requiredInputStyle}
          />
        </ResponsiveHeaderRow>

        {/* Location */}
        <ResponsiveHeaderRow label="Location:" tooltip="Choose your current location">
          <Autocomplete
            fullWidth
            options={locationOptions}
            getOptionLabel={(o) => o.location_name || ''}
            value={headerInfo.location}
            onChange={(e, v) => handleHeaderChange('location', v)}
            renderOption={(props, option, params) => renderLocationOption(props, option, params)}
            isOptionEqualToValue={(o, v) => o.location_id === v.location_id}
            renderInput={(p) => <TextField {...p} size="small" required />}
            sx={requiredInputStyle}
            disabled={!headerInfo.business_unit}
          />
        </ResponsiveHeaderRow>

        {/* Paid To */}
        <ResponsiveHeaderRow label="Paid To:" tooltip="Who received the payment?">
          <Autocomplete
            freeSolo
            fullWidth
            options={recentPaidTo}
            inputValue={headerInfo.paid_to}
            onInputChange={(e, v) => handleHeaderChange('paid_to', v)}
            renderInput={(p) => <TextField {...p} size="small" required sx={inputStyle} />}
            sx={requiredInputStyle}
          />
        </ResponsiveHeaderRow>

        {/* Date */}
        <ResponsiveHeaderRow label="Expense Date:" tooltip="Select the date of expense">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={headerInfo.expense_date}
              onChange={(date) => handleHeaderChange('expense_date', date)}
              readOnly
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  required: true,
                  sx: inputStyle
                }
              }}
            />
          </LocalizationProvider>
        </ResponsiveHeaderRow>

        <ResponsiveHeaderRow label="Description:" tooltip="Describe this expense">
          <TextField
            fullWidth
            value={headerInfo.description}
            onChange={(e) => handleHeaderChange('description', e.target.value)}
            size="small"
            multiline
            rows={2}
            sx={inputStyle}
          />
        </ResponsiveHeaderRow>

        <ResponsiveHeaderRow label="Payment Method:" tooltip="Select payment method">
          <Autocomplete
            options={paymentMethods}
            fullWidth
            getOptionLabel={(o) => o.label || ''}
            value={paymentMethods.find((pm) => pm.value === headerInfo.payment_method) || null}
            onChange={(e, v) => handleHeaderChange('payment_method', v ? v.value : '')}
            renderInput={(p) => <TextField {...p} size="small" required />}
            sx={inputStyle}
          />
        </ResponsiveHeaderRow>

        <ResponsiveHeaderRow label="Payment Category:" tooltip="Select expense category">
          <Autocomplete
            options={autoCategories}
            fullWidth
            getOptionLabel={(o) => o.label || ''}
            value={expenseCategories.find((ec) => ec.value === headerInfo.category) || null}
            onChange={(e, v) => handleHeaderChange('category', v ? v.value : '')}
            renderInput={(p) => <TextField {...p} size="small" required />}
            sx={requiredInputStyle}
          />
        </ResponsiveHeaderRow>

        {/* Amount */}
        <ResponsiveHeaderRow label="Expense Amount:" tooltip="Enter the amount">
          <TextField
            type="number"
            fullWidth
            value={headerInfo.amount}
            onChange={(e) => handleHeaderChange('amount', e.target.value)}
            size="small"
            error={headerInfo.amount !== '' && !isValidAmount(headerInfo.amount)}
            helperText={headerInfo.amount !== '' && !isValidAmount(headerInfo.amount) ? 'Amount must be greater than zero!' : ''}
            sx={requiredInputStyle}
          />
        </ResponsiveHeaderRow>
      </Box>

      {/* ACTIONS */}
      <Box display="flex" gap={2} alignItems="center">
        <Button variant="contained" type="submit" disabled={loading} startIcon={<Add />}>
          {loading ? <CircularProgress size={22} /> : 'Submit'}
        </Button>
      </Box>
    </form>
  );
}
