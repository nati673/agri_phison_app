import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  InputLabel,
  Alert,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import { Add, Calculator, InfoCircle, Information, Trash } from 'iconsax-react';
import { useGetCustomer } from 'api/customer';
import { useTool } from 'contexts/ToolContext';
import useBarcodeScanner from 'utils/scan';
import { previewBatchDeduction, useGetProducts } from 'api/products';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import { renderProductOption } from 'components/inputs/renderProductOption';
import RenderCustomerOption from 'components/inputs/renderCustomerOption';
import getCustomerDisplayName from 'components/inputs/customerDisplayName';
import DiscountInput from 'sections/apps/sales/DiscountInput';
import MainCard from 'components/MainCard';
import { AddNewSales } from 'api/sales';
import toast from 'react-hot-toast';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import ProductSelector from 'sections/apps/product-center/products/ProductSelector';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { addDays } from 'date-fns';
import WiderPopper from 'components/inputs/WiderPopper';
import { useNavigate } from 'react-router';
import useAuth from 'hooks/useAuth';

const initialEntry = {
  product: null,
  quantity: '',
  price: '',
  discountPercent: '',
  discountAmount: '',
  totalPrice: ''
};

export default function SalesForm() {
  const [entries, setEntries] = useState([{ ...initialEntry }]);
  const [bulkAddCount, setBulkAddCount] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [saleInfo, setSaleInfo] = useState({
    business_unit: null,
    location: null,
    customer: null
  });
  const navigate = useNavigate();

  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { customers } = useGetCustomer();
  const { products } = useGetProducts();
  const { setScanHandlerActive } = useTool();
  const [paidAmount, setPaidAmount] = useState('');
  const [paybackDate, setPaybackDate] = useState(null);
  const [salesType, setSalesType] = useState('normal');
  const [isFullyPaid, setIsFullyPaid] = useState(true);

  const [previewResults, setPreviewResults] = useState({});

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

  const handleSaleInfoChange = (field, value) => {
    setSaleInfo((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'business_unit' ? { location: null } : {})
    }));
  };
  console.log(products);

  const handlePreview = async (entry, idx) => {
    const productId = entry.product?.product_id;
    const quantity = Number(entry.quantity) || 0;
    const businessUnitId = saleInfo.business_unit?.business_unit_id;
    const locationId = saleInfo.location?.location_id;
    const companyId = entry.product?.company_id || null;

    if (!productId || !quantity || !businessUnitId || !locationId || quantity <= 0) {
      setPreviewResults((prev) => ({ ...prev, [idx]: null }));
      return;
    }

    try {
      const preview = await previewBatchDeduction({
        company_id: user?.company_id,
        product_id: productId,
        business_unit_id: businessUnitId,
        location_id: locationId,
        quantity
      });
      setPreviewResults((prev) => ({ ...prev, [idx]: preview }));
    } catch (error) {
      setPreviewResults((prev) => ({ ...prev, [idx]: null }));
    }
  };

  const handleChange = (idx, field, value) => {
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i !== idx) return entry;
        let updatedEntry = { ...entry, [field]: value };
        if (field === 'product' && value) {
          updatedEntry.price = Number(value.unit_price);
          updatedEntry.discountPercent = '';
          updatedEntry.discountAmount = '';
          updatedEntry.totalPrice = '';
          updatedEntry.quantity = '';
        }

        if (['quantity', 'price', 'discountPercent', 'discountAmount'].includes(field)) {
          const quantity = Number(field === 'quantity' ? value : updatedEntry.quantity || 0);
          const price = Number(field === 'price' ? value : updatedEntry.price || 0);

          let discountPercent = Number(updatedEntry.discountPercent) || 0;
          let discountAmount = Number(updatedEntry.discountAmount) || 0;

          if (discountPercent < 0) discountPercent = 0;
          else if (discountPercent > 100) discountPercent = 100;

          if (discountAmount < 0) discountAmount = 0;
          if (discountAmount > price * quantity) discountAmount = price * quantity;

          let totalPrice = price * quantity - discountAmount;
          if (totalPrice < 0) totalPrice = 0;

          updatedEntry = {
            ...updatedEntry,
            discountPercent: discountPercent.toFixed(2),
            discountAmount: discountAmount.toFixed(2),
            totalPrice: totalPrice.toFixed(2),
            quantity: quantity > 0 ? quantity : '',
            price: price > 0 ? price.toFixed(2) : ''
          };
        }

        return updatedEntry;
      })
    );
    // Call preview after updating entry
    if ((field === 'product' || field === 'quantity') && value) {
      // Slight delay ensures latest state
      const updatedEntry = {
        ...entries[idx],
        [field]: value
      };
      handlePreview(updatedEntry, idx);
    }
  };

  const discountedTotals = entries.map((entry, idx) => {
    const preview = previewResults[idx];
    const previewLineTotal = preview && typeof preview.grand_total === 'number' ? preview.grand_total : 0;
    const discountPercent = Number(entry.discountPercent) || 0;
    const discountAmount = Number(entry.discountAmount) || 0;
    let totalDiscount = 0;
    if (discountPercent > 0) {
      totalDiscount = previewLineTotal * (discountPercent / 100);
    } else if (discountAmount > 0) {
      totalDiscount = discountAmount;
    }
    return Math.max(0, previewLineTotal - totalDiscount);
  });
  const realGrandTotal = discountedTotals.reduce((acc, total) => acc + total, 0);

  const balance = realGrandTotal - (Number(paidAmount) || 0);
  const subtotal = entries.reduce((acc, entry, idx) => {
    const preview = previewResults[idx];
    const previewLineTotal = preview && typeof preview.grand_total === 'number' ? preview.grand_total : 0;
    return acc + previewLineTotal;
  }, 0);

  // Calculate total discount
  const totalDiscountApplied = subtotal - realGrandTotal;
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

  const quantityRefs = useRef([]);
  useBarcodeScanner((scanned) => {
    const trimmed = scanned.trim().toUpperCase();
    const foundProduct = products.find((p) => p.sku?.toUpperCase() === trimmed || p.barcode?.toUpperCase() === trimmed);
    if (!foundProduct) {
      console.warn('❌ No product found for scanned code:', scanned);
      return;
    }
    setEntries((prev) => {
      if (prev.length === 1 && !prev[0].product) {
        const updated = [
          {
            ...initialEntry,
            product: foundProduct,
            price: Number(foundProduct.unit_price)
          }
        ];
        setTimeout(() => {
          quantityRefs.current?.focus();
        }, 100);
        return updated;
      }
      const newIndex = prev.length;
      setTimeout(() => {
        quantityRefs.current[newIndex]?.focus();
      }, 100);
      return [...prev, { ...initialEntry, product: foundProduct, price: Number(foundProduct.unit_price) }];
    });
  });

  useEffect(() => {
    if (isFullyPaid) setPaybackDate(null);
  }, [isFullyPaid, realGrandTotal]);

  const handleRemove = (idx) => setEntries(entries.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!saleInfo.business_unit) return toast.error('Please select a Business Unit');
    if (!saleInfo.location) return toast.error('Please select a Location');
    if (!saleInfo.customer) return toast.error('Please select a Customer');
    const payload = entries.map((entry) => ({
      product_id: entry.product?.product_id || null,
      quantity: Number(entry.quantity) || 0,
      price: Number(entry.price) || 0,
      discount_percent: Number(entry.discountPercent) || 0,
      discount_amount: Number(entry.discountAmount) || 0,
      total_price: Number(entry.totalPrice) || 0
    }));

    // const invalidEntry = payload.find((entry) => !entry.product_id || entry.quantity <= 0 || entry.price <= 0);
    // if (invalidEntry) return toast.error('Each row must have product, quantity > 0, price > 0');
    try {
      setLoading(true);
      const formToSend = {
        business_unit_id: saleInfo.business_unit.business_unit_id,
        location_id: saleInfo.location.location_id,
        customer_id: saleInfo.customer.customer_id,
        payback_date: paybackDate,
        paid_amount: paidAmount ? Number(paidAmount) : '',
        is_fully_paid: isFullyPaid,
        grand_total: realGrandTotal,
        sales_type: salesType,
        items: payload
      };
      const response = await AddNewSales(formToSend);
      if (response.success) {
        toast.success(response.message);
        setEntries([{ ...initialEntry }]);
        setSaleInfo({ business_unit: null, location: null, customer: null });
        setPaidAmount('');
        setPaybackDate(null);
        setSalesType('normal');
      }
      navigate('/workspace/sales/list');
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

  const hasValidEntry = entries.some((entry) => entry.product && Number(entry.quantity) > 0 && Number(entry.price) > 0);
  return (
    <form onSubmit={handleSubmit}>
      <MainCard sx={{ mb: 3, p: 3 }}>
        <Typography variant="h5" mb={2}>
          New Sale Entry
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={BusinessUnits || []}
              getOptionLabel={(opt) => opt.unit_name || ''}
              value={saleInfo.business_unit}
              onChange={(e, newVal) => handleSaleInfoChange('business_unit', newVal)}
              renderOption={renderBusinessUnitOption}
              isOptionEqualToValue={(o, v) => o.business_unit_id === v.business_unit_id}
              renderInput={(params) => <TextField {...params} label="Business Unit" size="small" required />}
              PopperComponent={WiderPopper}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={locationOptions}
              getOptionLabel={(opt) => opt.location_name || ''}
              value={saleInfo.location}
              renderOption={renderLocationOption}
              onChange={(e, newVal) => handleSaleInfoChange('location', newVal)}
              renderInput={(params) => <TextField {...params} label="Location" size="small" required />}
              isOptionEqualToValue={(o, v) => o.location_id === v.location_id}
              disabled={!saleInfo.business_unit}
              PopperComponent={WiderPopper}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Autocomplete
              options={customers}
              getOptionLabel={getCustomerDisplayName}
              value={saleInfo.customer}
              onChange={(e, newVal) => handleSaleInfoChange('customer', newVal)}
              renderOption={RenderCustomerOption}
              renderInput={(params) => <TextField {...params} label="Customer" size="small" required />}
              isOptionEqualToValue={(option, value) => option.customer_id === value.customer_id}
              PopperComponent={WiderPopper}
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
              onChange={(e, newVal) => setSalesType(newVal?.value || 'normal')}
              renderInput={(params) => <TextField {...params} size="small" required />}
              isOptionEqualToValue={(opt, val) => opt.value === val.value}
              sx={{ width: '100%' }}
            />
          </Grid>
        </Grid>

        {salesType === 'remaining' && (
          <Alert
            severity=""
            icon={<InfoCircle size={36} color="#1976d2" variant="Bold" />}
            sx={{ mt: 2, borderRadius: 2, py: 2, px: 3 }}
            role="alert"
            aria-live="polite"
          >
            <Typography variant="subtitle1" fontWeight={700} color="primary.main" gutterBottom>
              What is "By Remaining Stock"?
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              This mode lets you quickly enter the <b>counted quantities left on hand</b> for each product after a busy period or shift.
            </Typography>
            <Typography variant="h6" fontWeight={600} color="primary.main" sx={{ mt: 2 }}>
              How it works:
            </Typography>
            <Typography variant="body2" sx={{ ml: 2, mb: 2 }}>
              • Enter the <b style={{ color: '#d32f2f' }}>actual quantity remaining</b> for each product.
              <br />• The system automatically calculates and records what was sold:
            </Typography>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: '#f0f4c3',
                boxShadow: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 1,
                mt: 1
              }}
            >
              <Calculator size={24} color="#9e9d24" variant="Bold" />
              <Typography variant="body1" fontWeight={700} color="#616161" sx={{ fontFamily: 'monospace' }}>
                Sold = <span style={{ color: '#388e3c', fontWeight: 800 }}>Starting Stock</span> −{' '}
                <span style={{ color: '#d32f2f', fontWeight: 800 }}>Remaining Quantity</span>
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary', mb: 1 }}>
              • Use this for fast, bulk sale entry during rush hours or shift-end.
            </Typography>
            <Typography variant="body2" color="error.main" fontWeight={600} sx={{ mt: 1 }}>
              Remember: Enter only <u>what you have physically counted</u> right now.
            </Typography>
          </Alert>
        )}
      </MainCard>
      {entries.map((entry, idx) => {
        const selectedProductIds = entries
          .filter((_, i) => i !== idx)
          .map((e) => e.product?.product_id)
          .filter(Boolean);
        const preview = previewResults[idx];
        // Get first batch unit price for this line (or blank)
        const previewUnitPrice = preview && preview.batches && preview.batches.length > 0 ? Number(preview.batches[0].unit_price) : '';
        const enough_stock = preview ? preview.enough_stock : true;
        // Sum all batch subtotals for line total (or blank)
        const previewLineTotal = preview && typeof preview.grand_total === 'number' ? preview.grand_total : '';
        const discountPercent = Number(entry.discountPercent) || 0;
        const discountAmount = Number(entry.discountAmount) || 0;
        const discountPrice =
          preview && preview.batches && preview.batches.length === 1 ? Number(preview.batches[0].unit_price) : Number(entry.price);
        let totalDiscount = 0;
        if (discountPercent > 0) {
          totalDiscount = previewLineTotal * (discountPercent / 100);
        } else if (discountAmount > 0) {
          totalDiscount = discountAmount;
        }
        const finalLineTotal = Math.max(0, previewLineTotal - totalDiscount);
        return (
          <Card key={idx} variant="outlined" sx={{ mb: 3, borderColor: !enough_stock ? 'red' : '' }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                {/* --- Product/Qty/Price/Discounts logic unchanged --- */}
                <Grid item xs={12} sm={3}>
                  <ProductSelector
                    products={products}
                    businessUnitId={saleInfo.business_unit?.business_unit_id}
                    locationId={saleInfo.location?.location_id}
                    selectedProductIds={selectedProductIds}
                    value={entry.product}
                    onChange={(newVal) => handleChange(idx, 'product', newVal)}
                    price={false}
                    disabled={!saleInfo.location?.location_id || !saleInfo.business_unit?.business_unit_id}
                  />
                </Grid>
                {salesType === 'remaining' && entry.product && (
                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="Starting Stock"
                      type="number"
                      inputProps={{ min: 0, step: '0.01' }}
                      value={entry.product.quantity ?? '-'}
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                  </Grid>
                )}
                <Grid item xs={6} sm={2}>
                  <TextField
                    label={salesType === 'remaining' ? 'Remaining qty' : 'Quantity'}
                    type="number"
                    inputProps={{ min: 0 }}
                    value={entry.quantity}
                    onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
                    required
                    size="small"
                    error={Boolean(entry.error)}
                    inputRef={(el) => (quantityRefs.current[idx] = el)}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField
                    label="Unit Price"
                    type="text"
                    value={
                      preview && preview.batches && preview.batches.length > 1
                        ? 'Mixed'
                        : preview && preview.batches && preview.batches.length === 1
                          ? preview.batches[0].unit_price
                          : ''
                    }
                    onChange={(e) => handleChange(idx, 'price', e.target.value)}
                    InputProps={{ readOnly: true }}
                    size="small"
                  />
                </Grid>
                {salesType === 'normal' && (
                  <Grid item xs={6} sm={2}>
                    <DiscountInput
                      discountPercent={entry.discountPercent}
                      discountAmount={entry.discountAmount}
                      price={discountPrice}
                      quantity={Number(entry.quantity)}
                      onChangeDiscountPercent={(val) => handleChange(idx, 'discountPercent', val)}
                      onChangeDiscountAmount={(val) => handleChange(idx, 'discountAmount', val)}
                    />
                  </Grid>
                )}
                <Grid item xs={6} sm={1.6} style={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    label="Total"
                    value={finalLineTotal}
                    InputProps={{ readOnly: true, style: { fontWeight: 700 } }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm="auto">
                  {preview && (
                    <Tooltip
                      arrow
                      placement="top"
                      title={
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: '#76CA2E'
                          }}
                        >
                          <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                            FIFO / LIFO Batch Pricing
                          </Typography>

                          {preview.batches.map((batch) => (
                            <Box key={batch.batch_id} display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                              <Typography variant="body2">
                                #{batch.batch_code} &nbsp; ({batch.quantity} × {batch.unit_price})
                              </Typography>
                              <Typography variant="body2" fontWeight={900}>
                                {batch.subtotal}
                              </Typography>
                            </Box>
                          ))}

                          <Divider sx={{ my: 1 }} />

                          <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Line Total:</span>
                            <span>{preview.grand_total}</span>
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Pre-discount:</span>
                            <span>{previewLineTotal.toFixed(2)}</span>
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ display: 'flex', justifyContent: 'space-between', color: '#901C1F' }}
                          >
                            <span>Discount:</span>
                            <span>-{totalDiscount.toFixed(2)}</span>
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>After Discount:</span>
                            <span>{finalLineTotal.toFixed(2)}</span>
                          </Typography>
                          {!preview.enough_stock && (
                            <Typography variant="body2" color="ButtonHighlight" sx={{ display: 'block', mt: 1 }}>
                              ⚠ Not enough stock to fully fulfill this request!
                            </Typography>
                          )}
                        </Box>
                      }
                    >
                      <IconButton sx={{ mt: { xs: 1, sm: 0 } }}>
                        <InfoCircle />
                      </IconButton>
                    </Tooltip>
                  )}
                </Grid>
                <Grid item xs={12} sm="auto">
                  <IconButton
                    color="error"
                    onClick={() => handleRemove(idx)}
                    disabled={entries.length === 1}
                    aria-label="Remove Entry"
                    sx={{ mt: { xs: 1, sm: 0 } }}
                  >
                    <Trash />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}
      <Box display="flex" gap={2} alignItems="center">
        <Button variant="dashed" startIcon={<Add />} onClick={handleAdd} sx={{ mb: 2 }}>
          Add Item
        </Button>
        <Button variant="contained" type="submit" sx={{ mb: 2 }} disabled={loading}>
          Submit
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
          sx={{ width: 140, mb: 2 }}
        />
        <Button
          variant="outlined"
          sx={{ mb: 2 }}
          onClick={handleBulkAdd}
          disabled={!bulkAddCount || isNaN(bulkAddCount) || bulkAddCount < 1}
        >
          Add
        </Button>
      </Box>
      <MainCard
        boxShadow={false}
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          maxWidth: 420,
          marginLeft: 'auto',
          border: '1px solid #eee',
          borderRadius: 2
          // background: '#fafafa'
        }}
      >
        {/* Subtotal & Discount Section */}
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Subtotal
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            ETB {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />

        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="error.main">
            Discount
          </Typography>
          <Typography color="error.main">
            -ETB {(Number(totalDiscountApplied) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Grand Total */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            Grand Total
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            ETB {realGrandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Divider sx={{ my: 1.5 }} />
        <FormControlLabel
          control={<Switch checked={isFullyPaid} onChange={(e) => setIsFullyPaid(e.target.checked)} color="primary" />}
          label={isFullyPaid ? 'Fully Paid' : 'Not Fully Paid'}
          sx={{ mb: 2 }}
        />

        {/* Paid Amount Input */}
        {salesType === 'normal' && !isFullyPaid && (
          <TextField
            label="Enter Paid Amount"
            type="number"
            size="small"
            fullWidth
            value={paidAmount}
            disabled={!hasValidEntry}
            onChange={(e) => setPaidAmount(e.target.value)}
            inputProps={{ min: 0, step: '0.01' }}
          />
        )}

        {!isFullyPaid && (
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mt: 1,
              p: 1,
              borderRadius: 1,
              backgroundColor: balance > 0 ? '#e2ffc9' : balance < 0 ? '#fff8e1' : '#e8f5e9'
            }}
          >
            <Typography variant="body1" fontWeight={600}>
              Unpaid Balance:
            </Typography>
            <Typography variant="body1" fontWeight={600} color={balance > 0 ? 'error.main' : balance < 0 ? 'warning.main' : 'success.main'}>
              {balance > 0
                ? `ETB ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                : balance < 0
                  ? `Overpaid by ETB ${Math.abs(balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                  : hasValidEntry
                    ? 'Fully Paid'
                    : 'No items added'}
            </Typography>
          </Box>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          {!isFullyPaid && (
            <Stack spacing={1} mt={2}>
              <InputLabel>Payback Date</InputLabel>

              <DatePicker
                value={paybackDate}
                onChange={(newValue) => setPaybackDate(newValue)}
                minDate={addDays(new Date(), 1)}
                slotProps={{
                  textField: { InputLabelProps: { shrink: true }, size: 'small' }
                }}
                sx={{ '& .MuiInputBase-root': { height: 40 } }}
                disabled={!hasValidEntry}
              />
            </Stack>
          )}
        </LocalizationProvider>
      </MainCard>
    </form>
  );
}
