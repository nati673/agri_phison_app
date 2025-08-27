import React, { useState, useEffect, useRef } from 'react';
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
  Radio,
  Tooltip
} from '@mui/material';
import { Add, AddCircle, PenRemove, Trash } from 'iconsax-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useTool } from 'contexts/ToolContext';
import useAuth from 'hooks/useAuth';
import useBarcodeScanner from 'utils/scan';
import { fetchProductBatches, useGetProducts } from 'api/products';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import { updateAdjustment } from 'api/adjustment';

import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import ProductSelector from 'sections/apps/product-center/products/ProductSelector';
import { renderBatchOption } from 'components/inputs/renderBatchOption';
import MainCard from 'components/MainCard';

// -------------------------------
// initial line object
// -------------------------------
const initialLine = {
  product: null,
  batch: null,
  previous_quantity: '',
  new_quantity: '',
  delta_quantity: '',
  previous_unit_price: '',
  new_unit_price: '',
  notes: '',
  isNew: true // mark to allow editable product/batch
};

const adjustmentTypes = [
  { label: 'Quantity', value: 'quantity' },
  { label: 'Value', value: 'value' }
];

const affectedTypes = [
  { label: 'Batch Quantity', value: 'batch_qty', group: 'quantity' },
  { label: 'Stock Quantity', value: 'stock_qty', group: 'quantity' },
  { label: 'Purchase Quantity', value: 'purchase_qty', group: 'quantity' },
  { label: 'Purchase Price', value: 'purchase_price', group: 'value' },
  { label: 'Selling Price', value: 'selling_price', group: 'value' }
];

const reasonCodeMap = {
  batch_qty: [
    { value: 'count_correction', label: 'Count Correction' },
    { value: 'theft', label: 'Theft' },
    { value: 'damage', label: 'Damage' },
    { value: 'spoilage', label: 'Spoilage' },
    { value: 'expired', label: 'Expired' },
    { value: 'opening_stock', label: 'Opening Stock' }
  ],
  stock_qty: [
    { value: 'count_correction', label: 'Count Correction' },
    { value: 'theft', label: 'Theft' },
    { value: 'damage', label: 'Damage' },
    { value: 'spoilage', label: 'Spoilage' },
    { value: 'expired', label: 'Expired' },
    { value: 'opening_stock', label: 'Opening Stock' }
  ],
  purchase_price: [
    { value: 'cost_correction', label: 'Cost Correction' },
    { value: 'NRV_write_down', label: 'NRV Write-down' },
    { value: 'standard_cost_update', label: 'Standard Cost Update' },
    { value: 'opening_stock', label: 'Opening Stock' }
  ],
  purchase_qty: [
    { value: 'count_correction', label: 'Count Correction' },
    { value: 'opening_stock', label: 'Opening Stock' }
  ],
  selling_price: [{ value: 'price_update', label: 'Price Update' }]
};

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    transition: 'all 0.2s ease-in-out'
  },
  '& .MuiInputLabel-root': { fontWeight: 500 }
};

// -------------------------------
// Helper row layout
// -------------------------------
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

