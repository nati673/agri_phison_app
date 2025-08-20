import {
  Box,
  Chip,
  Grid,
  Stack,
  Typography,
  Divider,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import { DocumentDownload } from 'iconsax-react';
import React from 'react';
import MainCard from 'components/MainCard';
import { useGetCompanyLogo } from 'api/company';
import { getSubdomain } from 'utils/redirectToSubdomain';

// ==============================|| STOCK TRANSFER VIEW ||============================== //

export default function StockTransferView({ data }) {
  const subdomain = getSubdomain();
  const { companyLogo } = useGetCompanyLogo(subdomain);

  return (
    <MainCard
      sx={{
        p: { xs: 2, sm: 4 },
        maxWidth: 900,
        mx: 'auto',
        mt: 3
      }}
    >
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            {/* Company Logo */}
            <Box>
              <img
                src={`${import.meta.env.VITE_APP_API_URL}/tenant/logo/${companyLogo}`}
                alt="Company Logo"
                width={224}
              />
            </Box>
            <Box textAlign="right">
              <Typography variant="h4" fontWeight={700}>
                Transfer #{data.transfer_id}
              </Typography>
              <Chip
                label={data.transfer_status?.toUpperCase()}
                color={
                  data.transfer_status === 'received'
                    ? 'success'
                    : data.transfer_status === 'pending'
                    ? 'warning'
                    : 'error'
                }
                size="small"
                sx={{ fontWeight: 600, fontSize: '1rem' }}
              />
            </Box>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Transfer Date:{' '}
            {new Date(data.transfer_date).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
            <br />
            Transferred by: {data.transferred_by_name || '-'}{' '}
            {data.received_by_name && (
              <>
                <br />
                Received by: {data.received_by_name} on{' '}
                {data.received_at
                  ? new Date(data.received_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                  : '-'}
              </>
            )}
          </Typography>
        </Grid>

        {/* Overview */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">Business Unit</Typography>
              <Typography variant="subtitle1">{data.unit_name || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">From Location</Typography>
              <Typography variant="subtitle1">{data.from_location_name || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">To Location</Typography>
              <Typography variant="subtitle1">{data.to_location_name || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">Status</Typography>
              <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                {data.transfer_status}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Reason / Notes */}
        {data.transfer_reason && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Reason: {data.transfer_reason}
            </Typography>
          </Grid>
        )}
        {data.notes && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Notes: {data.notes}
            </Typography>
          </Grid>
        )}

        {/* Transfer Items Table */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 2 }} />
          <TableContainer sx={{ borderRadius: 1 }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: '#74CB2B' }}>
                <TableRow>
                  <TableCell>Product ID</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell align="right">Category ID</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items?.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Typography variant="caption">{item.product_id}</Typography>
                    </TableCell>
                    <TableCell>{item.product_name || '-'}</TableCell>
                    <TableCell align="right">{item.quantity ?? '-'}</TableCell>
                    <TableCell>{item.unit || '-'}</TableCell>
                    <TableCell align="right">{item.product_category ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Download Action */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              startIcon={<DocumentDownload size={20} />}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Download Transfer
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}
