// RenderCustomerOption.jsx
import React from 'react';
import { Box, Avatar, Stack, Typography, Chip, useTheme } from '@mui/material';
import { TickCircle, Call } from 'iconsax-react';

const formatPhone = (phone) => (phone ? `📞 ${phone}` : '');

const RenderCustomerOption = (props, option, { selected, inputValue }) => {
  const theme = useTheme();
  const name =
    option.customer_first_name && option.customer_last_name
      ? `${option.customer_first_name} ${option.customer_last_name}`
      : option.company_name || 'Unknown Customer';

  const phone = formatPhone(option.customer_phone);

  return (
    <Box
      component="li"
      {...props}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1,
        py: 1,
        borderRadius: 2,
        bgcolor: selected ? 'success.50' : '#fff',
        border: selected ? `2px solid ${theme.palette.success.main}` : '1px solid #f3f3f3',
        gap: 1.25,
        transition: 'all 0.13s'
      }}
    >
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: '#F2F4EF',
          color: theme.palette.primary.main,
          fontWeight: 700
        }}
      >
        {name?.[0]?.toUpperCase()}
      </Avatar>

      <Box flex={1} minWidth={0}>
        <Stack direction="row" spacing={0.75} alignItems="center" minWidth={0}>
          <Typography variant="body1" fontWeight={700} color="text.primary" noWrap>
            {name}
          </Typography>
          {option.is_vip && (
            <Chip
              size="small"
              label="VIP"
              sx={{
                height: 20,
                bgcolor: 'gold',
                '& .MuiChip-label': { px: 0.75, fontSize: 11, fontWeight: 600 }
              }}
            />
          )}
        </Stack>

        {option.customer_phone && (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.25 }}>
            <Call size="16" color={theme.palette.text.secondary} />
            <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 12 }}>
              {option.customer_phone}
            </Typography>
          </Stack>
        )}
      </Box>

      {selected && <TickCircle size="22" color={theme.palette.success.main} variant="Bold" style={{ marginRight: 4 }} />}
    </Box>
  );
};

export default RenderCustomerOption;
