import { Avatar, Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import { TickCircle } from 'iconsax-react';
import { formatDistanceToNow } from 'date-fns'; // ✅ add this

// ✅ Date formatter for fallback
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

// ✅ Quantity formatter
const formatQty = (qty) => {
  if (!qty) return '';
  return `${parseFloat(qty).toLocaleString()} units`;
};

// ✅ Price formatter
const formatPrice = (value) => {
  if (!value) return '';
  return `ETB ${parseFloat(value).toFixed(2)}`;
};

// ✅ Highlight helper
const Highlighted = ({ text, query }) => {
  if (!query || !text) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')})`, 'ig');
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

// ✅ Batch option renderer with "time ago"
export const renderBatchOption = (props, option, state) => {
  const { selected, inputValue } = state || {};
  const theme = useTheme();

  const isExpired = option.expiry_date && new Date(option.expiry_date) < new Date();
  const expiryText = formatDate(option.expiry_date);
  const quantityText = formatQty(option.quantity);
  const purchasePrice = formatPrice(option.purchase_price);
  const sellingPrice = formatPrice(option.selling_price);

  // 👉 Added time in "2 hours ago" format
  const addedAgo = option.created_at && formatDistanceToNow(new Date(option.created_at), { addSuffix: true });

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
        bgcolor: selected ? 'success.50' : isExpired ? 'error.50' : '',
        border: selected ? `2px solid ${theme.palette.success.main}` : '1px solid #f3f3f3',
        gap: 1.25,
        opacity: isExpired ? 0.75 : 1,
        transition: 'all 0.13s'
      }}
    >
      {/* Avatar */}
      <Avatar
        variant="rounded"
        sx={{
          width: 32,
          height: 32,
          bgcolor: '#F2F4EF',
          color: theme.palette.primary.main,
          fontWeight: 700
        }}
      >
        {option.batch_code?.[0]?.toUpperCase() || 'B'}
      </Avatar>

      {/* Content */}
      <Box flex={1} minWidth={0}>
        {/* Batch code row */}
        <Stack direction="row" alignItems="center" spacing={0.75} minWidth={0}>
          <Typography variant="body1" fontWeight={700} color="text.primary" noWrap>
            <Highlighted text={option.batch_code} query={inputValue} />
          </Typography>
          {isExpired && (
            <Chip
              size="small"
              color="error"
              label="Expired"
              sx={{
                height: 20,
                '& .MuiChip-label': { px: 0.75, fontSize: 11, fontWeight: 600 }
              }}
            />
          )}
        </Stack>

        {/* Secondary info row */}
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25, flexWrap: 'wrap' }}>
          {quantityText && (
            <Typography variant="caption" sx={{ fontSize: 13, fontWeight: 600, color: 'success.dark' }}>
              {quantityText}
            </Typography>
          )}
          {expiryText && (
            <Typography variant="caption" color={isExpired ? 'error.main' : 'text.secondary'} sx={{ fontSize: 12 }}>
              · Expires: {expiryText}
            </Typography>
          )}
          {addedAgo && (
            <Typography variant="caption" sx={{ fontSize: 12, color: 'info.main' }}>
              · Added {addedAgo}
            </Typography>
          )}
        </Stack>

        {/* Price + location */}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 0.25 }}>
          {purchasePrice && (
            <Typography variant="caption" sx={{ fontSize: 12, color: 'text.secondary' }}>
              Cost: {purchasePrice}
            </Typography>
          )}
          {sellingPrice && (
            <Typography variant="caption" sx={{ fontSize: 12, color: 'success.dark' }}>
              · Price: {sellingPrice}
            </Typography>
          )}
          {option.location_name && (
            <Typography variant="caption" sx={{ fontSize: 11, color: 'text.disabled' }}>
              · {option.location_name}
            </Typography>
          )}
        </Stack>
      </Box>

      {selected && <TickCircle size="22" color={theme.palette.success.main} variant="Bold" style={{ marginRight: 4 }} />}
    </Box>
  );
};