// -------------------------------
// MAIN COMPONENT
// -------------------------------
export default function AdjustmentUpdateForm({ adjustment, closeModal, actionDone }) {
  const { products } = useGetProducts();
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { user } = useAuth();
  const { setScanHandlerActive } = useTool();

  const [headerInfo, setHeaderInfo] = useState({
    business_unit: null,
    location: null,
    adjustment_type: 'quantity',
    reason_code: '',
    adjustment_date: new Date(),
    notes: ''
  });
  const [affectedType, setAffectedType] = useState('stock_qty');
  const [lines, setLines] = useState([{ ...initialLine }]);
  const [bulkAddCount, setBulkAddCount] = useState('');
  const [loading, setLoading] = useState(false);
  const [productBatchesMap, setProductBatchesMap] = useState({});
  const newValueRefs = useRef([]);

  // On adjustment load
  useEffect(() => {
    setScanHandlerActive(false);
    if (adjustment && products.length > 0 && BusinessUnits && locations) {
      const bu = BusinessUnits.find((b) => b.business_unit_id === adjustment.business_unit_id) || null;
      const loc = locations.find((l) => l.location_id === adjustment.location_id) || null;

      setHeaderInfo({
        business_unit: bu,
        location: loc,
        adjustment_type: adjustment.adjustment_type,
        reason_code: adjustment.reason_code,
        adjustment_date: new Date(adjustment.adjustment_date),
        notes: adjustment.header_notes || ''
      });
      setAffectedType(adjustment.affected_type || 'stock_qty');

      const itemProductIds = adjustment.items.map((i) => i.product_id);
      Promise.all(
        itemProductIds.map((pid) =>
          fetchProductBatches(pid, adjustment.business_unit_id, adjustment.location_id)
            .then((resp) => ({ pid, batches: resp.data || [] }))
            .catch(() => ({ pid, batches: [] }))
        )
      ).then((batchLookup) => {
        const batchMap = {};
        batchLookup.forEach(({ pid, batches }) => {
          batchMap[pid] = batches;
        });
        setProductBatchesMap(batchMap);

        setLines(
          adjustment.items.map((i) => ({
            product: products.find((p) => p.product_id === i.product_id) || null,
            batch: (batchMap[i.product_id] || []).find((b) => b.batch_id === i.batch_id) || null,
            previous_quantity: i.previous_quantity ?? '',
            new_quantity: i.new_quantity ?? '',
            delta_quantity: i.delta_quantity ?? '',
            previous_unit_price: i.previous_unit_price ?? '',
            new_unit_price: i.new_unit_price ?? '',
            notes: i.notes || '',
            isNew: false // mark as old line
          }))
        );
      });
    }
  }, [adjustment, products, BusinessUnits, locations]);

  // Load missing batches
  useEffect(() => {
    const fetchNeededBatches = async () => {
      const neededProductIds = lines.map((line) => line.product?.product_id).filter((pid) => pid && !(pid in productBatchesMap));
      if (neededProductIds.length === 0) return;
      let mapCopy = { ...productBatchesMap };
      for (const pid of neededProductIds) {
        try {
          const batchesResp = await fetchProductBatches(pid, headerInfo.business_unit?.business_unit_id, headerInfo.location?.location_id);
          mapCopy[pid] = batchesResp.data || [];
        } catch (err) {
          mapCopy[pid] = [];
        }
      }
      setProductBatchesMap(mapCopy);
    };
    fetchNeededBatches();
  }, [lines, headerInfo.location?.location_id, headerInfo.business_unit?.business_unit_id]);

  // -------------------------------
  // Handlers
  // -------------------------------
  const handleHeaderChange = (field, value) => {
    setHeaderInfo((p) => ({ ...p, [field]: value }));
  };

  const handleLineChange = (idx, field, value) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== idx) return line;
        let updated = { ...line, [field]: value };
        if (field === 'previous_quantity' || field === 'new_quantity') {
          const prevQty = parseFloat(updated.previous_quantity) || 0;
          const newQty = parseFloat(updated.new_quantity) || 0;
          updated.delta_quantity = (newQty - prevQty).toFixed(3);
        }
        if (field === 'batch' && value) {
          updated.previous_quantity = value.quantity ?? '';
          if (headerInfo.adjustment_type === 'value') {
            if (affectedType === 'selling_price') updated.previous_unit_price = value.selling_price ?? '';
            else if (affectedType === 'purchase_price') updated.previous_unit_price = value.purchase_price ?? '';
            else updated.previous_unit_price = '';
          }
        }
        return updated;
      })
    );
  };

  const handleAddLine = () => setLines([...lines, { ...initialLine }]);
  const handleRemoveLine = (idx) => setLines(lines.filter((_, i) => i !== idx));
  const handleClearLine = (idx) => setLines((prev) => prev.map((line, i) => (i === idx ? { ...initialLine } : line)));

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
      affected_type: affectedType,
      reason_code: headerInfo.reason_code,
      adjustment_status: 'approved',
      notes: headerInfo.notes,
      adjusted_by: user?.user_id,
      adjustment_date: headerInfo.adjustment_date ? format(headerInfo.adjustment_date, 'yyyy-MM-dd') : null
    };
    const items = lines.map((l) => ({
      item_id: adjustment.items.find((i) => i.product_id === l.product?.product_id)?.item_id || null,
      product_id: l.product?.product_id || null,
      batch_id: l.batch?.batch_id || null,
      previous_quantity: headerInfo.adjustment_type === 'quantity' ? parseFloat(l.previous_quantity) || 0 : undefined,
      new_quantity: headerInfo.adjustment_type === 'quantity' ? parseFloat(l.new_quantity) || 0 : undefined,
      previous_unit_price: headerInfo.adjustment_type === 'value' ? parseFloat(l.previous_unit_price) || null : undefined,
      new_unit_price: headerInfo.adjustment_type === 'value' ? parseFloat(l.new_unit_price) || null : undefined,
      notes: l.notes
    }));
    if (items.some((i) => !i.product_id)) {
      toast.error('Each line must have a product.');
      return;
    }
    try {
      setLoading(true);
      const res = await updateAdjustment(adjustment.header_id, {
        header,
        items
      });
      if (res.success) {
        toast.success(res.message);
        actionDone?.((prev) => !prev);
        closeModal?.();
      }
    } catch (err) {
      toast.error(err.message || 'Error updating adjustment');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <MainCard title={'Edit Inventory Adjustment'} border={false} boxShadow={false}>
      <form onSubmit={handleSubmit}>
        {/* HEADER SECTION */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3, maxWidth: 600 }}>
          {/* Business Unit */}
          <ResponsiveHeaderRow label="Business Unit">
            <Autocomplete
              fullWidth
              options={BusinessUnits || []}
              getOptionLabel={(o) => o.unit_name || ''}
              value={headerInfo.business_unit}
              renderOption={renderBusinessUnitOption}
              isOptionEqualToValue={(o, v) => o.business_unit_id === v.business_unit_id}
              renderInput={(p) => <TextField {...p} size="small" />}
              sx={inputStyle}
              readOnly
            />
          </ResponsiveHeaderRow>
          {/* Location */}
          <ResponsiveHeaderRow label="Location">
            <Autocomplete
              fullWidth
              options={locations || []}
              getOptionLabel={(o) => o.location_name || ''}
              value={headerInfo.location}
              renderOption={renderLocationOption}
              isOptionEqualToValue={(o, v) => o.location_id === v.location_id}
              renderInput={(p) => <TextField {...p} size="small" />}
              sx={inputStyle}
              readOnly
            />
          </ResponsiveHeaderRow>
          {/* Adjustment Type and Affected Type remain display-only */}
          <ResponsiveHeaderRow label="Type">
            <RadioGroup row value={headerInfo.adjustment_type} readOnly>
              {adjustmentTypes.map((t) => (
                <FormControlLabel key={t.value} value={t.value} control={<Radio size="small" />} label={t.label} />
              ))}
            </RadioGroup>
          </ResponsiveHeaderRow>
          <ResponsiveHeaderRow label="Affected Type">
            <Autocomplete
              fullWidth
              options={affectedTypes.filter((t) => t.group === headerInfo.adjustment_type)}
              getOptionLabel={(o) => o.label}
              value={affectedTypes.find((at) => at.value === affectedType) || null}
              renderInput={(p) => <TextField {...p} size="small" />}
              sx={inputStyle}
              readOnly
            />
          </ResponsiveHeaderRow>

          {/* Editable Reason */}
          <ResponsiveHeaderRow label="Reason">
            <Autocomplete
              fullWidth
              options={reasonCodeMap[affectedType]}
              getOptionLabel={(o) => o.label}
              value={reasonCodeMap[affectedType].find((rc) => rc.value === headerInfo.reason_code) || null}
              onChange={(e, v) => handleHeaderChange('reason_code', v ? v.value : '')}
              renderInput={(p) => <TextField {...p} size="small" required />}
              sx={inputStyle}
            />
          </ResponsiveHeaderRow>

          {/* Date - locked */}
          <ResponsiveHeaderRow label="Date">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker value={headerInfo.adjustment_date} readOnly />
            </LocalizationProvider>
          </ResponsiveHeaderRow>

          {/* Editable Notes */}
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

        {/* LINE ITEMS SECTION */}
        <Typography variant="body1" sx={{ mb: 1 }}>
          Adjustment Items
        </Typography>

        {lines.map((line, idx) => (
          <Card key={idx} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                {/* Product */}
                <Grid item xs={12} sm={4}>
                  <ProductSelector
                    products={products}
                    businessUnitId={headerInfo.business_unit?.business_unit_id}
                    locationId={headerInfo.location?.location_id}
                    value={line.product}
                    onChange={(v) => handleLineChange(idx, 'product', v)}
                    disabled={!line.isNew} // disable if old row
                  />
                </Grid>

                {/* Batch */}
                <Grid item xs={12} sm={3}>
                  <Autocomplete
                    fullWidth
                    options={productBatchesMap[line.product?.product_id] || []}
                    getOptionLabel={(b) => b.batch_code || `Batch ${b.batch_id}`}
                    value={line.batch}
                    onChange={(e, v) => handleLineChange(idx, 'batch', v)}
                    renderOption={(props, option, state) => renderBatchOption(props, option, state)}
                    renderInput={(p) => <TextField {...p} label="Batch" size="small" required />}
                    disabled={!line.product || !line.isNew}
                  />
                </Grid>

                {headerInfo.adjustment_type === 'quantity' && (
                  <>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        label="Previous Qty"
                        type="number"
                        value={line.previous_quantity}
                        size="small"
                        sx={inputStyle}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        label="New Qty"
                        type="number"
                        value={line.new_quantity}
                        onChange={(e) => handleLineChange(idx, 'new_quantity', e.target.value)}
                        size="small"
                        sx={inputStyle}
                        required
                      />
                    </Grid>
                  </>
                )}

                {headerInfo.adjustment_type === 'value' && (
                  <>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        label="Prev Price"
                        type="number"
                        value={line.previous_unit_price}
                        size="small"
                        sx={inputStyle}
                        InputProps={{ readOnly: true }}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        label="New Price"
                        type="number"
                        value={line.new_unit_price}
                        onChange={(e) => handleLineChange(idx, 'new_unit_price', e.target.value)}
                        size="small"
                        sx={inputStyle}
                        required
                      />
                    </Grid>
                  </>
                )}

                {/* Actions */}
                <Grid item xs={12} sm="auto">
                  <IconButton color="error" onClick={() => handleRemoveLine(idx)} disabled={lines.length === 1}>
                    <Trash />
                  </IconButton>
                  <IconButton color="warning" onClick={() => handleClearLine(idx)} size="small" aria-label="Clear Row" sx={{ ml: 1 }}>
                    <PenRemove />
                  </IconButton>
                  <IconButton color="default" onClick={handleAddLine} size="small" aria-label="Add Row" sx={{ ml: 1 }}>
                    <AddCircle />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

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
