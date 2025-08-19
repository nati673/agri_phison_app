import React from 'react';
import { Box, Chip, Divider, Grid, Stack, Typography, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { format, formatDistanceToNow } from 'date-fns';

export default function CreditsView({ data }) {
  if (!data) return null;

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, mb: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Credit Details #{data.credit_id}
      </Typography>
      <Grid container spacing={3} mb={2}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography color="text.secondary" fontWeight={500}>
            Customer
          </Typography>
          <Typography variant="subtitle1">{data.customer_name}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography color="text.secondary" fontWeight={500}>
            Business Unit
          </Typography>
          <Typography variant="subtitle1">{data.unit_name}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography color="text.secondary" fontWeight={500}>
            Location
          </Typography>
          <Typography variant="subtitle1">{data.location_name}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography color="text.secondary" fontWeight={500}>
            Total Credit
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            Birr {Number(data.credit_total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography color="text.secondary" fontWeight={500}>
            Remaining Balance
          </Typography>
          <Typography variant="h6" fontWeight={700} color={Number(data.remaining_balance) > 0 ? 'error.main' : 'success.main'}>
            Birr {Number(data.remaining_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography color="text.secondary" fontWeight={500}>
            Payback Date
          </Typography>
          <Typography variant="subtitle1">
            {format(new Date(data.payback_day), 'PPP')}
            <Chip label={formatDistanceToNow(new Date(data.payback_day), { addSuffix: true })} size="small" sx={{ ml: 1 }} color="info" />
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography color="text.secondary" fontWeight={500}>
            Status
          </Typography>
          <Chip
            label={data.status.charAt(0).toUpperCase() + data.status.slice(1)}
            color={data.status === 'unpaid' ? 'error' : data.status === 'paid' ? 'success' : 'warning'}
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '1rem', mt: 1 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography color="text.secondary" fontWeight={500}>
            Added
          </Typography>
          <Typography variant="body2">{format(new Date(data.added_date), 'PPPpp')}</Typography>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Typography color="text.secondary" fontWeight={500}>
            Sale #
          </Typography>
          <Typography variant="body2">{data.sale_id}</Typography>
        </Grid>
      </Grid>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="subtitle2" gutterBottom fontWeight={600}>
        Payments History
      </Typography>
      <TableContainer sx={{ borderRadius: 1 }}>
        <Table size="small">
          <TableBody>
            {data.payments && data.payments.length > 0 && data.payments[0].payment_id ? (
              data.payments.map((payment, idx) => (
                <TableRow key={idx}>
                  <TableCell>Payment ID: {payment.payment_id}</TableCell>
                  <TableCell>Date: {payment.payment_date ? format(new Date(payment.payment_date), 'PPP') : '-'}</TableCell>
                  <TableCell>
                    Amount: Birr{' '}
                    {payment.payment_amount ? Number(payment.payment_amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>
                  No payments recorded for this credit.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
