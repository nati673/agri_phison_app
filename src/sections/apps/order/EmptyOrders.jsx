import { Box, Stack, Typography, Button } from '@mui/material';
import MainCard from 'components/MainCard';
import { FilterRemove, Setting2 } from 'iconsax-react';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

function isFilterActive(filter) {
  // Checks if any filter field is set (not '')
  return filter && (filter.business_unit_id || filter.location_id || filter.status || filter.customer_search);
}

function EmptyOrders({ setFilter, filter }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleAddOrder = () => {
    navigate('/workspace/order/add-new-order');
  };

  const handleClearFilter = () => {
    setFilter &&
      setFilter({
        business_unit_id: '',
        location_id: '',
        status: '',
        customer_search: ''
      });
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
        <Typography variant="h6">No orders found</Typography>

        {/* Show filter warning if any filter is active */}
        {filter ? (
          <Typography variant="body2" color="error" sx={{ maxWidth: 320 }}>
            No results match your current filters. Try changing or clearing the filters to see more orders.
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300 }}>
            Start by adding a new order to keep your sales records up to date.
          </Typography>
        )}

        <Stack direction="row" spacing={2}>
          {!filter && (
            <Button variant="contained" size="medium" startIcon={<Setting2 size="18" />} sx={{ mt: 1 }} onClick={handleAddOrder}>
              Add Order
            </Button>
          )}

          {filter && (
            <Button
              variant="outlined"
              startIcon={<FilterRemove size="18" />}
              color="error"
              size="medium"
              sx={{ mt: 1 }}
              onClick={handleClearFilter}
              disabled={!setFilter}
            >
              Clear Filters
            </Button>
          )}
        </Stack>
      </Stack>
    </MainCard>
  );
}

export default EmptyOrders;
