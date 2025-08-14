import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  TextField,
  Typography,
  Autocomplete,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import { Add, Trash } from 'iconsax-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useTool } from 'contexts/ToolContext';
import useAuth from 'hooks/useAuth';
import useBarcodeScanner from 'utils/scan';
import { useGetProducts } from 'api/products';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import { updateAdjustment } from 'api/adjustment'; // <-- NEW API
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import ProductSelector from 'sections/apps/product-center/products/ProductSelector';
import MainCard from 'components/MainCard';

const initialLine = {
  product: null,
  previous_quantity: '',
  new_quantity: '',
  delta_quantity: '',
  previous_unit_price: '',
  new_unit_price: '',
  notes: ''
};

const adjustmentTypes = [
  { label: 'Quantity', value: 'quantity' },
  { label: 'Value', value: 'value' }
];

const reasonCodes = [
  { value: 'count_correction', label: 'Count Correction' },
  { value: 'opening_stock', label: 'Opening Stock' },
  { value: 'theft', label: 'Theft' },
  { value: 'damage', label: 'Damage' },
  { value: 'spoilage', label: 'Spoilage' },
  { value: 'expired', label: 'Expired' },
  { value: 'cost_correction', label: 'Cost Correction' },
  { value: 'NRV_write_down', label: 'NRV Write-down' },
  { value: 'standard_cost_update', label: 'Standard Cost Update' },
  { value: 'other', label: 'Other' }
];

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    // backgroundColor: '#fff',
    transition: 'all 0.2s ease-in-out'
  },
  '& .MuiInputLabel-root': { fontWeight: 500 }
};

function ResponsiveHeaderRow({ label, children }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        gap: 1
      }}
    >
      <Typography sx={{ width: { sm: 140 }, minWidth: { sm: 140 } }} color="text.secondary">
        {label}
      </Typography>
      {children}
    </Box>
  );
}

