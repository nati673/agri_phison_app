import React, { useMemo, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider, Chip, Avatar, Stack, Button, Tooltip } from '@mui/material';
import { CloseCircle, TickCircle, User } from 'iconsax-react';
import StockTransferStatusModal from '../StockTransferStatusModal';

// Status metadata
const STATUS_METADATA = {
  pending: {
    color: 'warning',
    label: 'Pending',
    icon: <TickCircle sx={{ fontSize: 18 }} />
  },
  completed: {
    color: 'success',
    label: 'Completed',
    icon: <TickCircle sx={{ fontSize: 18 }} />
  },
  cancelled: {
    color: 'error',
    label: 'Cancelled',
    icon: <CloseCircle sx={{ fontSize: 18 }} />
  }
};

// Get user profile API URL
const getProfileUrl = (profile) => (profile ? `${import.meta.env.VITE_APP_API_URL}/user/profile/${profile}` : undefined);

export default function StockTransferOverview({ data, grandTotal, onStatusChange }) {
  const [status, setStatus] = useState(data.transfer_status || 'pending');

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

  const totalItems = data.items?.length || 0;
  const totalQuantity = data.items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  return (
    <>
      <Card
        elevation={0}
        sx={{
          borderRadius: '20px',
          border: '1px dashed #32CD32'
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
                {show(data.unit_name)}
              </Typography>

              {/* Status + date */}
              <Stack direction="row" alignItems="center" spacing={1} mt={1} mb={2}>
                <Chip
                  icon={STATUS_METADATA[status]?.icon}
                  label={STATUS_METADATA[status]?.label || status}
                  color={STATUS_METADATA[status]?.color || 'default'}
                  size="medium"
                  sx={{ fontWeight: 700, px: 2, fontSize: 15 }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setOpenModal(true)} // 👈 open modal here
                  sx={{ ml: 1, fontWeight: 600, borderRadius: 2 }}
                >
                  Change Status
                </Button>
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {data.transfer_date
                    ? new Date(data.transfer_date).toLocaleString('en-GB', {
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
                  <Typography fontWeight={600}>{show(data.from_location_name)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize={13} color="text.secondary">
                    To
                  </Typography>
                  <Typography fontWeight={600}>{show(data.to_location_name)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Reason
                  </Typography>
                  <Typography>{show(data.transfer_reason)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography fontSize={13} color="text.secondary">
                    Notes
                  </Typography>
                  <Typography>{show(data.notes)}</Typography>
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
              <ProfileRow label="Transferred By" name={data.transferred_by_name} profileUrl={getProfileUrl(data.transferred_by_profile)} />
              <ProfileRow label="Assigned To" name={data.assigned_to_name} profileUrl={getProfileUrl(data.assigned_to_profile)} />
              <ProfileRow
                label="Received By"
                name={data.received_by_name || 'Not Received'}
                profileUrl={getProfileUrl(data.received_by_profile)}
                muted={!data.received_by_name}
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
        actionDone={() => {
          if (typeof onStatusChange === 'function') onStatusChange();
        }}
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
