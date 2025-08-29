import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Divider, Chip, Avatar, Stack, Skeleton, Alert } from '@mui/material';
import { useGetStockTransferDetail } from 'api/transfer';
import StockTransferInvoice from 'components/invoices/pages/StockTransferInvoice';
import StockTransferOverview from 'sections/apps/transfer/detail/StockTransferOverview';

export default function StockTransferDetailPage() {
  const { accessId } = useParams();
  const { transferDetail, transferDetailLoading, transferDetailError, refetch } = useGetStockTransferDetail(accessId);
  const [grandTotal, setGrandTotal] = useState(0);
  const [actionDone, setActionDone] = useState(false);
  useEffect(() => {
    if (!transferDetail?.items) return;
    const subTotal = transferDetail.items.reduce((sum, item) => sum + (item.selling_price || 100) * item.quantity, 0);
    const tax = subTotal * 0.15;
    setGrandTotal(subTotal);
  }, [transferDetail]);
  useEffect(() => {
    refetch();
  }, [actionDone, refetch]);
  if (transferDetailLoading)
    return (
      <Box sx={{ p: 4 }}>
        <Skeleton variant="text" width={320} height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={380} sx={{ borderRadius: '20px', mb: 3 }} />
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <Skeleton variant="rounded" width={180} height={40} />
            <Skeleton variant="rounded" width={140} height={40} sx={{ mb: 1, mt: 1 }} />
          </Grid>
        </Grid>
        <Skeleton variant="rectangular" width="100%" height={700} sx={{ mb: 2, mt: 3 }} />
        <Skeleton variant="rectangular" width={240} height={36} />
      </Box>
    );
  if (transferDetailError)
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" variant="filled" sx={{ fontSize: 18, mb: 3 }}>
          {transferDetailError?.message || 'Something went wrong while fetching transfer details.'}
        </Alert>
      </Box>
    );
  if (!transferDetail) return <Typography>No stock transfer found. {accessId}</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Stock Transfer Detail Overview
      </Typography>
      <StockTransferOverview
        data={transferDetail}
        grandTotal={grandTotal}
        onActionDone={() => setActionDone((prev) => !prev)}
        onFetch={refetch}
      />

      {/* Render the invoice, pass needed transfer info */}
      {transferDetail.invoice_id && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h5" gutterBottom>
            Linked Invoice
          </Typography>
          <StockTransferInvoice
            invoiceId={transferDetail.invoice_id}
            data={transferDetail}
            accessToken={transferDetail.invoice_access_token}
            grandTotal={grandTotal}
          />
        </>
      )}
    </Box>
  );
}
