import React from 'react';
import { Box, Stack, Typography, Chip, Divider, Tooltip, LinearProgress, Avatar, Grid } from '@mui/material';
import { User, DocumentText, MoneySend, Calendar, Key, Shield, Clock, Copy, CloseCircle, Verify, Devices } from 'iconsax-react';
import { formatDistanceToNow } from 'date-fns';

const iconProps = { size: 24, variant: 'Bold', color: '#37d67a' };

const DetailRow = ({ icon, label, value, tooltip }) => (
  <Grid container alignItems="center" spacing={2} sx={{ mb: 2 }}>
    <Grid item>
      <Avatar sx={{ bgcolor: '#F0F2F4' }}>{icon}</Avatar>
    </Grid>
    <Grid item xs>
      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      <Tooltip title={tooltip || value} placement="top" arrow>
        <Typography variant="body1" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
          {value}
        </Typography>
      </Tooltip>
    </Grid>
  </Grid>
);

const InvoiceDetailModern = ({ invoice }) => (
  <Box
    sx={{
      p: 3,
      borderRadius: 3,
      boxShadow: '0 1px 6px rgba(28,43,70,0.08)',
      bgcolor: '#fff'
    }}
  >
    <Stack spacing={3}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
        <DocumentText {...iconProps} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Invoice #{invoice.invoice_number}
        </Typography>
        <Chip
          icon={invoice.share_status === 'active' ? <Verify size={16} color="#17C964" /> : <CloseCircle size={16} color="#FF6F61" />}
          label={invoice.share_status === 'active' ? 'Active' : 'Inactive'}
          color={invoice.share_status === 'active' ? 'success' : 'error'}
          size="small"
          sx={{ ml: 2 }}
        />
      </Stack>

      <Divider />

      {/* Customer Info */}
      {/* <DetailRow icon={<User {...iconProps} />} label="Customer" value={invoice.customer_name} /> */}

      {/* Amount */}
      {/* <DetailRow icon={<MoneySend {...iconProps} />} label="Amount" value={`$${invoice.amount?.toLocaleString()}`} /> */}

      {/* Dates */}
      
      {/* Share/Access Section */}
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Sharing Info
        </Typography>
        <DetailRow
          icon={<Key {...iconProps} />}
          label="Share Token"
          value={invoice.share_token || '—'}
          tooltip="Unique token for external access"
        />
        <DetailRow icon={<Shield {...iconProps} />} label="Access Type" value={invoice.access_type || '—'} />
        <DetailRow
          icon={<Copy {...iconProps} />}
          label="Encrypted URL"
          value={invoice.encrypted_url || '—'}
          tooltip="Direct link for secure access"
        />
        <DetailRow
          icon={<Clock {...iconProps} />}
          label="Expires At"
          value={invoice.expires_at ? new Date(invoice.expires_at)?.toLocaleString() : 'Never'}
        />
      </Stack>
<DetailRow icon={<Calendar {...iconProps} />} label="Created At" value={new Date(invoice.created_at)?.toLocaleString()} />
      <DetailRow icon={<Calendar {...iconProps} />} label="Updated At" value={new Date(invoice.updated_at)?.toLocaleString()} />

      {/* Access Logs */}
      <Divider sx={{ mt: 2 }} />
      <Stack spacing={2.5} sx={{ mt: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Shield size={24} color="#00B8D9" variant="Bulk" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Access Logs
          </Typography>
        </Stack>
        {Array.isArray(invoice.accesses) && invoice.accesses.length > 0 ? (
          invoice.accesses.slice(0, 3).map((log) => (
            <Grid
              container
              key={log.access_id}
              alignItems="center"
              spacing={2}
              sx={{
                bgcolor: 'background.default',
                borderRadius: 3,
                px: 2,
                py: 2.5,
                boxShadow: (theme) => `0 2px 8px ${theme.palette.mode === 'dark' ? 'rgba(50,115,200,0.06)' : 'rgba(71, 124, 255, 0.04)'}`
              }}
            >
              <Grid item>
                {log.accessed_user_profile ? (
                  <Avatar
                    alt={log.accessed_user_name}
                    src={
                      log?.accessed_user_profile
                        ? `${import.meta.env.VITE_APP_API_URL}/user/profile/${log?.accessed_user_profile}`
                        : undefined
                    }
                    sx={{ width: 46, height: 46, border: '2px solid #f5f6fa' }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      bgcolor: '#E0ECFB',
                      width: 46,
                      height: 46,
                      color: '#1976D2',
                      fontSize: 20,
                      fontWeight: 'bold'
                    }}
                  >
                    {log.accessed_user_name ? getInitial(log.accessed_user_name) : <User size={23} color="#90A4AE" variant="Bulk" />}
                  </Avatar>
                )}
              </Grid>
              <Grid item xs zeroMinWidth>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
                    {log.accessed_user_name || 'Unknown User'}
                  </Typography>
                  <Chip
                    label={log.permitted ? 'Permitted' : 'Denied'}
                    color={log.permitted ? 'success' : 'error'}
                    size="small"
                    sx={{
                      fontSize: 12,
                      px: 1.2,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: 0.2
                    }}
                  />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                  <Tooltip title={log.access_ip || '-'} arrow>
                    <Shield size={18} color="#00B8D9" variant="Outline" />
                  </Tooltip>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    {log.access_ip || '-'}
                  </Typography>
                  <Tooltip title={log.access_time ? new Date(log.access_time).toLocaleString() : ''} arrow>
                    <Typography variant="body2" color="text.secondary">
                      {log.access_time ? formatDistanceToNow(new Date(log.access_time), { addSuffix: true }) : '-'}
                    </Typography>
                  </Tooltip>
                </Stack>
                {log.user_agent && (
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                    <Devices size={17} color="#90A4AE" variant="Bulk" />
                    <Typography variant="caption" color="text.disabled" sx={{ wordBreak: 'break-all' }}>
                      {log.user_agent}
                    </Typography>
                  </Stack>
                )}
              </Grid>
            </Grid>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No access logs found.
          </Typography>
        )}
      </Stack>
    </Stack>
  </Box>
);

export default InvoiceDetailModern;
