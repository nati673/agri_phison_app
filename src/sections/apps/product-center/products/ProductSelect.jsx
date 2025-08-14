import { Autocomplete, TextField, CircularProgress, Box, Typography, Avatar } from '@mui/material';
import { useState } from 'react';
// Import Iconsax tick circle icon (or use your icon system)
import { TickCircle } from 'iconsax-react'; // adjust import path for your setup

export default function ProductSelect({
  products = [],
  form,
  setForm,
  loading,
  iconField = 'icon', // which product field is used for icon/image/pictogram (customizable!)
  productLabelField = 'product_name', // use localized name if desired!
  ...props // rest props support
}) {
  const [open, setOpen] = useState(false);

  // Get selected product
  const selected = products.find((p) => p.product_id === form.product_id) || null;

  const requiredInputStyle = {
    '& .MuiOutlinedInput-root': {
      paddingLeft: '8px',
      borderRadius: 10,
      background: '#F9FBF7',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 1.8,
        bottom: 1.8,
        left: 1,
        width: 4.8,
        borderTopLeftRadius: 100,
        borderBottomLeftRadius: 100,
        backgroundColor: '#76CB2B'
      }
    }
  };

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={products}
      loading={loading}
      getOptionLabel={(opt) => opt[productLabelField] || opt.product_name_localized || opt.product_name || ''}
      value={selected}
      onChange={(e, val) => setForm({ ...form, product_id: val?.product_id || '' })}
      isOptionEqualToValue={(option, value) => option.product_id === value?.product_id}
      // Disabled options: only show active products!
      getOptionDisabled={(option) => option.is_active !== 1}
      renderOption={(props, option, { selected }) => (
        <Box
          component="li"
          {...props}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 1,
            py: 1,
            borderRadius: 2,
            bgcolor: selected ? '#EBFFD7' : '#fff',
            border: selected ? '2px solid #77CA2A' : '1px solid #f3f3f3',
            transition: 'all 0.13s',
            position: 'relative',
            gap: 1.5
          }}
        >
          <Avatar
            src={option.image_url || option.icon || ''}
            alt={option.product_name}
            sx={{
              width: 32,
              height: 32,
              bgcolor: '#F2F4EF',
              fontWeight: 600,
              fontSize: 16,
              color: '#77CA2A'
            }}
          >
            {option.product_name?.[0] ?? '🧃'}
          </Avatar>
          <Box flex={1} minWidth={0}>
            <Typography variant="body1" fontWeight={600} color="#344B2B" noWrap>
              {option.product_name}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 13 }}>
              {option.unit_price ? `ETB ${option.unit_price}` : ''}
              {option.sku ? ` · SKU: ${option.sku}` : ''}
            </Typography>
          </Box>
          {selected && <TickCircle size="22" color="#76CB2B" variant="Bold" sx={{ mr: 0.5 }} />}
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search product..."
          fullWidth
          variant="outlined"
          //
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="success" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      sx={requiredInputStyle}
      clearOnEscape
      blurOnSelect
      disableClearable={false}
      {...props}
    />
  );
}
