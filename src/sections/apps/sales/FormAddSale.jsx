import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Divider,
  Stack,
  InputLabel
} from '@mui/material';
import { Add, Trash } from 'iconsax-react';
import { useGetCustomer } from 'api/customer';
import { useTool } from 'contexts/ToolContext';
import { useGetProducts } from 'api/products';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import RenderCustomerOption from 'components/inputs/renderCustomerOption';
import getCustomerDisplayName from 'components/inputs/customerDisplayName';
import DiscountInput from 'sections/apps/sales/DiscountInput';
import MainCard from 'components/MainCard';
import { updateSales } from 'api/sales';
import toast from 'react-hot-toast';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import ProductSelector from 'sections/apps/product-center/products/ProductSelector';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { addDays } from 'date-fns';
import useAuth from 'hooks/useAuth';

const initialEntry = {
  product: null,
  quantity: '',
  price: '',
  discountPercent: '',
  discountAmount: '',
  totalPrice: ''
};

export default function SalesEditForm({ sale, closeModal, actionDone }) {
  const [entries, setEntries] = useState([{ ...initialEntry }]);
  const [bulkAddCount, setBulkAddCount] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const [saleInfo, setSaleInfo] = useState({
    business_unit: null,
    location: null,
    customer: null
  });

  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { customers } = useGetCustomer();
  const { products } = useGetProducts();
  const { setScanHandlerActive } = useTool();

  const [paidAmount, setPaidAmount] = useState('');
  const [paybackDate, setPaybackDate] = useState(null);
  const [salesType, setSalesType] = useState('normal');
  const quantityRefs = useRef([]);

  const locationOptions = useMemo(
    () =>
      saleInfo.business_unit
        ? (saleInfo.business_unit.locations || []).filter((loc) => loc.location_type !== 'branch')
        : (locations || []).filter((loc) => loc.location_type !== 'branch'),
    [saleInfo.business_unit, locations]
  );

  useEffect(() => {
    setScanHandlerActive(false);
  }, []);

  useEffect(() => {
    if (sale && BusinessUnits && locations && customers && products && sale.items) {
      const business_unit_obj = BusinessUnits.find((bu) => bu.business_unit_id === sale.business_unit_id) || {
        business_unit_id: sale.business_unit_id,
        unit_name: sale.unit_name
      };
      const location_obj = locations.find((loc) => loc.location_id === sale.location_id) || {
        location_id: sale.location_id,
        location_name: sale.location_name
      };
      const customer_obj = customers.find((c) => c.customer_id === sale.customer_id) || {
        customer_id: sale.customer_id,
        customer_name: sale.customer_name
      };

      setSaleInfo({
        business_unit: business_unit_obj,
        location: location_obj,
        customer: customer_obj
      });
      setPaidAmount(sale.paid_amount ? sale.paid_amount.toString() : '');
      setPaybackDate(sale.payback_day ? new Date(sale.payback_day) : null);
      setSalesType(sale.sale_type || 'normal');

      setEntries(
        (sale.items || []).map((item) => {
          const product_obj = products.find((p) => p.product_id === item.product_id) || {
            product_id: item.product_id,
            unit_price: item.unit_price
          };
          return {
            product: product_obj,
            quantity: item.quantity?.toString() || '',
            price: item.unit_price ? Number(item.unit_price).toFixed(2) : '',
            discountPercent: item.discount_percent ? Number(item.discount_percent).toFixed(2) : '',
            discountAmount: item.discount_amount ? Number(item.discount_amount).toFixed(2) : '',
            totalPrice: item.total_price ? Number(item.total_price).toFixed(2) : ''
          };
        })
      );
    }
  }, [sale, BusinessUnits, locations, customers, products]);

  const handleSaleInfoChange = (field, value) => {
    setSaleInfo((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'business_unit' ? { location: null } : {})
    }));
  };

  const handleChange = (idx, field, value) => {
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i !== idx) return entry;
        let updated = { ...entry, [field]: value };

        if (field === 'product' && value) {
          updated.price = Number(value.unit_price).toFixed(2);
          updated.quantity = '';
          updated.discountPercent = '';
          updated.discountAmount = '';
          updated.totalPrice = '';
        }

        if (['quantity', 'price', 'discountPercent', 'discountAmount'].includes(field)) {
          const qty = Number(updated.quantity) || 0;
          const price = Number(updated.price) || 0;
          let discountAmount = Number(updated.discountAmount) || 0;

          if (discountAmount > qty * price) discountAmount = qty * price;
          let total = qty * price - discountAmount;

          updated = {
            ...updated,
            discountAmount: discountAmount.toFixed(2),
            quantity: qty > 0 ? qty : '',
            price: price > 0 ? price.toFixed(2) : '',
            totalPrice: total.toFixed(2)
          };
        }
        return updated;
      })
    );
  };

  const handleAdd = () => setEntries([...entries, { ...initialEntry }]);
  const handleBulkAdd = () => {
    const count = parseInt(bulkAddCount, 10);
    if (isNaN(count) || count < 1 || count > 100) return;
    const newEntries = Array.from({ length: count }, () => ({ ...initialEntry }));
    setEntries((prev) => [...prev, ...newEntries]);
    setBulkAddCount('');
  };
  const handleBulkAddKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBulkAdd();
    }
  };

  const totals = entries.reduce(
    (acc, e) => {
      const qty = Number(e.quantity) || 0;
      const price = Number(e.price) || 0;
      const discount = Number(e.discountAmount) || 0;
      acc.subtotal += qty * price;
      acc.totalDiscount += discount;
      acc.grandTotal += qty * price - discount;
      return acc;
    },
    { subtotal: 0, totalDiscount: 0, grandTotal: 0 }
  );

  const balance = totals.grandTotal - (Number(paidAmount) || 0);
  const handleRemove = (idx) => setEntries((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!saleInfo.business_unit || !saleInfo.location || !saleInfo.customer) {
      return toast.error('Please complete all required fields');
    }
    const payload = entries.map((e) => ({
      product_id: e.product?.product_id,
      quantity: Number(e.quantity) || 0,
      price: Number(e.price) || 0,
      discount_percent: Number(e.discountPercent) || 0,
      discount_amount: Number(e.discountAmount) || 0,
      total_price: Number(e.totalPrice) || 0
    }));

    const invalidEntry = payload.find((entry) => !entry.product_id || entry.quantity <= 0 || entry.price <= 0);
    if (invalidEntry) {
      toast.error('Each row must have product, quantity > 0 and price > 0');
      return;
    }

    try {
      setLoading(true);
      const response = await updateSales(sale.sale_id, {
        sale_id: sale.sale_id,
        company_id: user?.company_id,
        business_unit_id: saleInfo.business_unit?.business_unit_id,
        location_id: saleInfo.location?.location_id,
        customer_id: saleInfo.customer?.customer_id,
        payback_date: paybackDate,
        paid_amount: Number(paidAmount),
        grand_total: totals.grandTotal,
        sales_type: salesType,
        items: payload
      });

      if (response.success) {
        toast.success(response.message || 'Sale updated successfully');
        actionDone?.();
        closeModal?.();
      }
    } catch (error) {
      if (Array.isArray(error.errors) && error.errors.length > 0) {
        error.errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error(error.message || 'Error submitting sales');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <MainCard sx={{ mb: 3, p: 3 }}>
        <Typography variant="h5" mb={4}>
          Update Sales
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={BusinessUnits || []}
              getOptionLabel={(opt) => opt.unit_name || ''}
              value={saleInfo.business_unit}
              onChange={(e, val) => handleSaleInfoChange('business_unit', val)}
              renderOption={renderBusinessUnitOption}
              isOptionEqualToValue={(o, v) => o.business_unit_id === v.business_unit_id}
              renderInput={(params) => <TextField {...params} label="Business Unit" size="small" required />}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={locationOptions}
              getOptionLabel={(opt) => opt.location_name || ''}
              value={saleInfo.location}
              onChange={(e, val) => handleSaleInfoChange('location', val)}
              renderOption={renderLocationOption}
              isOptionEqualToValue={(o, v) => o.location_id === v.location_id}
              renderInput={(params) => <TextField {...params} label="Location" size="small" required />}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={customers}
              getOptionLabel={getCustomerDisplayName}
              value={saleInfo.customer}
              onChange={(e, val) => handleSaleInfoChange('customer', val)}
              renderOption={RenderCustomerOption}
              isOptionEqualToValue={(o, v) => o.customer_id === v.customer_id}
              renderInput={(params) => <TextField {...params} label="Customer" size="small" required />}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={[
                { label: 'Normal Sale', value: 'normal' },
                { label: 'By Remaining Stock', value: 'remaining' }
              ]}
              getOptionLabel={(opt) => opt.label}
              value={
                salesType === 'normal' ? { label: 'Normal Sale', value: 'normal' } : { label: 'By Remaining Stock', value: 'remaining' }
              }
              onChange={(e, val) => setSalesType(val?.value || 'normal')}
              isOptionEqualToValue={(opt, val) => opt.value === val.value}
              renderInput={(params) => <TextField {...params} size="small" required />}
            />
          </Grid>
        </Grid>
      </MainCard>
      {entries.map((entry, idx) => {
        const selectedProductIds = entries
          .filter((_, i) => i !== idx)
          .map((e) => e.product?.product_id)
          .filter(Boolean);

        return (
          <Card key={idx} variant="outlined" sx={{ mt: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <ProductSelector
                    products={products}
                    businessUnitId={saleInfo.business_unit?.business_unit_id}
                    locationId={saleInfo.location?.location_id}
                    selectedProductIds={selectedProductIds}
                    value={entry.product}
                    onChange={(val) => handleChange(idx, 'product', val)}
                    disabled={!saleInfo.location?.location_id || !saleInfo.business_unit?.business_unit_id}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label={salesType === 'remaining' ? 'Remaining qty' : 'Quantity'}
                    type="number"
                    size="small"
                    value={entry.quantity}
                    onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
                    required
                    inputRef={(el) => (quantityRefs.current[idx] = el)}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Unit Price"
                    type="number"
                    size="small"
                    value={entry.price}
                    onChange={(e) => handleChange(idx, 'price', e.target.value)}
                  />
                </Grid>
                {salesType === 'normal' && (
                  <Grid item xs={6} sm={2}>
                    <DiscountInput
                      discountPercent={entry.discountPercent}
                      discountAmount={entry.discountAmount}
                      price={Number(entry.price)}
                      quantity={Number(entry.quantity)}
                      onChangeDiscountPercent={(val) => handleChange(idx, 'discountPercent', val)}
                      onChangeDiscountAmount={(val) => handleChange(idx, 'discountAmount', val)}
                    />
                  </Grid>
                )}
                <Grid item xs={6} sm={2}>
                  <TextField label="Total" value={entry.totalPrice} size="small" InputProps={{ readOnly: true }} />
                </Grid>
                <Grid item>
                  <IconButton color="error" onClick={() => handleRemove(idx)} disabled={entries.length === 1}>
                    <Trash />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}

      {/* Add Item & Bulk Add */}
      <Box display="flex" gap={2} alignItems="center" mt={2}>
        <Button variant="dashed" startIcon={<Add />} onClick={handleAdd}>
          Add Item
        </Button>
        <TextField
          label="Add Multiple Entries"
          placeholder="Number"
          type="number"
          size="small"
          value={bulkAddCount}
          inputProps={{ min: 1, max: 100 }}
          onChange={(e) => setBulkAddCount(e.target.value)}
          onKeyDown={handleBulkAddKeyDown}
          sx={{ width: 140 }}
        />
        <Button variant="outlined" onClick={handleBulkAdd} disabled={!bulkAddCount || isNaN(bulkAddCount) || bulkAddCount < 1}>
          Add
        </Button>
      </Box>

      <MainCard
        boxShadow={false}
        sx={{
          p: 2,
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          maxWidth: 420,
          marginLeft: 'auto',
          border: '1px solid #eee',
          borderRadius: 2
        }}
      >
        <Box display="flex" justifyContent="space-between">
          <Typography>Subtotal</Typography>
          <Typography>ETB {totals.subtotal.toFixed(2)}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography color="error.main">Discount</Typography>
          <Typography color="error.main">-ETB {totals.totalDiscount.toFixed(2)}</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">Grand Total</Typography>
          <Typography variant="h6" color="primary.main">
            ETB {totals.grandTotal.toFixed(2)}
          </Typography>
        </Box>
        <TextField
          label="Paid Amount"
          type="number"
          size="small"
          fullWidth
          value={paidAmount}
          onChange={(e) => setPaidAmount(e.target.value)}
          sx={{ mt: 2 }}
        />
        {paidAmount !== '' && (
          <Box sx={{ mt: 1 }}>
            <Typography fontWeight={600}>Unpaid Balance:</Typography>
            <Typography color={balance > 0 ? 'error.main' : balance < 0 ? 'warning.main' : 'success.main'}>
              {balance > 0 ? `ETB ${balance.toFixed(2)}` : balance < 0 ? `Overpaid by ETB ${Math.abs(balance).toFixed(2)}` : 'Fully Paid'}
            </Typography>
          </Box>
        )}
        {paidAmount && Number(paidAmount) !== totals.grandTotal && (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Stack spacing={1} mt={2}>
              <InputLabel>Payback Date</InputLabel>
              <DatePicker
                value={paybackDate}
                onChange={(newVal) => setPaybackDate(newVal)}
                minDate={addDays(new Date(), 1)}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Stack>
          </LocalizationProvider>
        )}
      </MainCard>
      <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
        <Button onClick={closeModal} variant="outlined">
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          Update
        </Button>
      </Box>
    </form>
  );
}
