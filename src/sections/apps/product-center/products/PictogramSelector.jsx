import { Box, Grid, Tooltip, Typography, Chip, useTheme } from '@mui/material';
import { TickCircle } from 'iconsax-react';

export default function PictogramSelector({
  value = '',
  onChange,
  options = [],
  tooltipStyle,
  label = 'Pictograms (select all that apply)'
}) {
  // Robustly create selected array from value (string or array)
  const selected = (() => {
    if (typeof value === 'string') return value.split(',').filter(Boolean);
    if (Array.isArray(value)) return value;
    return [];
  })();

  const theme = useTheme();

  const handleClick = (id) => {
    const next = selected.includes(id) ? selected.filter((v) => v !== id) : [...selected, id];
    onChange(next.join(','));
  };

  const handleDelete = (id) => {
    const next = selected.filter((v) => v !== id);
    onChange(next.join(','));
  };

  return (
    <Grid item xs={12}>
      <Typography fontWeight={600} sx={{ mb: 1 }}>
        {label}
        {selected.length > 0 && (
          <Typography component="span" color="primary" fontSize={14} sx={{ ml: 1, verticalAlign: 'middle' }}>
            {selected.length} selected
          </Typography>
        )}
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {options.map((option) => {
          const isSelected = selected.includes(option.id);
          return (
            <Grid item key={option.id}>
              <Tooltip title={option.label} componentsProps={tooltipStyle} arrow>
                <Box
                  role="button"
                  aria-label={option.label + (isSelected ? ' (selected)' : '')}
                  tabIndex={0}
                  onClick={() => handleClick(option.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') handleClick(option.id);
                  }}
                  sx={{
                    border: isSelected ? `2.5px solid ${theme.palette.primary.main}` : '2px solid #e5e5ea',
                    borderRadius: 3,
                    boxShadow: isSelected ? `0 2px 8px ${theme.palette.primary.light}30, 0 0 0 2px #AAF0C4` : '0 1px 4px #ddd1',
                    p: 1.6,
                    width: 64,
                    height: 72,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 120ms cubic-bezier(.64,.09,.08,1)',
                    bgcolor: isSelected ? '#F2FFF6' : '#fff',
                    cursor: 'pointer',
                    outline: 'none',
                    position: 'relative',
                    '&:hover, &:focus-visible': {
                      border: `2.5px solid ${theme.palette.primary.main}`,
                      bgcolor: '#F7FBFF'
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={option.image}
                      alt={option.label}
                      style={{
                        width: 42,
                        height: 42,
                        opacity: isSelected ? 1 : 0.85,
                        transition: 'opacity 120ms'
                      }}
                    />
                    {isSelected && (
                      <TickCircle
                        color="primary"
                        sx={{
                          position: 'absolute',
                          bottom: -8,
                          right: -8,
                          fontSize: 24,
                          bgcolor: '#fff',
                          borderRadius: '50%',
                          boxShadow: '0 0 0 2px #fff'
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    fontSize={12}
                    color={isSelected ? 'primary' : 'text.secondary'}
                    fontWeight={isSelected ? 700 : 500}
                    sx={{ mt: 1, textAlign: 'center' }}
                    noWrap
                  >
                    {option.label}
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
      {/* Chips for selected pictograms */}
      {selected.length > 0 && (
        <Box sx={{ mt: 2 }}>
          {options
            .filter((o) => selected.includes(o.id))
            .map((o) => (
              <Chip
                key={o.id}
                label={
                  <span style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={o.image} alt="" style={{ width: 20, height: 20, marginRight: 6 }} />
                    {o.label}
                  </span>
                }
                onDelete={() => handleDelete(o.id)}
                color="primary"
                variant="outlined"
                sx={{
                  mr: 1,
                  mb: 1,
                  bgcolor: '#f4fbe5',
                  borderRadius: '5px',
                  fontWeight: 600,
                  fontSize: 13,
                  border: `1.5px solid ${theme.palette.primary.light}`
                }}
              />
            ))}
        </Box>
      )}
    </Grid>
  );
}
