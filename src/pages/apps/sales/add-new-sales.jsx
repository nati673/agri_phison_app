import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Card, CardContent, Grid, IconButton, TextField, Typography, Autocomplete, Paper, Divider } from '@mui/material';
import { Add, Trash } from 'iconsax-react';
import { useGetCustomer } from 'api/customer';
import { useTool } from 'contexts/ToolContext';
import useBarcodeScanner from 'utils/scan';
import { useGetProducts } from 'api/products';
import { renderProductOption } from 'components/inputs/renderProductOption';
import RenderCustomerOption from 'components/inputs/renderCustomerOption';
import DiscountInput from 'sections/apps/sales/DiscountInput';
import MainCard from 'components/MainCard';
import { AddNewSales } from 'api/sales';
import toast from 'react-hot-toast';

const initialEntry = {
  customer: null,
  product: null,
  quantity: '',
  price: '',
  discountPercent: '',
  discountAmount: '',
  totalPrice: ''
};

function SalesForm() {
  const [entries, setEntries] = useState([{ ...initialEntry }]);
  const [bulkAddCount, setBulkAddCount] = useState('');
  const { customers } = useGetCustomer();
  const { products } = useGetProducts();
  const [loading, setLoading] = useState(false);

  const { setScanHandlerActive } = useTool();

  useEffect(() => {
    setScanHandlerActive(false);
  }, []);

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
  };
  const totals = entries.reduce(
    (acc, entry) => {
      const qty = Number(entry.quantity) || 0;
      const price = Number(entry.price) || 0;
      const discountAmt = Number(entry.discountAmount) || 0;
      const lineTotal = qty * price - discountAmt;

      acc.subtotal += qty * price;
      acc.totalDiscount += discountAmt;
      acc.grandTotal += lineTotal;
      return acc;
    },
    { subtotal: 0, totalDiscount: 0, grandTotal: 0 }
  );
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
        const updated = [...prev];
        updated[0] = {
          ...initialEntry,
          product: foundProduct,
          price: Number(foundProduct.unit_price)
        };

        setTimeout(() => {
          quantityRefs.current[0]?.focus();
        }, 100);

        return updated;
      }

      const newIndex = prev.length;

      setTimeout(() => {
        quantityRefs.current[newIndex]?.focus();
      }, 100);

      return [
        ...prev,
        {
          ...initialEntry,
          product: foundProduct,
          price: Number(foundProduct.unit_price)
        }
      ];
    });
  });

  const handleRemove = (idx) => setEntries(entries.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedPayload = entries.map((entry) => ({
      customer_id: entry.customer?.customer_id || null,
      product_id: entry.product?.product_id || null,
      quantity: Number(entry.quantity) || 0,
      price: Number(entry.price) || 0,
      discount_percent: Number(entry.discountPercent) || 0,
      discount_amount: Number(entry.discountAmount) || 0,
      total_price: Number(entry.totalPrice) || 0
    }));

    // Basic validation: check all entries have required fields
    const invalidEntry = formattedPayload.find(
      (entry) => !entry.customer_id || !entry.product_id || entry.quantity <= 0 || entry.price <= 0
    );
    if (invalidEntry) {
      toast.error('Please fill in all required fields (customer, product, quantity, price) correctly.');
      return;
    }

    try {
      setLoading(true);
      const response = await AddNewSales(formattedPayload);

      if (response.success) {
        toast.success(response.message);
      }
      console.log('Sales added:', response);

      setEntries([{ ...initialEntry }]);
    } catch (error) {
      console.error('Error adding sales:', error);

      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerDisplayName = (customer) => {
    if (!customer) return '';
    if (customer.organization_name && customer.organization_name.trim() !== '') {
      return customer.organization_name;
    }
    return `${customer.customer_first_name} ${customer.customer_last_name}`;
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <Typography variant="h5" gutterBottom sx={{ flexGrow: 1 }}>
          Add Sales Entries
        </Typography>

        {/* Bulk Add Input */}
        <TextField
          label="Add Multiple Entries"
          placeholder="Number"
          type="number"
          size="small"
          value={bulkAddCount}
          inputProps={{ min: 1, max: 100 }}
          onChange={(e) => setBulkAddCount(e.target.value)}
          onKeyDown={handleBulkAddKeyDown}
          sx={{ width: 170 }}
        />
        <Button variant="outlined" onClick={handleBulkAdd} disabled={!bulkAddCount || isNaN(bulkAddCount) || bulkAddCount < 1}>
          Add
        </Button>
      </Box>

      {entries.map((entry, idx) => (
        <Card key={idx} variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2.6}>
                <Autocomplete
                  options={customers}
                  getOptionLabel={(option) => getCustomerDisplayName(option)}
                  value={entry.customer}
                  onChange={(e, newValue) => handleChange(idx, 'customer', newValue)}
                  renderOption={RenderCustomerOption}
                  renderInput={(params) => <TextField {...params} label="Customer" variant="outlined" size="small" />}
                  isOptionEqualToValue={(option, value) => option.customer_id === value.customer_id}
                  slotProps={{
                    paper: {
                      sx: {
                        width: 400,
                        maxHeight: 350
                      }
                    }
                  }}
                />
              </Grid>

              {/* Product */}
              <Grid item xs={12} sm={2.6}>
                <Autocomplete
                  options={products && products.length > 0 ? products : []}
                  getOptionLabel={(opt) => opt.product_name || ''}
                  value={entry?.product}
                  onChange={(e, newVal) => handleChange(idx, 'product', newVal)}
                  renderOption={renderProductOption}
                  renderInput={(params) => <TextField {...params} label="Product" variant="outlined" size="small" required />}
                  isOptionEqualToValue={(option, value) => option.product_id === value.product_id}
                  getOptionDisabled={(option) => option.is_active !== 1}
                  slotProps={{
                    paper: {
                      sx: {
                        width: 400,
                        maxHeight: 350
                      }
                    }
                  }}
                />
              </Grid>

              {/* Quantity */}
              <Grid item xs={6} sm={2}>
                <TextField
                  label="Quantity"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={entry.quantity}
                  onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.target.blur(); // Remove focus so next scan is captured properly
                    }
                  }}
                  fullWidth
                  required
                  size="small"
                  inputRef={(el) => (quantityRefs.current[idx] = el)} // attach ref
                />
              </Grid>

              {/* Unit Price */}
              <Grid item xs={6} sm={2}>
                <TextField
                  label="Unit Price"
                  type="number"
                  inputProps={{ min: 0, step: '0.01' }}
                  value={entry.price}
                  onChange={(e) => handleChange(idx, 'price', e.target.value)}
                  fullWidth
                  //   required
                  InputProps={{
                    readOnly: true
                  }}
                  size="small"
                />
              </Grid>

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

              {/* Remove Button */}
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
      ))}

      <Box display="flex" gap={2}>
        <Button variant="dashed" startIcon={<Add />} onClick={handleAdd} sx={{ mb: 2 }}>
          Add Item
        </Button>
        <Button variant="contained" type="submit" sx={{ mb: 2 }}>
          Submit
        </Button>
      </Box>
      <MainCard
        boxShadow={false}
        sx={{
          p: 2,
          // mt: -7,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: 400,
          marginLeft: 'auto'
        }}
      >
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body1" color="text.secondary">
            Subtotal
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            ETB {totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Typography variant="body1" color="error.main">
            Discount
          </Typography>
          <Typography variant="body1" color="error.main">
            -ETB {totals.totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6" fontWeight={700}>
            Grand Total
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            ETB {totals.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
      </MainCard>
    </form>
  );
}

export default SalesForm;
