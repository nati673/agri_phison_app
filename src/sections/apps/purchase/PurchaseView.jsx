import {
  Box,
  Chip,
  Grid,
  Stack,
  Typography,
  Divider,
  Paper,
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

export default function PurchaseView({ data }) {
  const subdomain = getSubdomain();
  const { companyLogo } = useGetCompanyLogo(subdomain);
  return (
    <MainCard
      elevation={1}
      sx={{
        p: { xs: 2, sm: 4 },
        borderRadius: 4,
        maxWidth: 900,
        mx: 'auto',
        mt: 3
      }}
    >
      <Grid container spacing={3}>
        {/* Invoice Header */}
        <Grid item xs={12}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
            {/* COMPANY LOGO */}
            <Box>
              <img src={`${import.meta.env.VITE_APP_API_URL}/tenant/logo/${companyLogo}`} alt="Company Logo" width={224} />
            </Box>
            <Box>
              <Typography variant="h3" fontWeight={700} sx={{ letterSpacing: 0.5 }}>
                Purchase Invoice #{data.purchase_id}
              </Typography>
              <Chip label="Completed" color="success" size="small" sx={{ fontWeight: 600, fontSize: '1rem', textAlign: 'end' }} />
            </Box>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Added: {new Date(data.added_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} <br />
            Supplier: {data.supplier}
          </Typography>
        </Grid>
        {/* Overview / Details */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">Business Unit</Typography>
              <Typography variant="subtitle1">{data.business_unit}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">Location</Typography>
              <Typography variant="subtitle1">{data.location_name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">Total Amount</Typography>
              <Typography variant="subtitle1">
                ETB {Number(data.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography color="text.secondary">Last Updated</Typography>
              <Typography variant="body2">
                {new Date(data.updated_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        {/* Items Table */}
        <Grid item xs={12}>
          <Divider sx={{ mb: 2 }} />
          <TableContainer sx={{ borderRadius: 1, mt: 1 }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: '#74CB2B' }}>
                <TableRow>
                  <TableCell>SKU</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  {/* <TableCell align="right">Volume</TableCell> */}
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total Cost</TableCell>
                  <TableCell>Batch code</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.items.map((item) => (
                  <TableRow key={item.purchase_item_id}>
                    <TableCell>
                      <Typography variant="caption">{item.sku}</Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>{item.product_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.product_unit}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.category_name}</TableCell>
                    {/* <TableCell align="right">
                      {item.product_volume} {item.product_unit}
                    </TableCell> */}
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">{Number(item.purchase_price).toLocaleString()}</TableCell>
                    <TableCell align="right">{Number(item.total_price).toLocaleString()}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{item.batches[0].batch_code}</Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* Actions */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              startIcon={<DocumentDownload size={20} />}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            >
              Download Invoice
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}
