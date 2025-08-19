import React from 'react';
import { Card, Stack, Typography, Box, useTheme } from '@mui/material';
import { ShieldTick, Clock, ArchiveTick, ShieldCross } from 'iconsax-react';

export default function OrdersOverviewCards({ orders = [] }) {
  const theme = useTheme();
  const total = orders.length || 0;

  // Status counts
  const approvedCount = orders.filter((o) => o.status === 'approved').length;
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  // Helper to format percent
  const formatPercent = (count) => (total ? `${((count / total) * 100).toFixed(1)}%` : '0.0%');

  const overviewData = [
    {
      title: 'Approved',
      count: approvedCount,
      percent: formatPercent(approvedCount),
      color: theme.palette.success,
      icon: <ShieldTick size={20} color="white" />
    },
    {
      title: 'Pending',
      count: pendingCount,
      percent: formatPercent(pendingCount),
      color: theme.palette.warning,
      icon: <Clock size={20} color="white" />
    },
    {
      title: 'Delivered',
      count: deliveredCount,
      percent: formatPercent(deliveredCount),
      color: theme.palette.info,
      icon: <ArchiveTick size={20} color="white" />
    },
    {
      title: 'Cancelled',
      count: cancelledCount,
      percent: formatPercent(cancelledCount),
      color: theme.palette.error,
      icon: <ShieldCross size={20} color="white" />
    }
  ];

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
