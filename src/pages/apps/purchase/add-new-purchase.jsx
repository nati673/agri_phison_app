import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Card, CardContent, Grid, IconButton, TextField, Typography, Autocomplete, Divider } from '@mui/material';
import { Add, Trash } from 'iconsax-react';
import toast from 'react-hot-toast';

import { useTool } from 'contexts/ToolContext';
import useBarcodeScanner from 'utils/scan';
import { useGetProducts } from 'api/products';
import { addPurchase } from 'api/purchase';
import { renderProductOption } from 'components/inputs/renderProductOption';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import MainCard from 'components/MainCard';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import useAuth from 'hooks/useAuth';
import ProductSelector from 'sections/apps/product-center/products/ProductSelector';
import { useNavigate } from 'react-router';

// Row structure
const initialEntry = {
  product: null,
  quantity: '',
  price: '',
  purchase_price: '',
  manufactureDate: '',
  expiryDate: ''
};

function AddNewPurchase() {
  const [entries, setEntries] = useState([{ ...initialEntry }]);
  const [bulkAddCount, setBulkAddCount] = useState('');
  const { products, refetch } = useGetProducts();
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [purchaseInfo, setPurchaseInfo] = useState({
    supplier: '',
    business_unit: null,
    location: null,
    purchaseDate: new Date()
  });
  const navigate = useNavigate();

  const { setScanHandlerActive } = useTool();
  const quantityRefs = useRef([]);

  useEffect(() => {
    setScanHandlerActive(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const handlePurchaseInfoChange = (field, value) => {
    setPurchaseInfo((prev) => {
      // Reset location if BU changes
      if (field === 'business_unit') {
        return { ...prev, [field]: value, location: null };
      }
      return { ...prev, [field]: value };
    });
  };

  // Inside your component, before return:
  const locationOptions = purchaseInfo.business_unit
    ? (purchaseInfo.business_unit.locations || []).filter((loc) => loc.location_type !== 'branch')
    : (locations || []).filter((loc) => loc.location_type !== 'branch');

  // Change handler for entries
  const handleChange = (idx, field, value) => {
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i !== idx) return entry;
        let updated = { ...entry, [field]: value };

        // Auto calc total cost when quantity or purchase_price changes
        if (field === 'quantity' || field === 'purchase_price') {
          const qty = Number(updated.quantity) || 0;
          const pricePerUnit = Number(updated.purchase_price) || 0;
          updated.total_cost = (qty * pricePerUnit).toFixed(2);
        }

        return updated;
      })
    );
  };

  const handleAdd = () => setEntries([...entries, { ...initialEntry }]);
  const handleRemove = (idx) => setEntries(entries.filter((_, i) => i !== idx));

  const handleBulkAdd = () => {
    const count = parseInt(bulkAddCount, 10);
    if (isNaN(count) || count < 1 || count > 100) return;
    setEntries((prev) => [...prev, ...Array(count).fill({ ...initialEntry })]);
    setBulkAddCount('');
  };

  useBarcodeScanner((scanned) => {
    const trimmed = scanned.trim().toUpperCase();
    const foundProduct = products.find((p) => p.sku?.toUpperCase() === trimmed || p.barcode?.toUpperCase() === trimmed);

    if (!foundProduct) {
      toast.error('Product not found for scanned code.');
      return;
    }

    setEntries((prev) => {
      if (prev.length === 1 && !prev[0].product) {
        const updated = [...prev];
        updated[0] = {
          ...initialEntry,
          product: foundProduct,
          price: Number(foundProduct.unit_price) || ''
        };
        setTimeout(() => quantityRefs.current[0]?.focus(), 100);
        return updated;
      }
      const newIndex = prev.length;
      setTimeout(() => quantityRefs.current[newIndex]?.focus(), 100);
      return [...prev, { ...initialEntry, product: foundProduct, price: Number(foundProduct.unit_price) || '' }];
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const header = {
      supplier: purchaseInfo.supplier,
      company_id: user?.company_id,
      business_unit_id: purchaseInfo.business_unit?.business_unit_id || null,
      location_id: purchaseInfo.location?.location_id || null,
      purchase_date: purchaseInfo.purchaseDate ? format(purchaseInfo.purchaseDate, 'yyyy-MM-dd') : null
    };

    const items = entries.map((entry) => ({
      product_id: entry.product?.product_id || null,
      quantity: Number(entry.quantity) || 0,
      purchase_price: Number(entry.purchase_price) || 0,
      selling_price: Number(entry.selling_price) || 0,
      manufacture_date: entry.manufactureDate || null,
      expiry_date: entry.expiryDate || null,
      batch_code: entry.batch_code || null
    }));

    // Validation
    const invalidItem = items.find((it) => !it.product_id || it.quantity <= 0 || it.purchase_price <= 0);
    if (!header.supplier || !header.business_unit_id || !header.location_id || invalidItem) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await addPurchase({ header, items });
      if (res.success) {
        toast.success(res.message);
        setEntries([{ ...initialEntry }]);
        setPurchaseInfo({
          supplier: '',
          business_unit: null,
          location: null,
          purchaseDate: new Date()
        });
      }
      navigate('/workspace/purchase/list');
    } catch (err) {
      if (Array.isArray(err.errors) && err.errors.length > 0) {
        err.errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error(err.message || 'Error submitting purchase');
      }
    } finally {
      setLoading(false);
    }
  };

  const totals = entries.reduce(
    (acc, entry) => {
      const totalLine = Number(entry.purchase_price) || 0;
      acc.subtotal += totalLine;
      acc.grandTotal += totalLine;
      return acc;
    },
    { subtotal: 0, grandTotal: 0 }
  );

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <Card sx={{ mb: 3 }} variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Purchase Details
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                label="Supplier"
                value={purchaseInfo.supplier}
                onChange={(e) => handlePurchaseInfoChange('supplier', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={BusinessUnits || []}
                getOptionLabel={(opt) => opt.unit_name || ''}
                value={purchaseInfo.business_unit}
                onChange={(e, newVal) => handlePurchaseInfoChange('business_unit', newVal)}
                renderOption={(props, option, { selected, inputValue }) =>
                  renderBusinessUnitOption(props, option, { selected, inputValue })
                }
                isOptionEqualToValue={(o, v) => o.business_unit_id === v.business_unit_id}
                renderInput={(params) => <TextField {...params} label="Business Unit" size="small" required />}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={locationOptions}
                getOptionLabel={(opt) => opt.location_name || ''}
                value={purchaseInfo.location}
                renderOption={(props, option, { selected, inputValue }) => renderLocationOption(props, option, { selected, inputValue })}
                onChange={(e, newVal) => handlePurchaseInfoChange('location', newVal)}
                renderInput={(params) => <TextField {...params} label="Location" size="small" required />}
                isOptionEqualToValue={(o, v) => o.location_id === v.location_id}
                disabled={!purchaseInfo.business_unit} // disable if no BU selected
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Purchase Date"
                  value={purchaseInfo.purchaseDate}
                  onChange={(nv) => handlePurchaseInfoChange('purchaseDate', nv)}
                  slotProps={{
                    textField: { size: 'small', InputLabelProps: { shrink: true } }
                  }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          Add Purchase Entries
        </Typography>
        <TextField
          label="Add Multiple Entries"
          type="number"
          size="small"
          value={bulkAddCount}
          inputProps={{ min: 1, max: 100 }}
          onChange={(e) => setBulkAddCount(e.target.value)}
          sx={{ width: 170 }}
        />
        <Button variant="outlined" onClick={handleBulkAdd}>
          Add
        </Button>
      </Box>

      {/* Entry Rows */}
      {entries.map((entry, idx) => {
        const selectedProductIds = entries
          .filter((_, i) => i !== idx)
          .map((e) => e.product?.product_id)
          .filter(Boolean);

        return (
          <Card key={idx} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <ProductSelector
                    products={products}
                    businessUnitId={purchaseInfo.business_unit?.business_unit_id}
                    locationId={purchaseInfo.location?.location_id}
                    selectedProductIds={selectedProductIds}
                    value={entry.product}
                    onChange={(newVal) => handleChange(idx, 'product', newVal)}
                    disabled={!purchaseInfo.location?.location_id || !purchaseInfo.business_unit?.business_unit_id}
                  />
                </Grid>

                <Grid item xs={6} sm={4}>
                  <TextField
                    label="Quantity"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={entry.quantity}
                    onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
                    fullWidth
                    size="small"
                    required
                    inputRef={(el) => (quantityRefs.current[idx] = el)}
                  />
                </Grid>
                <Grid item xs={6} sm={3.5}>
                  <TextField
                    label="Purchase Price"
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    value={entry.selling_price}
                    onChange={(e) => handleChange(idx, 'selling_price', e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} sm={3.5}>
                  <TextField
                    label="Selling Price"
                    type="number"
                    inputProps={{ min: 0, step: '0.01' }}
                    value={entry.purchase_price}
                    onChange={(e) => handleChange(idx, 'purchase_price', e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>

                <Grid item xs={6} sm={3.5}>
                  <TextField
                    label="Total Cost"
                    type="number"
                    inputProps={{ readOnly: true }}
                    value={entry.total_cost || ''}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Manufacture Date"
                      value={entry.manufactureDate ? new Date(entry.manufactureDate) : null}
                      onChange={(nv) => handleChange(idx, 'manufactureDate', nv ? format(nv, 'yyyy-MM-dd') : '')}
                      slotProps={{ textField: { size: 'small', InputLabelProps: { shrink: true } } }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={6} sm={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Expiry Date"
                      value={entry.expiryDate ? new Date(entry.expiryDate) : null}
                      onChange={(nv) => handleChange(idx, 'expiryDate', nv ? format(nv, 'yyyy-MM-dd') : '')}
                      slotProps={{ textField: { size: 'small', InputLabelProps: { shrink: true } } }}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12} sm="auto">
                  <IconButton color="error" onClick={() => handleRemove(idx)} disabled={entries.length === 1}>
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
        <Button variant="dashed" startIcon={<Add />} onClick={handleAdd}>
          Add Item
        </Button>
        <Button variant="contained" type="submit" disabled={loading}>
          Submit
        </Button>
      </Box>

      {/* Totals */}
      <MainCard
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          maxWidth: 400,
          marginLeft: 'auto',
          mt: 3
        }}
      >
        <Box display="flex" justifyContent="space-between">
          <Typography color="text.secondary">Subtotal</Typography>
          <Typography fontWeight={500}>ETB {totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Typography>
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

export default AddNewPurchase;
