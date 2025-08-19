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
import { useGetCustomer } from 'api/customer';
import { updateOrder } from 'api/order';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import ProductSelector from 'sections/apps/product-center/products/ProductSelector';
import MainCard from 'components/MainCard';
import getCustomerDisplayName from 'components/inputs/customerDisplayName';
import RenderCustomerOption from 'components/inputs/renderCustomerOption';
import { requiredInputStyle } from 'components/inputs/requiredInputStyle';

const initialLine = {
  product: null,
  quantity: '',
  unit_price: ''
};

const inputStyle = {
  '& .MuiOutlinedInput-root': { borderRadius: '10px', transition: 'all 0.2s ease-in-out' },
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

export default function OrderUpdateForm({ order = null, closeModal, actionDone }) {
  const { products } = useGetProducts();
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { customers } = useGetCustomer();
  const { user } = useAuth();
  const { setScanHandlerActive } = useTool();

  const [headerInfo, setHeaderInfo] = useState({
    business_unit: null,
    location: null,
    customer: null,
    order_date: new Date()
  });
  const [lines, setLines] = useState([{ ...initialLine }]);
  const [loading, setLoading] = useState(false);

  // Populate initial data
  useEffect(() => {
    setScanHandlerActive(false);
    if (order) {
      const bu = BusinessUnits?.find((b) => b.business_unit_id === order.business_unit_id) || null;
      const loc = locations?.find((l) => l.location_id === order.location_id) || null;
      const cust = customers?.find((c) => c.customer_id === order.customer_id) || null;

      setHeaderInfo({
        business_unit: bu,
        location: loc,
        customer: cust,
        order_date: order.order_date ? new Date(order.order_date) : new Date()
      });

      const mappedLines = Array.isArray(order.items)
        ? order.items.map((i) => ({
            product: products.find((p) => p.product_id === i.product_id) || null,
            quantity: i.quantity ?? '',
            unit_price: i.unit_price ?? ''
          }))
        : [{ ...initialLine }];
      setLines(mappedLines);
    }
  }, [order, BusinessUnits, locations, customers, products]);

  const locationOptions = headerInfo.business_unit ? headerInfo.business_unit.locations || [] : locations || [];

  const handleHeaderChange = (field, value) => {
    setHeaderInfo((prev) => ({ ...prev, [field]: value }));
    if (field === 'business_unit') setHeaderInfo((prev) => ({ ...prev, location: null }));
  };

  const handleLineChange = (idx, field, value) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== idx) return line;
        let updated = { ...line, [field]: value };

        // Autofill unit price from product selection
        if (field === 'product' && value) {
          updated.unit_price = value.unit_price || '';
        }
        return updated;
      })
    );
  };

  const handleAddLine = () => setLines([...lines, { ...initialLine }]);
  const handleRemoveLine = (idx) => setLines(lines.filter((_, i) => i !== idx));

  // Barcode scan support (matches AddOrder logic)
  useBarcodeScanner((code) => {
    const foundProduct = products.find(
      (p) => p.sku?.toUpperCase() === code.trim().toUpperCase() || p.barcode?.toUpperCase() === code.trim().toUpperCase()
    );
    if (!foundProduct) return toast.error('Product not found');
    setLines((prev) => {
      if (prev.some((l) => l.product?.product_id === foundProduct.product_id)) {
        toast.error('Product already in order');
        return prev;
      }
      return [...prev, { ...initialLine, product: foundProduct, quantity: 1, unit_price: foundProduct.unit_price || '' }];
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headerInfo.business_unit || !headerInfo.location || !headerInfo.customer) {
      toast.error('Business unit, location, and customer are required.');
      return;
    }
    const items = lines.map((l) => ({
      order_item_id: order.items.find((i) => i.product_id === l.product?.product_id)?.order_item_id || null,
      product_id: l.product?.product_id || null,
      business_unit_id: headerInfo.business_unit?.business_unit_id || null,
      quantity: parseFloat(l.quantity) || 0,
      unit_price: parseFloat(l.unit_price) || 0
    }));
    if (items.some((i) => !i.product_id || !i.quantity || !i.unit_price)) {
      toast.error('Each item must have product, quantity, and unit price');
      return;
    }
    const total_amount = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

    const payload = {
      order_id: order.order_id,
      company_id: user?.company_id,
      customer_id: headerInfo.customer?.customer_id || null,
      customer_name: headerInfo.customer?.name || '', // or your DisplayName fn
      order_date: headerInfo.order_date ? format(headerInfo.order_date, 'yyyy-MM-dd') : null,

      total_amount,
      business_unit_id: headerInfo.business_unit?.business_unit_id,
      location_id: headerInfo.location?.location_id,
      items
    };

    try {
      setLoading(true);
      const res = await updateOrder(payload.order_id, payload);
      if (res.success) {
        toast.success(res.message || 'Order updated');
        if (typeof actionDone === 'function') actionDone((prev) => !prev);
        closeModal?.();
      }
    } catch (err) {
      toast.error(err.message || 'Error updating order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title={'Edit Order'} border={false} boxShadow={false}>
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
              renderInput={(p) => <TextField {...p} size="small" required sx={inputStyle} />}
              disabled={!headerInfo.business_unit}
              sx={requiredInputStyle}
            />
          </ResponsiveHeaderRow>
          <ResponsiveHeaderRow label="Customer">
            <Autocomplete
              fullWidth
              options={customers || []}
              getOptionLabel={(option) => getCustomerDisplayName(option)}
              value={headerInfo.customer}
              onChange={(e, v) => handleHeaderChange('customer', v)}
              renderOption={RenderCustomerOption}
              isOptionEqualToValue={(option, value) => option.customer_id === value.customer_id}
              renderInput={(params) => <TextField {...params} label="Customer" size="small" required sx={inputStyle} />}
              slotProps={{
                paper: { sx: { width: 400, maxHeight: 350 } }
              }}
              sx={requiredInputStyle}
            />
          </ResponsiveHeaderRow>

          <ResponsiveHeaderRow label="Date">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={headerInfo.order_date}
                onChange={(nv) => handleHeaderChange('order_date', nv)}
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
        </Box>

        {/* Items list */}
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
                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="Quantity"
                      type="number"
                      value={line.quantity}
                      onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                      size="small"
                      sx={inputStyle}
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
                      inputProps={{ readOnly: true }}
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
