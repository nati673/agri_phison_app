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
  Radio
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
import { addInventoryAdjustment } from 'api/adjustment';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import ProductSelector from 'sections/apps/product-center/products/ProductSelector';
import { requiredInputStyle } from 'components/inputs/requiredInputStyle';

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
    // backgroundColor: '#fff',
    transition: 'all 0.2s ease-in-out'
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500
  }
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

const affectedTypes = [
  // Quantity-related options
  { label: 'Batch Quantity', value: 'batch_qty', group: 'quantity' },
  { label: 'Stock Quantity', value: 'stock_qty', group: 'quantity' },
  { label: 'Purchase Quantity', value: 'purchase_qty', group: 'quantity' },

  // Price-related options
  { label: 'Purchase Price', value: 'purchase_price', group: 'value' },
  { label: 'Selling Price', value: 'selling_price', group: 'value' }
];

export default function AddInventoryAdjustment() {
  const { products } = useGetProducts();
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { user } = useAuth();
  const { setScanHandlerActive } = useTool();
  const newValueRefs = useRef([]);
  const [affectedType, setAffectedType] = useState('stock_qty');
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/') {
        // Focus the first available input
        if (newValueRefs.current && newValueRefs.current.length > 0) {
          for (let i = 0; i < newValueRefs.current.length; i++) {
            if (newValueRefs.current[i]) {
              newValueRefs.current[i].focus();
              break;
            }
          }
        }
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [headerInfo, setHeaderInfo] = useState({
    business_unit: null,
    location: null,
    adjustment_type: 'quantity',
    reason_code: '',
    adjustment_date: new Date(),
    notes: ''
  });

  const [lines, setLines] = useState([{ ...initialLine }]);
  const [bulkAddCount, setBulkAddCount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setScanHandlerActive(false);
  }, []);

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

        if (field === 'product' && value) {
          updated.previous_quantity = value.quantity || 0;
          updated.previous_unit_price = value.unit_price || 0;
        }

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
  function playErrorBeep() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime); // 600Hz beep
    oscillator.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.4);
  }

  useBarcodeScanner((scanned) => {
    const code = scanned.trim().toUpperCase();
    const foundProduct = products.find((p) => p.sku?.toUpperCase() === code || p.barcode?.toUpperCase() === code);
    if (!foundProduct) return toast.error('Product not found');

    // Check if product already in lines
    setLines((prev) => {
      const current = Array.isArray(prev) ? prev : [{ ...initialLine }];
      const alreadyScanned = current.some((line) => line.product?.product_id === foundProduct.product_id);

      if (alreadyScanned) {
        playErrorBeep();
        toast.error('Product already scanned');
        return current;
      }

      // First scan: replace initial empty line, otherwise push new line
      if (current.length === 1 && !current[0].product) {
        toast.success(`Product added: ${foundProduct.name || foundProduct.sku || foundProduct.product_id}`);
        return [
          {
            ...current,
            product: foundProduct,
            previous_quantity: foundProduct.quantity || 0,
            previous_unit_price: foundProduct.unit_price || 0
          }
        ];
      }

      toast.success(`Product added: ${foundProduct.name || foundProduct.sku || foundProduct.product_id}`);

      return [
        ...current,
        {
          ...initialLine,
          product: foundProduct,
          previous_quantity: foundProduct.quantity || 0,
          previous_unit_price: foundProduct.unit_price || 0
        }
      ];
    });

    setHeaderInfo((prev) => {
      let updated = { ...prev };
      if (!prev.business_unit && foundProduct.business_unit_id) {
        updated.business_unit = BusinessUnits.find((bu) => bu.business_unit_id === foundProduct.business_unit_id);
      }
      if (!prev.location && foundProduct.location_id) {
        updated.location = locations.find((loc) => loc.location_id === foundProduct.location_id);
      }
      return updated;
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headerInfo.business_unit || !headerInfo.location) {
      toast.error('Business unit and location are required.');
      return;
    }

    const header = {
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
      let item = { product_id: l.product?.product_id || null };

      if (headerInfo.adjustment_type === 'quantity') {
        item.previous_quantity = parseFloat(l.previous_quantity) || 0;
        item.new_quantity = parseFloat(l.new_quantity) || 0;
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
      const res = await addInventoryAdjustment({ header, items });
      if (res.success) {
        toast.success(res.message);
        setLines([{ ...initialLine }]);

        setHeaderInfo({
          business_unit: null,
          location: null,
          adjustment_type: 'quantity',
          reason_code: '',
          adjustment_date: new Date(),
          notes: ''
        });
      }
    } catch (err) {
      if (Array.isArray(err.errors) && err.errors.length > 0) {
        err.errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  };
  const handleClearLine = (idx) => {
    setLines((prev) => prev.map((line, i) => (i === idx ? { ...initialLine } : line)));
  };
  const filteredAffectedTypes = affectedTypes.filter((t) => t.group === headerInfo.adjustment_type);
  const [productBatchesMap, setProductBatchesMap] = useState({});

  useEffect(() => {
    const fetchNeededBatches = async () => {
      const neededProductIds = lines.map((line) => line.product?.product_id).filter((pid) => pid && !(pid in productBatchesMap));

      if (neededProductIds.length === 0) return;

      let mapCopy = { ...productBatchesMap };

      for (const pid of neededProductIds) {
        try {
          // ✅ Pass location_id + business_unit_id if API supports filtering batches
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
  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
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
            renderInput={(p) => <TextField {...p} size="small" required />}
            sx={requiredInputStyle}
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
            renderInput={(p) => <TextField {...p} size="small" required />}
            sx={requiredInputStyle}
            disabled={!headerInfo.business_unit}
          />
        </ResponsiveHeaderRow>

        <ResponsiveHeaderRow label="Type">
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
        </ResponsiveHeaderRow>
        <ResponsiveHeaderRow label="Affected Type">
          <Autocomplete
            fullWidth
            options={filteredAffectedTypes}
            getOptionLabel={(o) => o.label}
            value={filteredAffectedTypes.find((at) => at.value === affectedType) || null}
            onChange={(e, v) => setAffectedType(v ? v.value : filteredAffectedTypes[0].value)}
            renderInput={(p) => <TextField {...p} size="small" />}
            sx={requiredInputStyle}
          />
        </ResponsiveHeaderRow>
        <ResponsiveHeaderRow label="Reason">
          <Autocomplete
            fullWidth
            options={reasonCodeMap[affectedType]}
            getOptionLabel={(o) => o.label}
            value={reasonCodeMap[affectedType].find((rc) => rc.value === headerInfo.reason_code) || null}
            onChange={(e, v) => handleHeaderChange('reason_code', v ? v.value : '')}
            renderInput={(p) => <TextField {...p} size="small" />}
            sx={requiredInputStyle}
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
                  sx: {
                    ...inputStyle,
                    '& .MuiInputBase-root': {
                      height: 40 // set your desired height here
                    }
                  }
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

      {/* Bulk Add */}
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <Typography variant="body1" sx={{ flexGrow: 1 }}>
          Adjustment Items
        </Typography>
        <TextField
          label="Add Entries"
          type="number"
          size="small"
          value={bulkAddCount}
          onChange={(e) => setBulkAddCount(e.target.value)}
          sx={{ width: 150, ...inputStyle }}
        />
        <Button variant="dashed" onClick={handleBulkAdd} disabled={!bulkAddCount}>
          Add
        </Button>
      </Box>

      {/* Lines */}
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
                    disabled={!headerInfo.business_unit || !headerInfo.location}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Autocomplete
                    fullWidth
                    options={productBatchesMap[line.product?.product_id] || []}
                    getOptionLabel={(b) => b.batch_code || `Batch ${b.batch_id}`}
                    value={line.batch || null}
                    onChange={(e, v) => handleLineChange(idx, 'batch', v)}
                    renderInput={(p) => <TextField {...p} label="Batch" size="small" />}
                    disabled={!line.product}
                    sx={requiredInputStyle}
                  />
                </Grid>
                {/* Quantity Inputs */}
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
                        inputRef={(el) => (newValueRefs.current[idx] = el)}
                      />
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        label="Δ Quantity"
                        type="number"
                        value={line.delta_quantity}
                        InputProps={{ readOnly: true }}
                        size="small"
                        sx={inputStyle}
                      />
                    </Grid>
                  </>
                )}

                {/* Value Inputs */}
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
                        inputRef={(el) => (newValueRefs.current[idx] = el)}
                      />
                    </Grid>
                  </>
                )}

                <Grid item xs={12} sm="auto">
                  <IconButton color="error" onClick={() => handleRemoveLine(idx)} disabled={lines.length === 1}>
                    <Trash />
                  </IconButton>
                  <IconButton color="warning" onClick={() => handleClearLine(idx)} size="small" aria-label="Clear Row" sx={{ ml: 1 }}>
                    <PenRemove />
                  </IconButton>
                  <IconButton color="default" onClick={handleAddLine} size="small" aria-label="Clear Row" sx={{ ml: 1 }}>
                    <AddCircle />
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
          Submit
        </Button>
      </Box>
    </form>
  );
}