export default function AdjustmentUpdateForm({ adjustment = null, closeModal, actionDone }) {
  const { products } = useGetProducts();
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { user } = useAuth();
  const { setScanHandlerActive } = useTool();

  const [headerInfo, setHeaderInfo] = useState({
    business_unit: null,
    location: null,
    adjustment_type: 'quantity',
    reason_code: 'other',
    adjustment_date: new Date(),
    notes: ''
  });
  const [lines, setLines] = useState([{ ...initialLine }]);
  const [bulkAddCount, setBulkAddCount] = useState('');
  const [loading, setLoading] = useState(false);

  // Populate form when adjustment prop changes
  useEffect(() => {
    setScanHandlerActive(false);
    if (adjustment) {
      const bu = BusinessUnits?.find((b) => b.business_unit_id === adjustment.business_unit_id) || null;
      const loc = locations?.find((l) => l.location_id === adjustment.location_id) || null;

      setHeaderInfo({
        business_unit: bu,
        location: loc,
        adjustment_type: adjustment.adjustment_type,
        reason_code: adjustment.reason_code,
        adjustment_date: new Date(adjustment.adjustment_date),
        notes: adjustment.header_notes || ''
      });

      const mappedLines = adjustment.items.map((i) => ({
        product: products.find((p) => p.product_id === i.product_id) || null,
        previous_quantity: i.previous_quantity ?? '',
        new_quantity: i.new_quantity ?? '',
        delta_quantity: i.delta_quantity ?? '',
        previous_unit_price: i.previous_unit_price ?? '',
        new_unit_price: i.new_unit_price ?? '',
        notes: i.notes || ''
      }));
      setLines(mappedLines);
    }
  }, [adjustment, BusinessUnits, locations, products]);

  const locationOptions = headerInfo.business_unit
    ? (headerInfo.business_unit.locations || []).filter((loc) => loc.location_type !== 'branch')
    : (locations || []).filter((loc) => loc.location_type !== 'branch');

  const handleHeaderChange = (field, value) => {
    if (field === 'business_unit') {
      setHeaderInfo((p) => ({ ...p, business_unit: value, location: null }));
    } else {
      setHeaderInfo((p) => ({ ...p, [field]: value }));
    }
  };

  const handleLineChange = (idx, field, value) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== idx) return line;
        let updated = { ...line, [field]: value };

        // Autofill previous qty/price when product changes
        if (field === 'product' && value) {
          updated.previous_quantity = value.quantity || 0;
          updated.previous_unit_price = value.unit_price || 0;
        }
        // Recompute delta quantity
        if (field === 'previous_quantity' || field === 'new_quantity') {
          const prevQty = parseFloat(updated.previous_quantity) || 0;
          const newQty = parseFloat(updated.new_quantity) || 0;
          updated.delta_quantity = (newQty - prevQty).toFixed(3);
        }
        return updated;
      })
    );
  };

  const handleAddLine = () => setLines([...lines, { ...initialLine }]);
  const handleRemoveLine = (idx) => setLines(lines.filter((_, i) => i !== idx));

  const handleBulkAdd = () => {
    const count = parseInt(bulkAddCount, 10);
    if (!count || count < 1 || count > 100) return;
    setLines((prev) => [...prev, ...Array(count).fill({ ...initialLine })]);
    setBulkAddCount('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headerInfo.business_unit || !headerInfo.location) {
      toast.error('Business unit and location are required.');
      return;
    }
    const header = {
      header_id: adjustment.header_id,
      company_id: user?.company_id,
      business_unit_id: headerInfo.business_unit?.business_unit_id || null,
      location_id: headerInfo.location?.location_id || null,
      adjustment_type: headerInfo.adjustment_type,
      reason_code: headerInfo.reason_code,
      adjustment_status: 'approved',
      notes: headerInfo.notes,
      adjusted_by: user?.user_id,
      adjustment_date: headerInfo.adjustment_date ? format(headerInfo.adjustment_date, 'yyyy-MM-dd') : null
    };
    const items = lines.map((l) => {
      let item = {
        item_id: adjustment.items.find((i) => i.product_id === l.product?.product_id)?.item_id || null,
        product_id: l.product?.product_id || null
      };
      if (headerInfo.adjustment_type === 'quantity') {
        item.previous_quantity = parseFloat(l.previous_quantity) || 0;
        item.new_quantity = parseFloat(l.new_quantity) || 0;
        item.delta_quantity = parseFloat(l.delta_quantity) || 0;
      }
      if (headerInfo.adjustment_type === 'value') {
        item.previous_unit_price = parseFloat(l.previous_unit_price) || null;
        item.new_unit_price = parseFloat(l.new_unit_price) || null;
      }
      return item;
    });
    if (items.some((i) => !i.product_id)) {
      toast.error('Each line must have a product.');
      return;
    }
    try {
      setLoading(true);
      const res = await updateAdjustment(adjustment.header_id, { header, items });
      if (res.success) {
        toast.success(res.message);
        actionDone((prev) => !prev);
        closeModal?.();
      }
    } catch (err) {
      if (Array.isArray(err.errors) && err.errors.length > 0) {
        err.errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error(err.message || 'Error updating adjustment');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title={'Edit Inventory Adjustment'} border={false} boxShadow={false}>
      <form onSubmit={handleSubmit}>
        {/* Header Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, maxWidth: 600 }}>
          <ResponsiveHeaderRow label="Business Unit">
            <Autocomplete
              fullWidth
              options={BusinessUnits || []}
              getOptionLabel={(o) => o.unit_name || ''}
              value={headerInfo.business_unit}
              onChange={(e, v) => handleHeaderChange('business_unit', v)}
              renderOption={(props, option, params) => renderBusinessUnitOption(props, option, params)}
              isOptionEqualToValue={(o, v) => o.business_unit_id === v.business_unit_id}
              renderInput={(p) => <TextField {...p} size="small" required sx={inputStyle} />}
              sx={{
                ...inputStyle,
                '& .MuiInputBase-root': {
                  height: 40
                }
              }}
            />
          </ResponsiveHeaderRow>

          <ResponsiveHeaderRow label="Location">
            <Autocomplete
              fullWidth
              options={locationOptions}
              getOptionLabel={(o) => o.location_name || ''}
              value={headerInfo.location}
              onChange={(e, v) => handleHeaderChange('location', v)}
              renderOption={(props, option, params) => renderLocationOption(props, option, params)}
              isOptionEqualToValue={(o, v) => o.location_id === v.location_id}
              renderInput={(p) => <TextField {...p} size="small" required sx={inputStyle} />}
              disabled={!headerInfo.business_unit}
              sx={{
                ...inputStyle,
                '& .MuiInputBase-root': {
                  height: 40
                }
              }}
            />
          </ResponsiveHeaderRow>

          {/* <ResponsiveHeaderRow label="Type">
            <RadioGroup
              row
              value={headerInfo.adjustment_type}
              onChange={(e) => handleHeaderChange('adjustment_type', e.target.value)}
              sx={{ flex: 1 }}

              
            >
              {adjustmentTypes.map((t) => (
                <FormControlLabel key={t.value} value={t.value} control={<Radio size="small" />} label={t.label} />
              ))}
            </RadioGroup>
          </ResponsiveHeaderRow> */}

          <ResponsiveHeaderRow label="Reason">
            <Autocomplete
              fullWidth
              options={reasonCodes}
              getOptionLabel={(o) => o.label || ''}
              value={reasonCodes.find((rc) => rc.value === headerInfo.reason_code) || null}
              onChange={(e, v) => handleHeaderChange('reason_code', v ? v.value : '')}
              renderInput={(p) => <TextField {...p} size="small" sx={inputStyle} />}
              sx={{
                ...inputStyle,
                '& .MuiInputBase-root': {
                  height: 40
                }
              }}
            />
          </ResponsiveHeaderRow>

          <ResponsiveHeaderRow label="Date">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={headerInfo.adjustment_date}
                onChange={(nv) => handleHeaderChange('adjustment_date', nv)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: inputStyle
                  }
                }}
              />
            </LocalizationProvider>
          </ResponsiveHeaderRow>

          <ResponsiveHeaderRow label="Notes">
            <TextField
              fullWidth
              value={headerInfo.notes}
              onChange={(e) => handleHeaderChange('notes', e.target.value)}
              size="small"
              multiline
              rows={2}
              sx={inputStyle}
            />
          </ResponsiveHeaderRow>
        </Box>

        {/* Items list — same rendering logic from AddInventoryAdjustment */}
        {lines.map((line, idx) => {
          const selectedIds = lines
            .filter((_, i) => i !== idx)
            .map((l) => l.product?.product_id)
            .filter(Boolean);
          return (
            <Card key={idx} variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <ProductSelector
                      products={products}
                      businessUnitId={headerInfo.business_unit?.business_unit_id}
                      locationId={headerInfo.location?.location_id}
                      selectedProductIds={selectedIds}
                      value={line.product}
                      onChange={(v) => handleLineChange(idx, 'product', v)}
                    />
                  </Grid>

                  {/* Quantity fields */}
                  {headerInfo.adjustment_type === 'quantity' && (
                    <>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          label="Previous Quantity"
                          type="number"
                          value={line.previous_quantity}
                          onChange={(e) => handleLineChange(idx, 'previous_quantity', e.target.value)}
                          size="small"
                          sx={inputStyle}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          label="New Quantity"
                          type="number"
                          value={line.new_quantity}
                          onChange={(e) => handleLineChange(idx, 'new_quantity', e.target.value)}
                          size="small"
                          sx={inputStyle}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2}>
                        <TextField
                          label="Δ Quantity"
                          type="number"
                          value={line.delta_quantity}
                          size="small"
                          sx={inputStyle}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                    </>
                  )}

                  {/* Value fields */}
                  {headerInfo.adjustment_type === 'value' && (
                    <>
                      <Grid item xs={6} sm={2.5}>
                        <TextField
                          label="Prev Price"
                          type="number"
                          value={line.previous_unit_price}
                          onChange={(e) => handleLineChange(idx, 'previous_unit_price', e.target.value)}
                          size="small"
                          sx={inputStyle}
                          InputProps={{ readOnly: true }}
                        />
                      </Grid>
                      <Grid item xs={6} sm={2.5}>
                        <TextField
                          label="New Price"
                          type="number"
                          value={line.new_unit_price}
                          onChange={(e) => handleLineChange(idx, 'new_unit_price', e.target.value)}
                          size="small"
                          sx={inputStyle}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} sm="auto">
                    <IconButton color="error" onClick={() => handleRemoveLine(idx)} disabled={lines.length === 1}>
                      <Trash />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          );
        })}

        {/* Actions */}
        <Box display="flex" gap={2}>
          <Button variant="dashed" startIcon={<Add />} onClick={handleAddLine}>
            Add Item
          </Button>
          <Button variant="contained" type="submit" disabled={loading}>
            Update
          </Button>
        </Box>
      </form>
    </MainCard>
  );
}
