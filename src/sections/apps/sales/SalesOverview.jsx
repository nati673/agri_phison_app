import React from 'react';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import { ShieldTick, MoneyAdd, Clock, ShieldCross } from 'iconsax-react';
import ReportCard from 'components/cards/statistics/ReportCard';

export default function SalesOverview({ sales = [] }) {
  const theme = useTheme();
  const total = sales.length || 0;

  // Status counts
  const paidCount = sales.filter((s) => s.status === 'paid').length;
  const unpaidCount = sales.filter((s) => s.status === 'unpaid').length;
  const partiallyPaidCount = sales.filter((s) => s.status === 'partially paid').length;
  const refundedCount = sales.filter((s) => s.status === 'refunded').length;

  const formatPercent = (count) => (total ? `${((count / total) * 100).toFixed(1)}%` : '0.0%');

  const overviewData = [
    { title: 'Paid', count: paidCount, percent: formatPercent(paidCount), color: theme.palette.success.main, icon: MoneyAdd },
    {
      title: 'Partially Paid',
      count: partiallyPaidCount,
      percent: formatPercent(partiallyPaidCount),
      color: theme.palette.warning.main,
      icon: Clock
    },
    { title: 'Refunded', count: refundedCount, percent: formatPercent(refundedCount), color: theme.palette.info.main, icon: ShieldCross },
    { title: 'Unpaid', count: unpaidCount, percent: formatPercent(unpaidCount), color: theme.palette.error.main, icon: ShieldTick }
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
