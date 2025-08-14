import React from 'react';
import { Card, Stack, Typography, Box, useTheme } from '@mui/material';
import { ShieldTick, Clock, ShieldCross } from 'iconsax-react';

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
      color: theme.palette.success,
      icon: <ShieldTick size={20} color="white" />
    },
    {
      title: 'Submitted',
      count: submittedCount,
      percent: formatPercent(submittedCount),
      color: theme.palette.warning,
      icon: <Clock size={20} color="white" />
    },
    {
      title: 'Rejected',
      count: rejectedCount,
      percent: formatPercent(rejectedCount),
      color: theme.palette.error,
      icon: <ShieldCross size={20} color="white" />
    }
  ];

  // Render
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', mb: 4 }}>
      {overviewData.map((item) => (
        <Card
          key={item.title}
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            transition: '0.2s ease',
            '&:hover': { boxShadow: 4 }
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: item.color.light,
              mr: 1.5
            }}
          >
            {item.icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {item.title}
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {item.count}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {item.percent} of total
            </Typography>
          </Box>
        </Card>
      ))}
    </Stack>
  );
}
