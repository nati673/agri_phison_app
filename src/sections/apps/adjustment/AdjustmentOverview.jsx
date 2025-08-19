import React from 'react';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import { ShieldTick, Clock, ShieldCross } from 'iconsax-react';
import ReportCard from 'components/cards/statistics/ReportCard'; // Use your ReportCard component

export default function OverviewCards({ adjustments = [] }) {
  const theme = useTheme();
  const total = adjustments.length || 0;

  // Status counts
  const approvedCount = adjustments.filter((p) => p.adjustment_status === 'approved').length;
  const submittedCount = adjustments.filter((p) => p.adjustment_status === 'submitted').length;
  const rejectedCount = adjustments.filter((p) => p.adjustment_status === 'rejected').length;

  // Helper to format percent
  const formatPercent = (count) => (total ? `${((count / total) * 100).toFixed(1)}%` : '0.0%');

  // Data array for rendering
  const overviewData = [
    {
      title: 'Approved',
      count: approvedCount,
      percent: formatPercent(approvedCount),
      color: theme.palette.success.main,
      icon: ShieldTick
    },
    {
      title: 'Submitted',
      count: submittedCount,
      percent: formatPercent(submittedCount),
      color: theme.palette.warning.main,
      icon: Clock
    },
    {
      title: 'Rejected',
      count: rejectedCount,
      percent: formatPercent(rejectedCount),
      color: theme.palette.error.main,
      icon: ShieldCross
    }
  ];

  // Render
  return (
    <Grid container spacing={2} sx={{ width: '100%', mb: 4 }}>
      {overviewData.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.title}>
          <ReportCard
            primary={item.count}
            secondary={`${item.title}: ${item.percent}`}
            iconPrimary={item.icon}
            color={item.color}
          />
        </Grid>
      ))}
    </Grid>
  );
}
