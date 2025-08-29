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
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useTool } from 'contexts/ToolContext';
import useAuth from 'hooks/useAuth';
import useBarcodeScanner from 'utils/scan';

import { useGetProducts } from 'api/products';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import { addOrder } from 'api/order';

import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import ProductSelector from 'sections/apps/product-center/products/ProductSelector';
import { requiredInputStyle } from 'components/inputs/requiredInputStyle';
import { useGetCustomer } from 'api/customer';
import RenderCustomerOption from 'components/inputs/renderCustomerOption';
import getCustomerDisplayName from 'components/inputs/customerDisplayName';
import { useNavigate } from 'react-router';

const initialLine = { product: null, quantity: '', unit_price: '' };

const orderStatusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' }
];

const inputStyle = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
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

export default function AddOrder() {
  const { products } = useGetProducts();
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { customers } = useGetCustomer();

  const { user } = useAuth();
  const { setScanHandlerActive } = useTool();

  const newValueRefs = useRef([]);

  useEffect(() => {
    setScanHandlerActive(false);
    const handleKeyDown = (e) => {
      if (e.key === '/') {
        if (newValueRefs.current?.length > 0) {
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
    customer: null,
    customer_name: '',
    order_date: new Date(),
    status: 'pending',
    notes: ''
  });

  const [lines, setLines] = useState([{ ...initialLine }]);
  const [bulkAddCount, setBulkAddCount] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const locationOptions = headerInfo.business_unit ? headerInfo.business_unit.locations || [] : locations || [];

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

        // Autofill unit price from product selection
        // if (field === 'product' && value) {
        //   updated.unit_price = value.unit_price || '';
        // }
        return updated;
      })
    );
  };

  const handleAddLine = () => setLines([...lines, { ...initialLine }]);
  const handleRemoveLine = (idx) => setLines(lines.filter((_, i) => i !== idx));
  const handleClearLine = (idx) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...initialLine } : l)));

  const handleBulkAdd = () => {
    const count = parseInt(bulkAddCount, 10);
    if (!count || count < 1 || count > 100) return;
    setLines((prev) => [...prev, ...Array(count).fill({ ...initialLine })]);
    setBulkAddCount('');
  };

  function playErrorBeep() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  }

  useBarcodeScanner((scanned) => {
    const code = scanned.trim().toUpperCase();
    const foundProduct = products.find((p) => p.sku?.toUpperCase() === code || p.barcode?.toUpperCase() === code);
    if (!foundProduct) return toast.error('Product not found');

    setLines((prev) => {
      const already = prev.some((l) => l.product?.product_id === foundProduct.product_id);
      if (already) {
        playErrorBeep();
        toast.error('Product already added');
        return prev;
      }
      toast.success(`Product added: ${foundProduct.name || foundProduct.sku}`);
      if (prev.length === 1 && !prev[0].product) {
        return [{ ...initialLine, product: foundProduct, quantity: 1, unit_price: foundProduct.unit_price || 0 }];
      }
      return [...prev, { ...initialLine, product: foundProduct, quantity: 1, unit_price: foundProduct.unit_price || 0 }];
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
    if (!headerInfo.business_unit || !headerInfo.location || !headerInfo.customer) {
      toast.error('Business unit, location, and customer name are required');
      return;
    }

    const items = lines.map((l) => ({
      product_id: l.product?.product_id || null,
      business_unit_id: headerInfo.business_unit?.business_unit_id || null,
      quantity: parseFloat(l.quantity) || 0,
      unit_price: parseFloat(l.unit_price) || 0
    }));

    if (items.some((i) => !i.product_id || !i.quantity || !i.unit_price)) {
      toast.error('Each line must have product, quantity, and unit price');
      return;
    }

    const total_amount = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

    const payload = {
      company_id: user?.company_id,
      customer_id: headerInfo.customer?.customer_id || null, // new
      customer_name: headerInfo.customer?.customer_first_name || '', // backend
      order_date: headerInfo.order_date ? format(headerInfo.order_date, 'yyyy-MM-dd') : null,
      status: headerInfo.status,
      total_amount,
      business_unit_id: headerInfo.business_unit?.business_unit_id,
      location_id: headerInfo.location?.location_id,
      items
    };

    try {
      setLoading(true);
      const res = await addOrder(payload);
      if (res.success) {
        toast.success(res.message || 'Order Created');
        setLines([{ ...initialLine }]);
        setHeaderInfo({
          business_unit: null,
          location: null,
          customer: null,
          order_date: new Date(),
          status: 'pending',
          notes: ''
        });
      }
      navigate('/workspace/order/list');
    } catch (err) {
      console.error(err);
      toast.error(err.message || err.error || 'Error creating order');
    } finally {
      setLoading(false);
    }
  };

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

        <ResponsiveHeaderRow label="Customer">
          <Autocomplete
            fullWidth
            options={customers || []}
            getOptionLabel={(option) => getCustomerDisplayName(option)}
            value={headerInfo.customer}
            onChange={(e, newValue) => handleHeaderChange('customer', newValue)}
            renderOption={RenderCustomerOption}
            renderInput={(params) => <TextField {...params} label="Customer" variant="outlined" size="small" required />}
            isOptionEqualToValue={(option, value) => option.customer_id === value.customer_id}
            slotProps={{
              paper: {
                sx: { width: 400, maxHeight: 350 }
              }
            }}
            sx={requiredInputStyle}
          />
        </ResponsiveHeaderRow>

        <ResponsiveHeaderRow label="Status">
          <RadioGroup row value={headerInfo.status} onChange={(e) => handleHeaderChange('status', e.target.value)} sx={{ flex: 1 }}>
            {orderStatusOptions.map((s) => (
              <FormControlLabel key={s.value} value={s.value} control={<Radio size="small" />} label={s.label} />
            ))}
          </RadioGroup>
        </ResponsiveHeaderRow>

        <ResponsiveHeaderRow label="Order Date">
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={headerInfo.order_date}
              onChange={(nv) => handleHeaderChange('order_date', nv)}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  sx: {
                    ...inputStyle,
                    '& .MuiInputBase-root': { height: 40 }
                  }
                }
              }}
            />
          </LocalizationProvider>
        </ResponsiveHeaderRow>
      </Box>

      {/* Bulk Add */}
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <Typography variant="body1" sx={{ flexGrow: 1 }}>
          Order Items
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
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Quantity"
                    type="number"
                    value={line.quantity}
                    onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                    size="small"
                    sx={inputStyle}
                    inputRef={(el) => (newValueRefs.current[idx] = el)}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Unit Price"
                    type="number"
                    value={line.unit_price}
                    onChange={(e) => handleLineChange(idx, 'unit_price', e.target.value)}
                    size="small"
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Total Price"
                    value={(parseFloat(line.quantity) || 0) * (parseFloat(line.unit_price) || 0)}
                    InputProps={{ readOnly: true }}
                    size="small"
                    sx={inputStyle}
                  />
                </Grid>
                <Grid item xs={12} sm="auto">
                  <IconButton color="error" onClick={() => handleRemoveLine(idx)} disabled={lines.length === 1}>
                    <Trash />
                  </IconButton>
                  <IconButton color="warning" onClick={() => handleClearLine(idx)} size="small" sx={{ ml: 1 }}>
                    <PenRemove />
                  </IconButton>
                  <IconButton color="default" onClick={handleAddLine} size="small" sx={{ ml: 1 }}>
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
          Submit Order
        </Button>
      </Box>
    </form>
  );
}
