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
import { useGetProducts, previewBatchDeduction } from 'api/products';
import { useGetUserByFilter, useGetUserInfo } from 'api/users';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import { renderBusinessUnitOption } from 'components/inputs/renderBusinessUnitOption';
import MainCard from 'components/MainCard';
import ProductSelector from 'sections/apps/product-center/products/ProductSelector';
import { UpdateTransfer } from 'api/transfer';
import { useTheme } from '@mui/material/styles';

const initialEntry = { product: null, quantity: '' };

export default function StockTransferEditForm({ transfer, closeModal, actionDone }) {
  const { userInfo: user } = useGetUserInfo();
  const theme = useTheme();
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { products } = useGetProducts();

  // Preload entries with items in transfer
  const [entries, setEntries] = useState(() => {
    if (transfer?.items?.length) {
      return transfer.items.map((item) => ({
        item_id: item.item_id,
        product: item,
        quantity: item.quantity ? String(item.quantity) : '',
        isExisting: true
      }));
    }
    return [{ ...initialEntry }];
  });

  // Track if a row is new (for preview API) or is from the transfer (for static values)
  const [previewResults, setPreviewResults] = useState({});

  // Header info - only allow editing for to_location, reason, notes
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

  const { userInfo: receiverUser, userInfoLoading: receiverLoading } = useGetUserByFilter(
    transferInfo.to_business_unit?.business_unit_id,
    transferInfo.to_location?.location_id
  );

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

  // Totals include both existing (from transfer.items) and new lines
  const totalItems = entries.filter((e) => e.product && Number(e.quantity) > 0).length;
  const totalQuantity = entries.reduce((acc, e) => acc + (Number(e.quantity) || 0), 0);
  const grandTotal = entries.reduce((sum, entry, idx) => {
    if (entry.isExisting) {
      return sum + (entry.product.selling_price || 0) * (Number(entry.quantity) || 0);
    }
    return sum + (previewResults[idx]?.grand_total || 0);
  }, 0);

  // Sync sender (read-only)
  useEffect(() => {
    if (user && user.user_id) {
      setTransferInfo((prev) => ({ ...prev, sender: user }));
    }
  }, [user]);

  // Receiver auto-selection as before
  useEffect(() => {
    if (transferInfo.to_business_unit && transferInfo.to_location && receiverUser && !receiverLoading) {
      setTransferInfo((prev) => ({ ...prev, receiver: receiverUser }));
    } else if (!receiverLoading) {
      setTransferInfo((prev) => ({ ...prev, receiver: null }));
    }
  }, [transferInfo.to_business_unit, transferInfo.to_location, receiverUser, receiverLoading]);

  // On transfer data arrival, set header info
  useEffect(() => {
    if (transfer && BusinessUnits && locations) {
      setTransferInfo((prev) => ({
        ...prev,
        from_business_unit: BusinessUnits.find((bu) => bu.business_unit_id === transfer.business_unit_id) || null,
        from_location: locations.find((loc) => loc.location_id === transfer.from_location_id) || null,
        to_business_unit:
          BusinessUnits.find((bu) => bu.business_unit_id === (transfer.to_business_unit_id ?? transfer.business_unit_id)) || null,
        to_location: locations.find((loc) => loc.location_id === transfer.to_location_id) || null,
        sender: user || null,
        transfer_reason: transfer.transfer_reason || '',
        notes: transfer.notes || ''
      }));
    }
  }, [transfer, BusinessUnits, locations, user]);

  // API preview for new lines only
  const handlePreview = async (entry, idx) => {
    if (entries[idx]?.isExisting) return; // skip preview for existing items
    const productId = entry.product?.product_id;
    const quantity = Number(entry.quantity) || 0;
    const businessUnitId = transferInfo.from_business_unit?.business_unit_id;
    const locationId = transferInfo.from_location?.location_id;
    const companyId = user?.company_id || null;

    if (!productId || !quantity || !businessUnitId || !locationId || quantity <= 0) {
      setPreviewResults((prev) => ({ ...prev, [idx]: null }));
      return;
    }
    try {
      const preview = await previewBatchDeduction({
        company_id: companyId,
        product_id: productId,
        business_unit_id: businessUnitId,
        location_id: locationId,
        quantity
      });
      setPreviewResults((prev) => ({ ...prev, [idx]: preview }));
    } catch (err) {
      setPreviewResults((prev) => ({ ...prev, [idx]: null }));
    }
  };

  const handleChange = (idx, field, value) => {
    setEntries((prev) => prev.map((entry, i) => (i === idx ? { ...entry, [field]: value } : entry)));
    // Preview only for newly added (non-existing) rows
    if (!entries[idx]?.isExisting && (field === 'product' || field === 'quantity') && value) {
      const updatedEntry = {
        ...entries[idx],
        [field]: value
      };
      handlePreview(updatedEntry, idx);
    }
  };

  // Adding/removing lines
  const handleAdd = () => setEntries([...entries, { ...initialEntry, isExisting: false }]);
  const handleRemove = (idx) => setEntries(entries.filter((_, i) => i !== idx));

  // Save/update handler - only passes changed fields
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
      // Payload for update
      const header = {
        transfer_id: Number(transfer.transfer_id),
        business_unit_id: transferInfo.from_business_unit.business_unit_id,
        from_location_id: transferInfo.from_location.location_id,
        to_business_unit_id: transferInfo.to_business_unit.business_unit_id,
        to_location_id: transferInfo.to_location.location_id,
        transferred_by: transferInfo.sender.user_id,
        received_by: transferInfo.receiver.user_id,
        assigned_to: transferInfo.receiver.user_id,
        transfer_reason: transferInfo.transfer_reason,
        notes: transferInfo.notes,
        company_id: user?.company_id
      };
      const items = entries.map((entry) => ({
        product_id: entry.product.product_id,
        quantity: Number(entry.quantity),
        item_id: entry.item_id
        // Optionally batch_id, price, etc if your backend requires them
      }));
      const response = await UpdateTransfer(transfer.transfer_id, { header, items });
      if (response.success) {
        toast.success('Stock transfer updated!');
        actionDone((prev) => !prev);
        if (closeModal) closeModal();
      } else {
        if (Array.isArray(response.errors)) response.errors.forEach((msg) => toast.error(msg));
        else toast.error(response.message || 'Error updating transfer');
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
  const handleTransferInfoChange = (field, value) => {
    setTransferInfo((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'from_business_unit' ? { from_location: null } : {}),
      ...(field === 'to_business_unit' ? { to_location: null } : {})
    }));
  };

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
                      renderOption={renderBusinessUnitOption}
                      isOptionEqualToValue={(o, v) => o.business_unit_id === v.business_unit_id}
                      renderInput={(params) => <TextField {...params} label="Business Unit" size="small" required />}
                      readOnly
                      disabled
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Autocomplete
                      options={fromLocationOptions}
                      getOptionLabel={(opt) => opt.location_name || ''}
                      value={transferInfo.from_location}
                      renderOption={renderLocationOption}
                      isOptionEqualToValue={(o, v) => o.location_id === v.location_id}
                      renderInput={(params) => <TextField {...params} label="Location" size="small" required />}
                      readOnly
                      disabled
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
                      renderInput={(params) => <TextField {...params} label="Location" size="small" required />}
                      disabled={!transferInfo.to_business_unit}
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

        {/* Product Entries */}
        {entries.map((entry, idx) => {
          const selectedProductIds = entries
            .filter((_, i) => i !== idx)
            .map((e) => e.product?.product_id)
            .filter(Boolean);
          const preview = previewResults[idx];
          // If it is an existing transfer item, show static data
          if (entry.isExisting) {
            return (
              <Card key={idx} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <ProductSelector
                        products={products}
                        businessUnitId={transferInfo.from_business_unit?.business_unit_id}
                        locationId={transferInfo.from_location?.location_id}
                        selectedProductIds={selectedProductIds}
                        value={entry.product}
                        onChange={(newVal) => handleChange(idx, 'product', newVal)}
                        disabled // prevent changing product for existing entry
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
                        value={entry.isExisting ? entry.product.available_quantity : entry.product.quantity || '-'}
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
                        value={entry.product.selling_price || ''}
                        InputProps={{ readOnly: true }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={1.5}>
                      <TextField
                        label="Total"
                        value={(entry.product.selling_price || 0) * (Number(entry.quantity) || 0)}
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
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          }
          // For new row, show preview data
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
                  <Grid item xs={12} sm={3}>
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
            {loading ? <CircularProgress size={24} /> : 'Update'}
          </Button>
        </Box>

        {/* Modern summary card */}
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
          {/* Receiver info */}
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
