import { Avatar, Box, Chip, Stack, Typography, useTheme } from '@mui/material';
import { TickCircle } from 'iconsax-react';

// Highlights matching text
const Highlighted = ({ text, query }) => {
  if (!query || !text) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
  const parts = String(text).split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <Box
            key={i}
            component="mark"
            sx={{
              px: 0.25,
              borderRadius: 0.5,
              bgcolor: 'warning.100',
              color: 'warning.dark'
            }}
          >
            {part}
          </Box>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

export const renderBusinessUnitOption = (props, option, state) => {
  const { selected, inputValue } = state;
  const theme = useTheme();

  const isInactive = !option.is_active;
  const name = option.unit_name;
  const code = option.unit_code;
  const description = option.description;
  const locationCount = option.locations?.length || 0;

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
        bgcolor: selected ? 'success.50' : isInactive ? 'action.disabledBackground' : '#fff',
        border: selected ? `2px solid ${theme.palette.success.main}` : '1px solid #f3f3f3',
        gap: 1.25,
        opacity: isInactive ? 0.6 : 1,
        transition: 'all 0.13s'
      }}
    >
      {/* Avatar with first letter of name */}
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
        {name?.[0]?.toUpperCase()}
      </Avatar>

      {/* Main text content */}
      <Box flex={1} minWidth={0}>
        <Stack direction="row" alignItems="center" spacing={0.75} minWidth={0}>
          {/* Highlighted unit name */}
          <Typography variant="body1" fontWeight={700} color="text.primary" noWrap>
            <Highlighted text={name} query={inputValue} />
          </Typography>
          {/* Show code as Chip */}
          {code && (
            <Chip
              size="small"
              label={code}
              variant="outlined"
              sx={{
                height: 20,
                '& .MuiChip-label': { px: 0.75, fontSize: 11, fontWeight: 600 }
              }}
            />
          )}
        </Stack>

        {/* Show description */}
        {description && (
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 12, mt: 0.25 }} noWrap>
            {description}
          </Typography>
        )}

        {/* Show location count */}
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, mt: 0.25 }} noWrap>
          {locationCount} Location{locationCount !== 1 ? 's' : ''}
        </Typography>
      </Box>

      {/* Tick when selected */}
      {selected && <TickCircle size="22" color={theme.palette.success.main} variant="Bold" style={{ marginRight: 4 }} />}
    </Box>
  );
};
