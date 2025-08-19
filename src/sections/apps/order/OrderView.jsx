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

export default function OrderView({ data }) {
  const subdomain = getSubdomain();
  const { companyLogo } = useGetCompanyLogo(subdomain);

  // Status color helper
  const getStatusColor = (status) => {
    if (status === 'approved') return 'success';
    if (status === 'pending') return 'warning';
    if (status === 'delivered') return 'info';
    if (status === 'cancelled') return 'error';
    return 'default';
  };

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
              <img src={`${import.meta.env.VITE_APP_API_URL}/tenant/logo/${companyLogo}`} alt="Company Logo" width={180} />
            </Box>
            <Box textAlign="right">
              <Typography variant="h4" fontWeight={700}>
                Order #{data.order_id}
              </Typography>
              <Chip
                label={data.status?.toUpperCase()}
                color={getStatusColor(data.status)}
                size="small"
                sx={{ fontWeight: 600, fontSize: '1rem' }}
              />
            </Box>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Order Date:{' '}
            {new Date(data.order_date).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
            <br />
            Customer: {data.customer_name} {data.customer_id ? `(ID: ${data.customer_id})` : ''}
          </Typography>
        </Grid>

        {/* Overview */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Typography color="text.secondary">Business Unit</Typography>
              <Typography variant="subtitle1">{data.business_unit_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography color="text.secondary">Location</Typography>
              <Typography variant="subtitle1">{data.location_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Typography color="text.secondary">Total Amount</Typography>
              <Typography variant="subtitle1">
                ${parseFloat(data.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Items Table */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 2 }} />
          <TableContainer sx={{ borderRadius: 1 }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: '#74CB2B' }}>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Product ID</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(data.items) &&
                  data.items.map((item, index) => (
                    <TableRow key={item.order_item_id || index}>
                      <TableCell>{item.product_name}</TableCell>
                      <TableCell>{item.product_id}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">
                        ${parseFloat(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        ${parseFloat(item.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Actions (download, etc.) */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              startIcon={<DocumentDownload size={20} />}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Download Order
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}
