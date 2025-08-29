import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, Chip, Avatar, Stack, Button, Tooltip } from '@mui/material';
import { Clock, CloseCircle, TickCircle, User } from 'iconsax-react';
import StockTransferStatusModal from '../StockTransferStatusModal';
// import { Clock } from '@mui/x-date-pickers/TimeClock/Clock';

// Status metadata
const STATUS_META = {
  pending: {
    color: 'warning',
    borderColor: '#F5A623',
    label: 'Pending',
    icon: <Clock size={18} color="#fff" variant="Bold" />
  },
  received: {
    color: 'success',
    borderColor: '#43A047',
    label: 'Received',
    icon: <TickCircle size={18} color="#fff" variant="Bold" />
  },
  rejected: {
    color: 'error',
    borderColor: '#D32F2F',
    label: 'Rejected',
    icon: <CloseCircle size={18} color="#fff" variant="Bold" />
  }
};
// Get user profile API URL
const getProfileUrl = (profile) => (profile ? `${import.meta.env.VITE_APP_API_URL}/user/profile/${profile}` : undefined);

export default function StockTransferOverview({ data, grandTotal, onStatusChange, onActionDone, onFetch }) {
  const [localDetail, setLocalDetail] = useState(data);
  const [status, setStatus] = useState(localDetail.transfer_status || 'pending');

  useEffect(() => {
    setLocalDetail(data);
  }, [data]);
  // Manage modal open state
  const [openModal, setOpenModal] = useState(false);

  // Currency formatter
  const birrFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-ET', {
        style: 'currency',
        currency: 'ETB',
        minimumFractionDigits: 2
      }),
    []
  );

  const show = (val, fallback = '-- Not Set --') => (val ? val : <span style={{ opacity: 0.5, fontStyle: 'italic' }}>{fallback}</span>);

  const totalItems = localDetail.items?.length || 0;
  const totalQuantity = localDetail.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;
  const meta = STATUS_META[status] || STATUS_META.pending;

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: `2px dashed ${meta.borderColor}`
        }}
      >
        <CardContent sx={{ px: { xs: 2, sm: 4 }, py: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={6} alignItems="flex-start" justifyContent="space-between">
            {/* LEFT PANE */}
            <Box flex={1} minWidth={260}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Business Unit
              </Typography>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                {show(localDetail.unit_name)}
              </Typography>

              {/* Status + date */}
              <Stack direction="row" alignItems="center" spacing={1} mt={1} mb={2}>
                <Chip
                  icon={meta.icon}
                  label={meta.label}
                  color={meta.color}
                  size="medium"
                  sx={{ fontWeight: 700, px: 2, fontSize: 15, color: '#fff' }}
                />
                <Button variant="outlined" size="small" onClick={() => setOpenModal(true)} sx={{ ml: 1, fontWeight: 600, borderRadius: 2 }}>
                  Change Status
                </Button>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {localDetail.transfer_date
                    ? new Date(localDetail.transfer_date).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : show(null, 'Date not set')}
                </Typography>
              </Stack>

              {/* Info grid */}
              <Grid container spacing={2} pt={2}>
                <Grid item xs={6}>
                  <Typography fontSize={13} color="text.secondary">
                    From
                  </Typography>
                  <Typography fontWeight={600}>{show(localDetail.from_location_name)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize={13} color="text.secondary">
                    To
                  </Typography>
                  <Typography fontWeight={600}>{show(localDetail.to_location_name)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Reason
                  </Typography>
                  <Typography>{show(localDetail.transfer_reason)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Notes
                  </Typography>
                  <Typography>{show(localDetail.notes)}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Totals */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', mb: 2 }}>
                <Box>
                  <Typography variant="subtitle2" color="primary">
                    Total Items
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {totalItems}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="primary">
                    Total Quantity
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {totalQuantity}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="primary">
                    Grand Total
                  </Typography>
                  <Typography variant="h6" color="secondary" fontWeight={800} fontFamily="monospace" sx={{ letterSpacing: 2 }}>
                    {birrFormatter.format(Number(grandTotal) || 0)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* RIGHT PANE: USERS */}
            <Stack spacing={3} flex={1} minWidth={220}>
              <ProfileRow
                label="Transferred By"
                name={localDetail.transferred_by_name}
                profileUrl={getProfileUrl(localDetail.transferred_by_profile)}
              />
              <ProfileRow
                label="Assigned To"
                name={localDetail.assigned_to_name}
                profileUrl={getProfileUrl(localDetail.assigned_to_profile)}
              />
              <ProfileRow
                label="Received By"
                name={localDetail.received_by_name || 'Not Received'}
                profileUrl={getProfileUrl(localDetail.received_by_profile)}
                muted={!localDetail.received_by_name}
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ❇️ Attach the status modal */}
      <StockTransferStatusModal
        open={openModal}
        handleClose={() => setOpenModal(false)}
        transfer={data}
        onActionDone={onFetch}
      />
    </>
  );
}

// Profile row sub-component
function ProfileRow({ label, name, profileUrl, muted }) {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar src={profileUrl} sx={{ width: 56, height: 56, bgcolor: muted ? '#eee' : undefined }}>
        {!profileUrl && <User color="disabled" sx={{ fontSize: 38 }} />}
      </Avatar>
      <Box>
        <Typography fontSize={13} color="text.secondary">
          {label}
        </Typography>
        <Typography fontWeight={600} color={muted ? 'gray' : 'inherit'}>
          {name}
        </Typography>
      </Box>
    </Stack>
  );
}
