import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Autocomplete,
  Avatar,
  Divider,
  Stack,
  IconButton,
  CircularProgress,
  Fade,
  Tooltip
} from '@mui/material';
import { Add, InfoCircle, Trash } from 'iconsax-react';
import toast from 'react-hot-toast';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import { previewBatchDeduction, useGetProducts } from 'api/products';
import { useGetUserByFilter, useGetUserInfo } from 'api/users';
import { renderProductOption } from 'components/inputs/renderProductOption';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import MainCard from 'components/MainCard';
import ProductSelector from 'sections/apps/product-center/products/ProductSelector';
import { AddNewTransfer } from 'api/transfer';
import { useTheme } from '@mui/material/styles';
import useAuth from 'hooks/useAuth';

const initialEntry = { product: null, quantity: '' };

export default function StockTransferForm() {
  const { userInfo: user } = useGetUserInfo();
  const theme = useTheme();

  const [entries, setEntries] = useState([{ ...initialEntry }]);
  const [transferInfo, setTransferInfo] = useState({
    from_business_unit: null,
    from_location: null,
    to_business_unit: null,
    to_location: null,
    sender: null,
    receiver: null,
    transfer_reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [previewResults, setPreviewResults] = useState({});

  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { products } = useGetProducts();
  const { user: localUser } = useAuth();

  // Query for receiver user (auto from selected BU/Location)
  const {
    userInfo: receiverUser,
    userInfoLoading: receiverLoading,
    userInfoError
  } = useGetUserByFilter(transferInfo.to_business_unit?.business_unit_id, transferInfo.to_location?.location_id);

  // Memoize locations for selection, excluding branches
  const locationFilter = (unit, list) =>
    unit
      ? (unit.locations || []).filter((loc) => loc.location_type !== 'branch')
      : (list || []).filter((loc) => loc.location_type !== 'branch');

  const fromLocationOptions = useMemo(
    () => locationFilter(transferInfo.from_business_unit, locations),
    [transferInfo.from_business_unit, locations]
  );
  const toLocationOptions = useMemo(
    () => locationFilter(transferInfo.to_business_unit, locations),
    [transferInfo.to_business_unit, locations]
  );
  const handlePreview = async (entry, idx) => {
    const productId = entry.product?.product_id;
    const quantity = Number(entry.quantity) || 0;
    const businessUnitId = transferInfo.from_business_unit?.business_unit_id;
    const locationId = transferInfo.from_location?.location_id;
    const companyId = entry.product?.company_id || null;

    if (!productId || !quantity || !businessUnitId || !locationId || quantity <= 0) {
      setPreviewResults((prev) => ({ ...prev, [idx]: null }));
      // Also clear price
      setEntries((prev) => prev.map((it, i) => (i === idx ? { ...it, price: '' } : it)));
      return;
    }

    try {
      const preview = await previewBatchDeduction({
        company_id: localUser?.company_id,
        product_id: productId,
        business_unit_id: businessUnitId,
        location_id: locationId,
        quantity
      });
      setPreviewResults((prev) => ({ ...prev, [idx]: preview }));
    } catch (err) {
      setPreviewResults((prev) => ({ ...prev, [idx]: null }));
      setEntries((prev) => prev.map((it, i) => (i === idx ? { ...it, price: '' } : it)));
    }
  };

  // Summary totals
  const totals = useMemo(() => {
    let totalQty = 0,
      totalProd = 0;
    entries.forEach((e) => {
      if (e.product && Number(e.quantity) > 0) {
        totalProd++;
        totalQty += Number(e.quantity);
      }
    });
    return { totalProd, totalQty };
  }, [entries]);

  // Sync sender with logged-in user
  useEffect(() => {
    if (user && user.user_id) {
      setTransferInfo((prev) => ({ ...prev, sender: user }));
    }
  }, [user]);

  // Effect to auto-populate receiver
  useEffect(() => {
    if (transferInfo.to_business_unit && transferInfo.to_location && receiverUser && !receiverLoading) {
      setTransferInfo((prev) => ({ ...prev, receiver: receiverUser }));
    } else if (!receiverLoading) {
      setTransferInfo((prev) => ({ ...prev, receiver: null }));
    }
  }, [transferInfo.to_business_unit, transferInfo.to_location, receiverUser, receiverLoading]);

  const handleTransferInfoChange = (field, value) => {
    setTransferInfo((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'from_business_unit' ? { from_location: null } : {}),
      ...(field === 'to_business_unit' ? { to_location: null } : {})
    }));
  };

  // Product and quantity handlers
  const handleChange = (idx, field, value) => {
    setEntries((prev) => prev.map((entry, i) => (i === idx ? { ...entry, [field]: value } : entry)));
    if ((field === 'product' || field === 'quantity') && value) {
      const updatedEntry = {
        ...entries[idx],
        [field]: value
      };
      handlePreview(updatedEntry, idx);
    }
  };
  const handleAdd = () => setEntries([...entries, { ...initialEntry }]);
  const handleRemove = (idx) => setEntries(entries.filter((_, i) => i !== idx));

  // Modern Submit Handler: Async, feedback, reset, auto-loading
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transferInfo.from_business_unit) return toast.error('Pick the source Business Unit');
    if (!transferInfo.from_location) return toast.error('Pick the source Location');
    if (!transferInfo.to_business_unit) return toast.error('Pick the destination Business Unit');
    if (!transferInfo.to_location) return toast.error('Pick the destination Location');
    if (!transferInfo.sender || !transferInfo.receiver) return toast.error('Both sender and receiver required');
    if (!entries.every((entry) => entry.product && Number(entry.quantity) > 0))
      return toast.error('Each row must have product and quantity > 0');
    if (transferInfo.from_location.location_id === transferInfo.to_location.location_id)
      return toast.error('Source and destination locations must be different');

    setLoading(true);
    try {
      const header = {
        business_unit_id: transferInfo.from_business_unit.business_unit_id,
        from_location_id: transferInfo.from_location.location_id,
        to_business_unit_id: transferInfo.to_business_unit.business_unit_id,
        to_location_id: transferInfo.to_location.location_id,
        transferred_by: transferInfo.sender.user_id,
        received_by: transferInfo.receiver.user_id,
        assigned_to: transferInfo.receiver.user_id,
        transfer_reason: transferInfo.transfer_reason,
        notes: transferInfo.notes
      };
      const items = entries.map((entry) => ({
        product_id: entry.product.product_id,
        quantity: Number(entry.quantity)
      }));
      const response = await AddNewTransfer({ header, items });
      if (response.success) {
        toast.success('Stock transfer created!');
        setTransferInfo({
          from_business_unit: null,
          from_location: null,
          to_business_unit: null,
          to_location: null,
          sender: user,
          receiver: null,
          transfer_reason: '',
          notes: ''
        });
        setEntries([{ ...initialEntry }]);
      } else {
        if (Array.isArray(response.errors)) response.errors.forEach((msg) => toast.error(msg));
        else toast.error(response.message || 'Error creating transfer');
      }
    } catch (err) {
      if (Array.isArray(err.errors) && err.errors.length > 0) {
        err.errors.forEach((msg) => toast.error(msg));
      } else {
        toast.error(err.message);
      }
    }
    setLoading(false);
  };
  // Total products (distinct lines with quantity > 0)
  const totalItems = entries.filter((e) => e.product && Number(e.quantity) > 0).length;

  // Total quantity (sum of all transfer quantities)
  const totalQuantity = entries.reduce((acc, e) => acc + (Number(e.quantity) || 0), 0);

  // Grand total (sum of grand_total from preview results)
  const grandTotal = entries.reduce((sum, _, idx) => sum + (previewResults[idx]?.grand_total || 0), 0);
  return (
    <Box>
      <form autoComplete="off" onSubmit={handleSubmit}>
        {/* Transfer Info Card */}
        <MainCard sx={{ mb: 2, p: 3, borderRadius: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  //   background: 'rgba(95,122,234,0.06)',
                  border: `1.5px dashed ${theme.palette.primary.main}`,
                  mb: 2
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  From
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={BusinessUnits || []}
                      getOptionLabel={(opt) => opt.unit_name || ''}
                      value={transferInfo.from_business_unit}
                      onChange={(_, v) => handleTransferInfoChange('from_business_unit', v)}
                      renderOption={renderBusinessUnitOption}
                      isOptionEqualToValue={(o, v) => o.business_unit_id === v.business_unit_id}
                      renderInput={(params) => <TextField {...params} label="Business Unit" size="small" required />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={fromLocationOptions}
                      getOptionLabel={(opt) => opt.location_name || ''}
                      value={transferInfo.from_location}
                      onChange={(_, v) => handleTransferInfoChange('from_location', v)}
                      renderOption={renderLocationOption}
                      isOptionEqualToValue={(o, v) => o.location_id === v.location_id}
                      disabled={!transferInfo.from_business_unit}
                      renderInput={(params) => <TextField {...params} label="Location" size="small" required />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                      <Avatar
                        alt={transferInfo.sender?.name}
                        src={
                          transferInfo.sender?.profile_image
                            ? `${import.meta.env.VITE_APP_API_URL}/user/profile/${transferInfo.sender.profile_image}`
                            : undefined
                        }
                        sx={{ width: 42, height: 42 }}
                      />
                      <Box>
                        <Typography fontWeight={700}>{transferInfo.sender?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sender (You)
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  //   background: 'rgba(95,122,234,0.06)',
                  border: `1.5px dashed ${theme.palette.primary.main}`,
                  mb: 2
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  To
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={BusinessUnits || []}
                      getOptionLabel={(opt) => opt.unit_name || ''}
                      value={transferInfo.to_business_unit}
                      onChange={(_, v) => handleTransferInfoChange('to_business_unit', v)}
                      renderOption={renderBusinessUnitOption}
                      isOptionEqualToValue={(o, v) => o.business_unit_id === v.business_unit_id}
                      renderInput={(params) => <TextField {...params} label="Business Unit" size="small" required />}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={toLocationOptions}
                      getOptionLabel={(opt) => opt.location_name || ''}
                      value={transferInfo.to_location}
                      onChange={(_, v) => handleTransferInfoChange('to_location', v)}
                      renderOption={renderLocationOption}
                      isOptionEqualToValue={(o, v) => o.location_id === v.location_id}
                      disabled={!transferInfo.to_business_unit}
                      renderInput={(params) => <TextField {...params} label="Location" size="small" required />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 1 }}>
                      <Fade in={!!receiverLoading} unmountOnExit>
                        <CircularProgress size={28} sx={{ mr: 2 }} />
                      </Fade>
                      {!receiverLoading && transferInfo.receiver ? (
                        <>
                          <Avatar
                            alt={transferInfo.receiver?.name}
                            src={
                              transferInfo.receiver?.profile_image
                                ? `${import.meta.env.VITE_APP_API_URL}/user/profile/${transferInfo.receiver.profile_image}`
                                : undefined
                            }
                            sx={{ width: 42, height: 42, border: '2px solid #6fcf97' }}
                          />
                          <Box>
                            <Typography fontWeight={700}>{transferInfo.receiver?.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Receiver (auto)
                            </Typography>
                          </Box>
                        </>
                      ) : (
                        !receiverLoading && (
                          <Typography variant="body2" color="text.disabled">
                            (Receiver auto from selection)
                          </Typography>
                        )
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ borderRadius: 2, mb: 2 }}>
                <TextField
                  label="Reason for Transfer"
                  fullWidth
                  value={transferInfo.transfer_reason}
                  size="small"
                  onChange={(e) => handleTransferInfoChange('transfer_reason', e.target.value)}
                  multiline
                  maxRows={8}
                  rows={5}
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ borderRadius: 2, mb: 2 }}>
                <TextField
                  label="Notes"
                  fullWidth
                  value={transferInfo.notes}
                  size="small"
                  onChange={(e) => handleTransferInfoChange('notes', e.target.value)}
                  multiline
                  maxRows={8}
                  rows={5}
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        </MainCard>

        {/* Product entries */}
        {entries.map((entry, idx) => {
          const selectedProductIds = entries
            .filter((_, i) => i !== idx)
            .map((e) => e.product?.product_id)
            .filter(Boolean);
          const preview = previewResults[idx];

          return (
            <Card
              key={idx}
              variant="outlined"
              sx={{
                mb: 2,
                borderRadius: 2,
                borderColor: preview && preview.enough_stock === false ? 'red' : '',
                borderWidth: preview && preview.enough_stock === false ? 2 : 1
              }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={6} sm={3}>
                    <ProductSelector
                      products={products}
                      businessUnitId={transferInfo.from_business_unit?.business_unit_id}
                      locationId={transferInfo.from_location?.location_id}
                      selectedProductIds={selectedProductIds}
                      value={entry.product}
                      onChange={(newVal) => handleChange(idx, 'product', newVal)}
                      disabled={!transferInfo.from_location?.location_id || !transferInfo.from_business_unit?.business_unit_id}
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="Transfer Quantity"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={entry.quantity}
                      onChange={(e) => handleChange(idx, 'quantity', e.target.value)}
                      required
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="Available"
                      value={preview ? preview.available : '-'}
                      InputProps={{
                        readOnly: true,
                        style: { fontWeight: 700 }
                      }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} sm={2}>
                    <TextField
                      label="Unit Price"
                      value={
                        preview && preview.batches && preview.batches.length === 1
                          ? preview.batches[0].unit_price
                          : preview && preview.batches && preview.batches.length > 1
                            ? 'Mixed'
                            : ''
                      }
                      InputProps={{ readOnly: true }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} sm={1.5}>
                    <TextField
                      label="Total"
                      value={preview ? preview.grand_total : '-'}
                      InputProps={{
                        readOnly: true,
                        style: { fontWeight: 700 }
                      }}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} sm="auto">
                    <IconButton color="error" onClick={() => handleRemove(idx)} disabled={entries.length === 1} aria-label="Remove Entry">
                      <Trash />
                    </IconButton>

                    {preview && (
                      <Tooltip
                        arrow
                        placement="top"
                        title={
                          <Box sx={{ p: 1.5, bgcolor: '#76CA2E' }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                              FIFO / LIFO Batch Allocation
                            </Typography>
                            {preview.batches.map((batch) => (
                              <Box key={batch.batch_id} display="flex" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                <Typography variant="body2">
                                  #{batch.batch_code} ({batch.quantity} × {batch.unit_price})
                                </Typography>
                                <Typography variant="body2" fontWeight={900}>
                                  {batch.subtotal}
                                </Typography>
                              </Box>
                            ))}
                            <Divider sx={{ my: 1 }} />
                            <Typography variant="body2" fontWeight={700} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Transfer Total:</span>
                              <span>{preview.grand_total}</span>
                            </Typography>
                            {!preview.enough_stock && (
                              <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                                ⚠ Not enough stock to fully fulfill this transfer!
                              </Typography>
                            )}
                          </Box>
                        }
                      >
                        <IconButton>
                          <InfoCircle />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          );
        })}
        {/* Add / Submit */}
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <Button variant="dashed" startIcon={<Add />} onClick={handleAdd} disabled={entries.length >= 8}>
            Add Item
          </Button>
          <Button variant="contained" type="submit" disabled={loading} sx={{ boxShadow: '0px 4px 16px #2B345016' }}>
            {loading ? <CircularProgress size={24} /> : 'Submit'}
          </Button>
        </Box>

        <MainCard
          boxShadow={false}
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            maxWidth: 480,
            marginLeft: 'auto',
            border: '1px solid #eee',
            borderRadius: 2,
            mt: 4,
            background: '#F6F8FC'
          }}
        >
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="primary.secondary">
              Total Items
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {totalItems}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="primary.secondary">
              Total Quantity
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {totalQuantity}
            </Typography>
          </Box>
          <Divider sx={{ my: 1.5 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              Grand Total
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              ETB {grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Divider sx={{ my: 1.5 }} />

          {/** Receiver info (unchanged) */}
          <Box display="flex" gap={2} alignItems="center">
            <Typography variant="h6" fontWeight={700} color="success.main">
              Receiver:
            </Typography>
            {receiverLoading ? (
              <CircularProgress size={24} />
            ) : transferInfo.receiver ? (
              <Stack direction="row" gap={2} alignItems="center">
                <Avatar
                  alt={transferInfo.receiver.name}
                  src={
                    transferInfo.receiver.profile_image
                      ? `${import.meta.env.VITE_APP_API_URL}/user/profile/${transferInfo.receiver.profile_image}`
                      : undefined
                  }
                  sx={{
                    width: 44,
                    height: 44,
                    border: '2px solid #5f7aea'
                  }}
                />
                <Typography variant="h6" fontWeight={700}>
                  {transferInfo.receiver.name}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.disabled">
                (Receiver auto from selection)
              </Typography>
            )}
          </Box>
        </MainCard>
      </form>
    </Box>
  );
}
