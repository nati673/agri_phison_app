import React from 'react';
import { Card, Stack, Typography, Box, useTheme, Tooltip } from '@mui/material';
import { Shop, Warning2, ArchiveMinus } from 'iconsax-react';

function StatCard({ title, count, total, color, icon, tooltip }) {
  const theme = useTheme();
  const percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';

  return (
    <Tooltip title={tooltip || ''}>
      <Card
        sx={{
          p: 2.5,
          flex: 1,
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          background: `linear-gradient(135deg, ${color.light}40, ${color.dark}70)`,
          color: theme.palette.getContrastText(color.dark),
          transition: 'all 0.2s ease',
          '&:hover': { transform: 'translateY(-2px)', boxShadow: 5 }
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            mr: 2,
            borderRadius: 2,
            bgcolor: `${color.main}33`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="overline" sx={{ opacity: 0.8 }}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700}>
            {count}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.8 }}>
            {percent}% of total
          </Typography>
        </Box>
      </Card>
    </Tooltip>
  );
}

export default function SpecialProductsOverview({ smallQty = [], expired = [], overstocked = [], totalProducts = 0 }) {
  const theme = useTheme();

  const cards = [
    {
      title: 'Low Stock',
      count: smallQty.length,
      total: totalProducts,
      color: theme.palette.warning,
      icon: <Warning2 size={24} color={theme.palette.warning.main} />,
      tooltip: 'Products with quantity ≤ minimum stock'
    },
    {
      title: 'Expired',
      count: expired.length,
      total: totalProducts,
      color: theme.palette.error,
      icon: <ArchiveMinus size={24} color={theme.palette.error.main} />,
      tooltip: 'Products past their expiry date'
    },
    {
      title: 'Overstocked',
      count: overstocked.length,
      total: totalProducts,
      color: theme.palette.primary,
      icon: <Shop size={24} color={theme.palette.primary.main} />,
      tooltip: 'Products with quantity > maximum stock'
    }
  ];

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </Stack>
  );
}
