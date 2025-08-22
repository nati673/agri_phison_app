import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Divider, Chip, Avatar, Stack } from '@mui/material';
import { useGetStockTransferDetail } from 'api/transfer';
import StockTransferInvoice from 'components/invoices/pages/StockTransferInvoice';
import StockTransferOverview from 'sections/apps/transfer/detail/StockTransferOverview';

export default function StockTransferDetailPage() {
  const { accessId } = useParams();
  const { transferDetail, transferDetailLoading, transferDetailError } = useGetStockTransferDetail(accessId);
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    if (!transferDetail?.items) return;
    const subTotal = transferDetail.items.reduce((sum, item) => sum + (item.price || 100) * item.quantity, 0);
    const tax = subTotal * 0.15;
    setGrandTotal(subTotal + tax);
  }, [transferDetail]);

  if (transferDetailLoading) return <Typography>Loading...</Typography>;
  if (transferDetailError) return <Typography color="error">Error: {transferDetailError.message}</Typography>;
  if (!transferDetail) return <Typography>No stock transfer found. {accessId}</Typography>;
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Stock Transfer Detail Overview
      </Typography>
      <StockTransferOverview data={transferDetail} grandTotal={grandTotal} />

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
