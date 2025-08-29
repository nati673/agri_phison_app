import { Avatar, Box, Stack, Typography, alpha, useTheme } from '@mui/material';
import MainCard from 'components/MainCard';
import { ArrowSwapHorizontal } from 'iconsax-react';
import React from 'react';

// Helper to format currency
function formatCurrency(val) {
  return val ? Number(val).toLocaleString(undefined, { style: 'currency', currency: 'ETB' }) : 'ETB0.00';
}

function BalanceCard({ transaction }) {
  const theme = useTheme();

  // Sum of all unpaid credits: show remaining_balance for each "unpaid"
  const totalUnpaidBalance =
    transaction?.credits
      ?.filter((credit) => credit.status === 'unpaid')
      .reduce((sum, credit) => sum + parseFloat(credit.remaining_balance || 0), 0) || 0;

  return (
    <MainCard
      content={false}
      sx={{
        bgcolor: alpha(theme.palette.primary.main, 1),
        mt: 2,
        py: 3,
        color: 'common.white',
        '&:after': {
          content: '""',
          background: `linear-gradient(245deg, transparent 25.46%, rgba(0, 0, 0, 0.2) 68.77%, rgba(0, 0, 0, 0.3) 81.72%)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          opacity: 0.6
        }
      }}
    >
      <Box sx={{ p: 2, position: 'inherit', zIndex: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack>
            <Typography>Total Remain Credit Balance</Typography>
            <Typography variant="h4">{formatCurrency(totalUnpaidBalance)}</Typography>
          </Stack>
          <Avatar
            variant="rounded"
            type="filled"
            sx={{ bgcolor: theme.palette.mode === 'dark' ? 'primary.100' : 'primary.darker', width: 50, height: 50 }}
          >
            <ArrowSwapHorizontal />
          </Avatar>
        </Stack>
      </Box>
    </MainCard>
  );
}

export default BalanceCard;
