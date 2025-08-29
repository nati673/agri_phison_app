import { Box, Stack, Typography, Button } from '@mui/material';
import MainCard from 'components/MainCard';
import { Setting2 } from 'iconsax-react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

function EmptySales() {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleAddSale = () => {
    navigate('/workspace/sales/add-sales');
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

        {/* Updated heading */}
        <Typography variant="h6">No credits found</Typography>

        {/* Updated message */}
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 350 }}>
          In order to add credit, please make a sale and enter the paid amount or switch to <strong>Unpaid</strong> on the sales page after
          selecting items to sell.
        </Typography>

        {/* Keep Add Sale button */}
        <Button variant="contained" size="medium" startIcon={<Setting2 size="18" />} sx={{ mt: 1 }} onClick={handleAddSale}>
          Add Sale
        </Button>
      </Stack>
    </MainCard>
  );
}

export default EmptySales;
