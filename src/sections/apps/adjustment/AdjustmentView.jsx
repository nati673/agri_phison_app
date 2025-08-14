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

export default function InventoryAdjustmentView({ data }) {
  const subdomain = getSubdomain();
  const { companyLogo } = useGetCompanyLogo(subdomain);

  const isQuantityAdjustment = data.adjustment_type === 'quantity';
  const isValueAdjustment = data.adjustment_type === 'value';

  return (
    <MainCard
      // elevation={1}
      sx={{
        p: { xs: 2, sm: 4 },
        // borderRadius: 4,
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
                Inventory Adjustment #{data.header_id}
              </Typography>
              <Chip
                label={data.adjustment_status?.toUpperCase()}
                color={data.adjustment_status === 'approved' ? 'success' : data.adjustment_status === 'submitted' ? 'warning' : 'error'}
                size="small"
                sx={{ fontWeight: 600, fontSize: '1rem' }}
              />
            </Box>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Adjustment Date:{' '}
            {new Date(data.adjustment_date).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}
            <br />
            Adjusted By: {data.adjusted_by_name}
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
              <Typography color="text.secondary">Adjustment Type</Typography>
              <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                {data.adjustment_type}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">Reason</Typography>
              <Typography variant="subtitle1">{data.reason_code}</Typography>
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
                  <TableCell>SKU</TableCell>
                  <TableCell>Product Name</TableCell>

                  {isQuantityAdjustment && (
                    <>
                      <TableCell align="right">Previous Qty</TableCell>
                      <TableCell align="right">New Qty</TableCell>
                      <TableCell align="right">Change (Δ)</TableCell>
                    </>
                  )}

                  {isValueAdjustment && (
                    <>
                      <TableCell align="right">Previous Unit Price</TableCell>
                      <TableCell align="right">New Unit Price</TableCell>
                      <TableCell align="right">Value Change</TableCell>
                    </>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="caption">{item.sku}</Typography>
                    </TableCell>
                    <TableCell>{item.product_name}</TableCell>

                    {isQuantityAdjustment && (
                      <>
                        <TableCell align="right">{item.previous_quantity ?? '-'}</TableCell>
                        <TableCell align="right">{item.new_quantity ?? '-'}</TableCell>
                        <TableCell
                          align="right"
                          style={{
                            color: item.delta_quantity < 0 ? 'red' : 'green'
                          }}
                        >
                          {item.delta_quantity ?? 0}
                        </TableCell>
                      </>
                    )}

                    {isValueAdjustment && (
                      <>
                        <TableCell align="right">
                          {item.previous_unit_price != null ? `ETB ${item.previous_unit_price.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {item.new_unit_price != null ? `ETB ${item.new_unit_price.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell
                          align="right"
                          style={{
                            color: (item.new_unit_price ?? 0) - (item.previous_unit_price ?? 0) < 0 ? 'red' : 'green'
                          }}
                        >
                          {item.new_unit_price != null && item.previous_unit_price != null
                            ? `ETB ${(item.new_unit_price - item.previous_unit_price).toLocaleString(undefined, {
                                minimumFractionDigits: 2
                              })}`
                            : '-'}
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Notes */}
        {data.header_notes && (
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Notes: {data.header_notes}
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
              Download Adjustment
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}
