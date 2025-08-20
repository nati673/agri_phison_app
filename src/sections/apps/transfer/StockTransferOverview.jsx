import React from 'react';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import { Clock, ShieldCross, ShieldTick } from 'iconsax-react';
import ReportCard from 'components/cards/statistics/ReportCard';

// ==============================|| STOCK TRANSFER OVERVIEW ||============================== //

export default function StockTransferOverview({ transfers = [] }) {
  const theme = useTheme();
  const total = transfers.length || 0;

  // Status counts
  const pendingCount = transfers.filter((t) => t.transfer_status === 'pending').length;
  const rejectedCount = transfers.filter((t) => t.transfer_status === 'rejected').length;
  const receivedCount = transfers.filter((t) => t.transfer_status === 'received').length;

  const formatPercent = (count) => (total ? `${((count / total) * 100).toFixed(1)}%` : '0.0%');

  const overviewData = [
    {
      title: 'Pending',
      count: pendingCount,
      percent: formatPercent(pendingCount),
      color: theme.palette.warning.main,
      icon: Clock
    },
    {
      title: 'Received',
      count: receivedCount,
      percent: formatPercent(receivedCount),
      color: theme.palette.success.main,
      icon: ShieldTick
    },
    {
      title: 'Rejected',
      count: rejectedCount,
      percent: formatPercent(rejectedCount),
      color: theme.palette.error.main,
      icon: ShieldCross
    }
  ];

  return (
    <Grid container spacing={2} sx={{ width: '100%', mb: 4 }}>
      {overviewData.map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item.title}>
          <ReportCard primary={item.count} secondary={`${item.title}: ${item.percent}`} iconPrimary={item.icon} color={item.color} />
        </Grid>
      ))}
    </Grid>
  );
}
