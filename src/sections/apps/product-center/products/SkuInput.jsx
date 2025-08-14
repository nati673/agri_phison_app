import { useEffect, useState } from 'react';
import { TextField, CircularProgress, Grid, Box, Tooltip, InputLabel, InputAdornment, Typography } from '@mui/material';
import debounce from 'lodash.debounce';
import { checkSKU } from 'api/products';
import { Information, TickCircle, CloseCircle, Warning2 } from 'iconsax-react';

const SkuInput = ({ companyId, value, handleChange, style, isEdit = false }) => {
  const [status, setStatus] = useState(''); // '', 'loading', 'valid', 'exists', 'error'
  const [message, setMessage] = useState('');

  const checkIfSkuExists = debounce(async (sku) => {
    if (!sku) {
      setStatus('');
      setMessage('');
      return;
    }

    try {
      setStatus('loading');
      const res = await checkSKU(companyId, sku);
      if (res.exists && !isEdit) {
        setStatus('exists');
        setMessage('This SKU already exists. Please use a different one.');
      } else {
        setStatus('valid');
        setMessage('Looks great! This SKU is available.');
      }
    } catch {
      setStatus('error');
      setMessage('Could not validate SKU. Try again.');
    }
  }, 600);

  useEffect(() => {
    checkIfSkuExists(value);
    return () => checkIfSkuExists.cancel();
  }, [value]);

  const getEndAdornmentIcon = () => {
    if (status === 'loading') return <CircularProgress size={20} />;
    if (status === 'valid') return <TickCircle size={20} color="#4CAF50" variant="Bold" />;
    if (status === 'exists') return <CloseCircle size={20} color="#F44336" variant="Bold" />;
    if (status === 'error') return <Warning2 size={20} color="#FFC107" variant="Bold" />;
    return null;
  };

  const getHelperColor = () => {
    switch (status) {
      case 'valid':
        return 'success.main';
      case 'exists':
      case 'error':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Grid item xs={12}>
      {!isEdit && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
          <InputLabel>SKU (Stock Keeping Unit)</InputLabel>
          <Tooltip
            title="SKU: A unique identifier for the product. If left blank, the system will generate one automatically."
            componentsProps={style}
            arrow
          >
            <Information size={16} color="#4CAF50" variant="Outline" />
          </Tooltip>
        </Box>
      )}

      <TextField
        placeholder="Enter a unique SKU"
        fullWidth
        error={status === 'exists' || status === 'error'}
        value={value}
        onChange={handleChange('sku')}
        helperText={
          <Typography variant="caption" sx={{ color: getHelperColor() }}>
            {message}
          </Typography>
        }
        InputProps={{
          endAdornment: <InputAdornment position="end">{getEndAdornmentIcon()}</InputAdornment>
        }}
      />
    </Grid>
  );
};

export default SkuInput;
