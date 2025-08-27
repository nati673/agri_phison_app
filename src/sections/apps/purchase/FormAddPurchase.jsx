import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Card, CardContent, Grid, IconButton, TextField, Typography, Autocomplete, Divider } from '@mui/material';
import { Add, Trash } from 'iconsax-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useTool } from 'contexts/ToolContext';
import { useGetProducts } from 'api/products';
import { addPurchase, updatePurchase } from 'api/purchase';
import { renderProductOption } from 'components/inputs/renderProductOption';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import MainCard from 'components/MainCard';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import useAuth from 'hooks/useAuth';
import ProductSelector from '../product-center/products/ProductSelector';

const initialEntry = {
  product: null,
  quantity: '',
  purchase_price: '',
  total_cost: '',
  manufactureDate: '',
  expiryDate: ''
};

export default function FormPurchase({ purchase = null, closeModal, actionDone }) {
  const isEdit = Boolean(purchase?.purchase_id);
  const { products } = useGetProducts();
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { user } = useAuth();
  const quantityRefs = useRef([]);
  const { setScanHandlerActive } = useTool();

  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState([{ ...initialEntry }]);
  const [bulkAddCount, setBulkAddCount] = useState('');
  const [purchaseInfo, setPurchaseInfo] = useState({
    supplier: '',
    business_unit: null,
    location: null,
    purchaseDate: new Date()
  });

  // Prefill form in edit mode
  useEffect(() => {
    setScanHandlerActive(false);
    if (isEdit && purchase && products.length > 0 && BusinessUnits.length > 0 && locations.length > 0) {
      const bu = BusinessUnits.find((b) => b.business_unit_id === purchase.business_unit_id) || null;
      const loc = locations.find((l) => l.location_id === purchase.location_id) || null;

      setPurchaseInfo({
        supplier: purchase.supplier || '',
        business_unit: bu,
        location: loc,
        purchaseDate: purchase.added_date ? new Date(purchase.added_date) : new Date()
      });

      // Map purchase.items to form entries
      const mappedEntries = purchase.items.map((item) => ({
        product: products.find((p) => p.product_id === item.product_id) || null,
        quantity: item.quantity || '',
        purchase_price: item.purchase_price || '',
        total_cost: (item.quantity * item.purchase_price).toFixed(2),
        manufactureDate: item.batches?.[0]?.manufacture_date || '',
        expiryDate: item.batches?.[0]?.expiry_date || '',
        isExisting: true // mark as existing line
      }));
      setEntries(mappedEntries);
    }
  }, [purchase, isEdit, products, BusinessUnits, locations]);

  const locationOptions = purchaseInfo.business_unit
    ? (purchaseInfo.business_unit.locations || []).filter((loc) => loc.location_type !== 'branch')
    : (locations || []).filter((loc) => loc.location_type !== 'branch');

  const handlePurchaseInfoChange = (field, value) => {
    setPurchaseInfo((prev) => {
      if (field === 'business_unit') return { ...prev, [field]: value, location: null };
      return { ...prev, [field]: value };
    });
  };

  const handleChange = (idx, field, value) => {
    setEntries((prev) =>
      prev.map((entry, i) => {
        if (i !== idx) return entry;
        let updated = { ...entry, [field]: value };
        if (field === 'quantity' || field === 'purchase_price') {
          const qty = Number(updated.quantity) || 0;
          const price = Number(updated.purchase_price) || 0;
          updated.total_cost = (qty * price).toFixed(2);
        }
        return updated;
      })
    );
  };
  const getFilteredProducts = (currentIdx) => {
    if (!purchaseInfo.location || !purchaseInfo.business_unit) return [];

    const addedProductIds = entries
      .filter((_, i) => i !== currentIdx)
      .map((e) => e.product?.product_id)
      .filter(Boolean);

    return (products || [])
      .filter((p) => {
        const matchesBU = p.business_unit_id === purchaseInfo.business_unit.business_unit_id;
        const matchesLocation =
          p.location_id === purchaseInfo.location.location_id ||
          (p.locations || []).some((loc) => loc.location_id === purchaseInfo.location.location_id);

        return matchesBU && matchesLocation;
      })
      .filter((p) => !addedProductIds.includes(p.product_id)); // exclude already-added ones
  };

  const handleAdd = () => setEntries([...entries, { ...initialEntry }]);
  const handleRemove = (idx) => setEntries(entries.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const header = {
      supplier: purchaseInfo.supplier,
      company_id: user?.company_id,
      business_unit_id: purchaseInfo.business_unit?.business_unit_id || null,
      location_id: purchaseInfo.location?.location_id || null,
      purchase_date: purchaseInfo.purchaseDate ? format(purchaseInfo.purchaseDate, 'yyyy-MM-dd') : null
    };

    // Only keep new items when editing, otherwise keep all
    const items = entries
      .filter((entry) => !(isEdit && entry.isExisting)) // remove old items in edit mode
      .map((entry) => ({
        product_id: entry.product?.product_id || null,
        quantity: Number(entry.quantity) || 0,
        purchase_price: Number(entry.purchase_price) || 0,
        manufacture_date: entry.manufactureDate || null,
        expiry_date: entry.expiryDate || null
      }));

    const invalidItem = items.find((it) => !it.product_id || it.quantity <= 0 || it.purchase_price <= 0);
    if (!header.business_unit_id || !header.location_id || invalidItem) {
      toast.error('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);

      const res = await updatePurchase(purchase.purchase_id, { header, items });

      if (res.success) {
        toast.success(res.message);
        if (actionDone) actionDone();
        if (closeModal) closeModal();
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message || 'Error submitting purchase');
    } finally {
      setLoading(false);
    }
  };

  const totals = entries.reduce(
    (acc, entry) => {
      acc.subtotal += Number(entry.total_cost) || 0;
      acc.grandTotal += Number(entry.total_cost) || 0;
      return acc;
    },
    { subtotal: 0, grandTotal: 0 }
  );

  console.log(products);

  return (
    <form onSubmit={handleSubmit}>
      {/* Header Fields */}
      <Card sx={{ mb: 3 }} variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {isEdit ? 'Edit Purchase' : 'New Purchase'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField
                label="Supplier"
                value={purchaseInfo.supplier}
                onChange={(e) => handlePurchaseInfoChange('supplier', e.target.value)}
                fullWidth
                size="small"
                // required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={BusinessUnits || []}
                getOptionLabel={(opt) => opt.unit_name || ''}
                value={purchaseInfo.business_unit}
                onChange={(e, newVal) => handlePurchaseInfoChange('business_unit', newVal)}
                renderOption={renderBusinessUnitOption}
                isOptionEqualToValue={(o, v) => o.business_unit_id === v.business_unit_id}
                renderInput={(params) => <TextField {...params} label="Business Unit" size="small" required />}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={locationOptions}
                getOptionLabel={(opt) => opt.location_name || ''}
                value={purchaseInfo.location}
                onChange={(e, newVal) => handlePurchaseInfoChange('location', newVal)}
                renderOption={renderLocationOption}
                isOptionEqualToValue={(o, v) => o.location_id === v.location_id}
                renderInput={(params) => <TextField {...params} label="Location" size="small" required />}
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Purchase Date"
                  value={purchaseInfo.purchaseDate}
                  onChange={(nv) => handlePurchaseInfoChange('purchaseDate', nv)}
                  slotProps={{ textField: { size: 'small', InputLabelProps: { shrink: true } } }}
                  disabled
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {entries.map((entry, idx) => {
        const disableEdit = isEdit && entry.isExisting;
        // Get filtered products for dropdown
        const selectedProductIds = entries
          .filter((_, i) => i !== idx)
          .map((e) => e.product?.product_id)
          .filter(Boolean);
        return (
          <Card key={idx} variant="outlined" sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={2}>
                  {/* <Autocomplete
                    options={filteredProducts}
                    getOptionLabel={(opt) => opt.product_name || ''}
                    value={entry.product}
                    onChange={(e, newVal) => handleChange(idx, 'product', newVal)}
                    renderOption={renderProductOption}
                    renderInput={(params) => <TextField {...params} label="Product" size="small" required />}
                    isOptionEqualToValue={(o, v) => o.product_id === v.product_id}
                    disabled={disableEdit}
                  /> */}
                  <ProductSelector
                    products={products}
                    businessUnitId={purchaseInfo.business_unit?.business_unit_id}
                    locationId={purchaseInfo.location?.location_id}
                    selectedProductIds={selectedProductIds}
                    value={entry.product}
                    onChange={(newVal) => handleChange(idx, 'product', newVal)}
                    disabled={disableEdit}
                  />
                </Grid>
                <Grid item xs={6} sm={1.5}>
                  <TextField
                    label="Qty"
                    type="number"
                    value={entry.quantity}
                    onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
                    size="small"
                    required
                    disabled={disableEdit} // disable qty edit
                  />
                </Grid>
                <Grid item xs={6} sm={1.8}>
                  <TextField
                    label="Price"
                    type="number"
                    value={entry.purchase_price}
                    onChange={(e) => handleChange(idx, 'purchase_price', e.target.value)}
                    size="small"
                    disabled={disableEdit} // disable price edit
                  />
                </Grid>
                <Grid item xs={6} sm={1.5}>
                  <TextField label="Total" value={entry.total_cost} size="small" disabled />
                </Grid>
                <Grid item xs={6} sm={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="MFG"
                      value={entry.manufactureDate ? new Date(entry.manufactureDate) : null}
                      onChange={(nv) => handleChange(idx, 'manufactureDate', nv ? format(nv, 'yyyy-MM-dd') : '')}
                      slotProps={{ textField: { size: 'small' } }}
                      disabled={disableEdit} // disable MFG date edit
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={6} sm={2}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="EXP"
                      value={entry.expiryDate ? new Date(entry.expiryDate) : null}
                      onChange={(nv) => handleChange(idx, 'expiryDate', nv ? format(nv, 'yyyy-MM-dd') : '')}
                      slotProps={{ textField: { size: 'small' } }}
                      disabled={disableEdit} // disable expiry date edit
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm="auto">
                  {/* Allow remove only for new items */}
                  <IconButton
                    color="error"
                    onClick={() => handleRemove(idx)}
                    disabled={entries.length === 1 || (isEdit && entry.isExisting)}
                  >
                    <Trash />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );
      })}

      {/* Footer */}
      <Box display="flex" gap={2} mt={2}>
        <Button variant="dashed" startIcon={<Add />} onClick={handleAdd}>
          Add Item
        </Button>
        <Button variant="contained" type="submit" disabled={loading}>
          {isEdit ? 'Update Purchase' : 'Submit'}
        </Button>
        <Button variant="outlined" color="error" onClick={closeModal}>
          Cancel Update
        </Button>
      </Box>

      {/* Totals */}
      <MainCard sx={{ p: 2, maxWidth: 400, mt: 3, ml: 'auto' }}>
        <Box display="flex" justifyContent="space-between">
          <Typography>Subtotal</Typography>
          <Typography>ETB {totals.subtotal.toFixed(2)}</Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h6">Grand Total</Typography>
          <Typography variant="h6" color="primary.main">
            ETB {totals.grandTotal.toFixed(2)}
          </Typography>
        </Box>
      </MainCard>
    </form>
  );
}
