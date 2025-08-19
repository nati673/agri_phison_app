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

export default function SalesView({ data }) {
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
              <img src={`${import.meta.env.VITE_APP_API_URL}/tenant/logo/${companyLogo}`} alt="Company Logo" width={224} />
            </Box>
            <Box textAlign="right">
              <Typography variant="h4" fontWeight={700}>
                Sale #{data.sale_id}
              </Typography>
              <Chip
                label={data.status?.toUpperCase()}
                color={
                  data.status === 'paid'
                    ? 'success'
                    : data.status === 'partially paid'
                      ? 'warning'
                      : data.status === 'refunded'
                        ? 'info'
                        : 'error'
                }
                size="small"
                sx={{ fontWeight: 600, fontSize: '1rem' }}
              />
            </Box>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sale Date:{' '}
            {new Date(data.sale_date).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
            <br />
            Customer: {data.customer_name}
          </Typography>
        </Grid>

        {/* Overview */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">Business Unit</Typography>
              <Typography variant="subtitle1">{data.business_unit_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">Location</Typography>
              <Typography variant="subtitle1">{data.location_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">Total Amount</Typography>
              <Typography variant="subtitle1">
                {data.total_amount ? `ETB ${Number(data.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '-'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">Status</Typography>
              <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                {data.status}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Sale Items Table */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 2 }} />
          <TableContainer sx={{ borderRadius: 1 }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: '#74CB2B' }}>
                <TableRow>
                  <TableCell>Product ID</TableCell>
                  <TableCell>Product Name</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Discount %</TableCell>
                  <TableCell align="right">Discount Amount</TableCell>
                  <TableCell align="right">Total Price</TableCell>
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
                    <TableCell align="right">
                      {item.unit_price != null
                        ? `ETB ${Number(item.unit_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                        : '-'}
                    </TableCell>
                    <TableCell align="right">{item.discount_percent ?? '-'}</TableCell>
                    <TableCell align="right">
                      {item.discount_amount != null
                        ? `ETB ${Number(item.discount_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      {item.total_price != null
                        ? `ETB ${Number(item.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Notes */}
        {data.notes && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Notes: {data.notes}
            </Typography>
          </Grid>
        )}

        {/* Actions */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              startIcon={<DocumentDownload size={20} />}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Download Sale
            </Button>
          </Stack>
        </Grid>

        {data.sales_credit && (
          <Grid item xs={12}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { sm: 'center' },
                justifyContent: 'space-between',
                // bgcolor: data.sales_credit.status === 'unpaid' ? 'error.light' : 'success.light',
                color: data.sales_credit.status === 'unpaid' ? 'error.dark' : 'success.dark',
                p: 3,
                borderRadius: 1,
                boxShadow: 6,
                mt: 2
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  label={data.sales_credit.status === 'unpaid' ? 'Credit: Unpaid' : 'Credit: Paid'}
                  color={data.sales_credit.status === 'unpaid' ? 'error' : 'success'}
                  sx={{ fontWeight: 700, fontSize: '1rem', px: 2 }}
                />
              </Stack>
              <Stack direction="row" spacing={4} alignItems="center" sx={{ mt: { xs: 2, sm: 0 } }}>
                <Box textAlign="center">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Credit Status
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {data.sales_credit.status === 'unpaid' ? 'Outstanding Credit' : 'Credit Cleared'}
                  </Typography>
                </Box>

                <Box textAlign="center">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Credit Amount
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    ETB {Number(data.sales_credit.credit_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Payback Due
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {new Date(data.sales_credit.payback_day).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </Typography>
                </Box>
                {/* <Box textAlign="center">
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Credit Status 
                  </Typography>
                  <Chip
                    label={data.sales_credit.status === 'unpaid' ? 'Unpaid' : 'Paid'}
                    color={data.sales_credit.status === 'unpaid' ? 'error' : 'success'}
                    size="small"
                    sx={{ fontWeight: 700, fontSize: '1rem', px: 2 }}
                  />
                </Box> */}
              </Stack>
            </Box>
          </Grid>
        )}
      </Grid>
    </MainCard>
  );
}
