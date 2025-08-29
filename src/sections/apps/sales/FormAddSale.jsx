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
  InputLabel,
  Alert,
  FormControlLabel,
  Switch,
  Tooltip
} from '@mui/material';
import { Add, Calculator, InfoCircle, Trash } from 'iconsax-react';
import { useGetCustomer } from 'api/customer';
import { useTool } from 'contexts/ToolContext';
import useBarcodeScanner from 'utils/scan';
import { previewBatchDeduction, useGetProducts } from 'api/products';
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
import WiderPopper from 'components/inputs/WiderPopper';
import useAuth from 'hooks/useAuth';

const initialEntry = {
  product: null,
  quantity: '',
  price: '',
  discountPercent: '',
  discountAmount: '',
  totalPrice: '',
  fromSale: false
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
  const [paidAmount, setPaidAmount] = useState('');
  const [paybackDate, setPaybackDate] = useState(null);
  const [salesType, setSalesType] = useState('normal');
  const [isFullyPaid, setIsFullyPaid] = useState(true);
  const [previewResults, setPreviewResults] = useState({});
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { customers } = useGetCustomer();
  const { products } = useGetProducts();
  const { setScanHandlerActive } = useTool();
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
      setPaidAmount('');
      setPaybackDate(sale.payback_day ? new Date(sale.payback_day) : null);
      setSalesType(sale.sale_type);
      setIsFullyPaid(sale.status === 'paid');

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
            totalPrice: item.total_price ? Number(item.total_price).toFixed(2) : '',
            fromSale: true
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

  const handlePreview = async (entry, idx) => {
    const productId = entry.product?.product_id;
    const quantity = Number(entry.quantity) || 0;
    const businessUnitId = saleInfo.business_unit?.business_unit_id;
    const locationId = saleInfo.location?.location_id;

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

  // Handles entry field changes
  const handleChange = (idx, field, value) => {
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i !== idx) return entry;

        // For product/quantity change, mark as new if previously from sale
        let updatedEntry = { ...entry, [field]: value };
        if (entry.fromSale && (field === 'product' || field === 'quantity')) {
          updatedEntry.fromSale = false;
        }

        if (field === 'product' && value) {
          updatedEntry.price = Number(value.unit_price).toFixed(2);
          updatedEntry.quantity = '';
          updatedEntry.discountPercent = '';
          updatedEntry.discountAmount = '';
          updatedEntry.totalPrice = '';
        }

        if (['quantity', 'price', 'discountPercent', 'discountAmount'].includes(field)) {
          const qty = Number(field === 'quantity' ? value : updatedEntry.quantity || 0);
          const price = Number(field === 'price' ? value : updatedEntry.price || 0);
          let discountAmount = Number(updatedEntry.discountAmount) || 0;

          if (discountAmount > qty * price) discountAmount = qty * price;
          let total = qty * price - discountAmount;

          updatedEntry = {
            ...updatedEntry,
            discountAmount: discountAmount.toFixed(2),
            quantity: qty > 0 ? qty : '',
            price: price > 0 ? price.toFixed(2) : '',
            totalPrice: total.toFixed(2)
          };
        }
        return updatedEntry;
      })
    );
    // For new entries or newly modified ones, trigger preview
    if ((!entries[idx].fromSale || field === 'product' || field === 'quantity') && value) {
      handlePreview({ ...entries[idx], [field]: value, fromSale: false }, idx);
    }
  };

  // Add and bulk add always create new entries
  const handleAdd = () => setEntries([...entries, { ...initialEntry, fromSale: false }]);
  const handleBulkAdd = () => {
    const count = parseInt(bulkAddCount, 10);
    if (isNaN(count) || count < 1 || count > 100) return;
    const newEntries = Array.from({ length: count }, () => ({ ...initialEntry, fromSale: false }));
    setEntries((prev) => [...prev, ...newEntries]);
    setBulkAddCount('');
  };
  const handleBulkAddKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBulkAdd();
    }
  };

  useBarcodeScanner((scanned) => {
    const trimmed = scanned.trim().toUpperCase();
    const foundProduct = products.find((p) => p.sku?.toUpperCase() === trimmed || p.barcode?.toUpperCase() === trimmed);
    if (!foundProduct) {
      console.warn('❌ No product found for scanned code:', scanned);
      return;
    }
    setEntries((prev) => {
      if (prev.length === 1 && !prev.product) {
        const updated = [
          {
            ...initialEntry,
            product: foundProduct,
            price: Number(foundProduct.unit_price),
            fromSale: false
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
      return [...prev, { ...initialEntry, product: foundProduct, price: Number(foundProduct.unit_price), fromSale: false }];
    });
  });

  useEffect(() => {
    if (isFullyPaid) setPaybackDate(null);
  }, [isFullyPaid]);

  const handleRemove = (idx) => setEntries(entries.filter((_, i) => i !== idx));

  const hasValidEntry = entries.some((entry) => entry.product && Number(entry.quantity) > 0);

  // Totals: for display panel always use the rendered values (follow original sale data for existing, preview/batch data for new)
  const displayTotals = entries.reduce(
    (acc, entry, idx) => {
      let subtotal, discount, total;
      // Existing sale item (not modified): use sale fields
      if (entry.fromSale) {
        const price = Number(entry.price) || 0;
        const qty = Number(entry.quantity) || 0;
        subtotal = price * qty;
        discount = Number(entry.discountAmount) || 0;
        total = subtotal - discount;
      } else {
        // New/modified: use preview if available, else fall back to current fields
        const preview = previewResults[idx];
        const previewLineTotal = preview && typeof preview.grand_total === 'number' ? preview.grand_total : Number(entry.totalPrice) || 0;
        const discountPercent = Number(entry.discountPercent) || 0;
        const discountAmount = Number(entry.discountAmount) || 0;
        let totalDiscount = 0;
        if (discountPercent > 0) {
          totalDiscount = previewLineTotal * (discountPercent / 100);
        } else if (discountAmount > 0) {
          totalDiscount = discountAmount;
        }
        subtotal = previewLineTotal;
        discount = totalDiscount;
        total = Math.max(0, previewLineTotal - totalDiscount);
      }
      acc.subtotal += subtotal;
      acc.totalDiscount += discount;
      acc.grandTotal += total;
      return acc;
    },
    { subtotal: 0, totalDiscount: 0, grandTotal: 0 }
  );

  const balance = displayTotals.grandTotal - (Number(paidAmount) || 0);

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
    const invalidEntry = payload.find((entry) => !entry.product_id || entry.quantity <= 0 || entry.price <= 0);
    if (invalidEntry) return toast.error('Each row must have product, quantity > 0, price > 0');
    try {
      setLoading(true);
      const formToSend = {
        sale_id: sale.sale_id,
        company_id: user?.company_id,
        business_unit_id: saleInfo.business_unit.business_unit_id,
        location_id: saleInfo.location.location_id,
        customer_id: saleInfo.customer.customer_id,
        payback_date: paybackDate,
        paid_amount: paidAmount ? Number(paidAmount) : '',
        is_fully_paid: isFullyPaid,
        grand_total: displayTotals.grandTotal,
        sales_type: salesType,
        items: payload
      };
      const response = await updateSales(sale.sale_id, formToSend);
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
        <Typography variant="h5" mb={2}>
          Update Sales
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

        let displayPrice, displayTotal, displayDiscount, preview;
        if (entry.fromSale) {
          // Show original sale data
          displayPrice = entry.price;
          displayTotal = entry.totalPrice;
          displayDiscount = entry.discountAmount;
        } else {
          // Show preview data if available
          preview = previewResults[idx];
          displayPrice =
            preview && preview.batches && preview.batches.length > 1
              ? 'Mixed'
              : preview && preview.batches && preview.batches.length === 1
                ? preview.batches.unit_price
                : entry.price;

          const previewLineTotal = preview && typeof preview.grand_total === 'number' ? preview.grand_total : Number(entry.totalPrice) || 0;
          const discountPercent = Number(entry.discountPercent) || 0;
          const discountAmount = Number(entry.discountAmount) || 0;
          let totalDiscount = 0;
          if (discountPercent > 0) {
            totalDiscount = previewLineTotal * (discountPercent / 100);
          } else if (discountAmount > 0) {
            totalDiscount = discountAmount;
          }
          displayDiscount = totalDiscount.toFixed(2);
          displayTotal = Math.max(0, previewLineTotal - totalDiscount).toFixed(2);
        }

        return (
          <Card key={idx} variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
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
                    inputRef={(el) => (quantityRefs.current[idx] = el)}
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <TextField label="Unit Price" type="text" value={displayPrice} InputProps={{ readOnly: true }} size="small" />
                </Grid>
                {salesType === 'normal' && (
                  <Grid item xs={6} sm={2}>
                    <DiscountInput
                      discountPercent={entry.discountPercent}
                      discountAmount={entry.discountAmount}
                      price={Number(displayPrice)}
                      quantity={Number(entry.quantity)}
                      onChangeDiscountPercent={(val) => handleChange(idx, 'discountPercent', val)}
                      onChangeDiscountAmount={(val) => handleChange(idx, 'discountAmount', val)}
                    />
                  </Grid>
                )}
                <Grid item xs={6} sm={1.6} style={{ display: 'flex', alignItems: 'center' }}>
                  <TextField label="Total" value={displayTotal} InputProps={{ readOnly: true, style: { fontWeight: 700 } }} size="small" />
                </Grid>
                <Grid item xs={12} sm="auto">
                  {!entry.fromSale && preview && (
                    <Tooltip
                      arrow
                      placement="top"
                      title={
                        <Box sx={{ p: 1.5, bgcolor: '#76CA2E' }}>
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
                            <span>{preview.grand_total}</span>
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ display: 'flex', justifyContent: 'space-between', color: '#901C1F' }}
                          >
                            <span>Discount:</span>
                            <span>-{displayDiscount}</span>
                          </Typography>
                          <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>After Discount:</span>
                            <span>{displayTotal}</span>
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
        }}
      >
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Subtotal
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            ETB {displayTotals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="error.main">
            Discount
          </Typography>
          <Typography color="error.main">
            -ETB {(Number(displayTotals.totalDiscount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            Grand Total
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            ETB {displayTotals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
        <Divider sx={{ my: 1.5 }} />
        <FormControlLabel
          control={<Switch checked={isFullyPaid} onChange={(e) => setIsFullyPaid(e.target.checked)} color="primary" />}
          label={isFullyPaid ? 'Fully Paid' : 'Not Fully Paid'}
          sx={{ mb: 2 }}
        />
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
                slotProps={{ textField: { InputLabelProps: { shrink: true }, size: 'small' } }}
                sx={{ '& .MuiInputBase-root': { height: 40 } }}
                disabled={!hasValidEntry}
              />
            </Stack>
          )}
        </LocalizationProvider>
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
