import { Box, Stack, Typography, Button } from '@mui/material';
import MainCard from 'components/MainCard';
import { Setting2 } from 'iconsax-react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

// ==============================|| Stock Transfer - EMPTY STATE ||============================== //

function EmptyStockTransfer() {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleAddTransfer = () => {
    navigate('/workspace/transfers/add-new-transfer');
  };

  return (
    <MainCard
      sx={{
        textAlign: 'center',
        py: 6,
        border: `1px dashed ${theme.palette.divider}`,
        borderRadius: 2,
        bgcolor: theme.palette.background.default
      }}
    >
      <Stack spacing={2} alignItems="center">
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: theme.palette.primary.lighter,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Setting2 size="36" color={theme.palette.primary.main} variant="Bulk" />
        </Box>

        <Typography variant="h6">No stock transfers found</Typography>

        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
          Start by creating a new stock transfer to move products between locations or business units.
        </Typography>

        <Button variant="contained" size="medium" startIcon={<Setting2 size="18" />} sx={{ mt: 1 }} onClick={handleAddTransfer}>
          Add Transfer
        </Button>
      </Stack>
    </MainCard>
  );
}

export default EmptyStockTransfer;
