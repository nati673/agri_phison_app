import { Avatar, Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import { TickCircle } from 'iconsax-react';

// Helper: highlights query inside text
const Highlighted = ({ text, query }) => {
  if (!query || !text) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  const parts = String(text).split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <Box key={i} component="mark" sx={{ px: 0.25, borderRadius: 0.5, bgcolor: 'warning.100', color: 'warning.dark' }}>
            {part}
          </Box>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

// Formats price nicely
const formatPrice = (value) => {
  if (value == null) return '';
  return `ETB ${parseFloat(value).toFixed(2)}`;
};

export const renderProductOption = (props, option, state, priceFlag = true) => {
  const { selected, inputValue } = state || {};
  const theme = useTheme();

  const isInactive = !option.is_active;
  const name = option.product_name || option.product_name_localized;
  const priceText = formatPrice(option.unit_price);
  const volume = option.product_volume ? `${option.product_volume} ${option.product_unit || ''}` : null;
  const category = option.category_name;
  const company = option.company_name;
  const location = option.location_name;

  return (
    <Box
      component="li"
      {...props}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        px: 1,
        py: 1,
        borderRadius: 2,
        bgcolor: selected ? 'success.50' : isInactive ? 'action.disabledBackground' : '',
        border: selected ? `2px solid ${theme.palette.success.main}` : '1px solid #f3f3f3',
        gap: 1.25,
        opacity: isInactive ? 0.6 : 1,
        transition: 'all 0.13s'
      }}
    >
      <Avatar
        variant="rounded"
        sx={{
          width: 32,
          height: 32,
          bgcolor: '#F2F4EF',
          color: theme.palette.success.main,
          fontWeight: 700
        }}
      >
        {name?.[0]?.toUpperCase()}
      </Avatar>

      <Box flex={1} minWidth={0}>
        <Stack direction="row" alignItems="center" spacing={0.75} minWidth={0}>
          <Typography variant="body1" fontWeight={700} color="text.primary" noWrap>
            <Highlighted text={name} query={inputValue} />
          </Typography>
          {category && (
            <Chip
              size="small"
              label={category}
              variant="outlined"
              sx={{
                height: 20,
                '& .MuiChip-label': { px: 0.75, fontSize: 11, fontWeight: 600 }
              }}
            />
          )}
          {option.is_new ? (
            <Chip
              size="small"
              label="New"
              sx={{
                height: 20,
                bgcolor: 'gold',
                '& .MuiChip-label': { px: 0.75, fontSize: 11, fontWeight: 600 }
              }}
            />
          ) : (
            <></>
          )}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25, flexWrap: 'wrap' }}>
          {priceText && priceFlag && (
            <Typography variant="caption" sx={{ fontSize: 13, fontWeight: 600, color: 'success.dark' }}>
              {priceText}
            </Typography>
          )}
          {option.sku && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }} noWrap>
              {priceText && priceFlag ? '· ' : `${option.product_unit} · `} SKU: {option.sku}
            </Typography>
          )}
          {volume && (
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12 }} noWrap>
              {!priceText && !option.sku ? '' : '· '}
              {volume}
            </Typography>
          )}
        </Stack>

        {(company || location) && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: 11, mt: 0.25 }}>
            {[company, location].filter(Boolean).join(' · ')}
          </Typography>
        )}
      </Box>

      {selected && <TickCircle size="22" color={theme.palette.success.main} variant="Bold" style={{ marginRight: 4 }} />}
    </Box>
  );
};
