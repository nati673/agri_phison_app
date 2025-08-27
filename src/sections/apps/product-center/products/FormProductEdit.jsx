// NOTE: This version adapts your original form to serve ONLY for editing products, reusing the same inputs/styles as your AddNewProduct form.

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Button,
  TextField,
  InputLabel,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Chip,
  Tooltip,
  Typography,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { updateProduct } from 'api/products';
import { useGetProductCategories } from 'api/product_category';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import { useGetUnits } from 'api/unit';
import useAuth from 'hooks/useAuth';
import SkuInput from './SkuInput';
import GHS01 from '../../../../assets/pictograms/GHS01.png';
import GHS02 from '../../../../assets/pictograms/GHS02.png';
import GHS03 from '../../../../assets/pictograms/GHS03.png';
import GHS04 from '../../../../assets/pictograms/GHS04.png';
import GHS05 from '../../../../assets/pictograms/GHS05.png';
import GHS06 from '../../../../assets/pictograms/GHS06.png';
import GHS07 from '../../../../assets/pictograms/GHS07.png';
import GHS08 from '../../../../assets/pictograms/GHS08.png';
import GHS09 from '../../../../assets/pictograms/GHS09.png';
import PictogramSelector from './PictogramSelector';
import { Information } from 'iconsax-react';

const pictogramOptions = [
  { id: 'GHS01', label: 'Explosive', image: GHS01 },
  { id: 'GHS02', label: 'Flammable', image: GHS02 },
  { id: 'GHS03', label: 'Oxidizing', image: GHS03 },
  { id: 'GHS04', label: 'Compressed Gas', image: GHS04 },
  { id: 'GHS05', label: 'Corrosive', image: GHS05 },
  { id: 'GHS06', label: 'Toxic', image: GHS06 },
  { id: 'GHS07', label: 'Harmful', image: GHS07 },
  { id: 'GHS08', label: 'Health Hazard', image: GHS08 },
  { id: 'GHS09', label: 'Environmental Hazard', image: GHS09 }
];
export default function EditProductForm({ product, closeModal, actionDone }) {
  const theme = useTheme();
  const { user } = useAuth();
  const { productCategories } = useGetProductCategories();
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { units } = useGetUnits();
  console.log(product);
  const [form, setForm] = useState({
    product_name: '',
    product_name_localized: '',
    sku: '',
    category_id: '',
    business_unit_id: '',
    product_unit: '',
    product_volume: '',
    expires_at: '',
    unit_price: '',
    quantity: '',
    min_quantity: '',
    max_quantity: '',
    location_id: '',
    ingredients: [],
    use_for: [],
    target_issues: [],
    usage: '',
    pictograms: '',
    is_hazardous: '',
    storage_precautions: [],
    disposal_instructions: []
  });

  useEffect(() => {
    if (product) {
      setForm({
        ...product,
        product_volume: product.product_volume ?? '', // <- normalize
        min_quantity: product.min_quantity ?? '',
        max_quantity: product.max_quantity ?? '',
        unit_price: product.unit_price ?? '',
        ingredients: product.ingredients?.split(',') || [],
        use_for: product.use_for?.split(',') || [],
        target_issues: product.target_issues?.split(',') || [],
        disposal_instructions: product.disposal_instructions?.split(',') || [],
        storage_precautions: product.storage_precautions?.split(',') || [],
        pictograms: (() => {
          const validIds = pictogramOptions.map((p) => p.id);
          const raw = Array.isArray(product.pictograms) ? product.pictograms : String(product.pictograms || '').split(',');

          return raw.filter((id) => validIds.includes(id)).join(',');
        })()
      });
    }
  }, [product]);

  const handleChange = (field) => (e) => {
    let value = e.target.value;
    if (e.target.type === 'number') {
      value = value === '' ? '' : Number(value);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handleChangePictogram = (field) => (eventOrValue) => {
    let value;

    // Case 1: If it's a standard input or TextField
    if (eventOrValue?.target) {
      if ('checked' in eventOrValue.target) {
        // Switch or checkbox
        value = eventOrValue.target.checked;
      } else {
        // TextField, number input, etc.
        value = eventOrValue.target.value ?? '';
      }
    }
    // Case 2: Direct value passed (like Autocomplete or custom components)
    else {
      value = eventOrValue ?? '';
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field) => (event, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      product_volume: Number(form.product_volume),
      company_id: Number(user?.company_id),
      product_id: product?.product_id,
      ingredients: form.ingredients.join(','),
      use_for: form.use_for.join(','),
      target_issues: form.target_issues.join(','),
      disposal_instructions: form.disposal_instructions.join(','),
      storage_precautions: form.storage_precautions.join(',')
    };

    try {
      const res = await updateProduct(Number(user?.company_id), payload);

      if (res.success) {
        toast.success(res.message);
        closeModal();

        actionDone((prev) => !prev);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message);
    }
  };
  const TooltipStyle = {
    tooltip: {
      sx: {
        bgcolor: '#77CA2A',
        color: 'white',
        fontSize: '12.5px'
      }
    }
  };
  const inputStyle = {
    '& .MuiInputBase-root': {
      minHeight: 33,
      // paddingY: '4px',
      alignItems: 'flex-start',
      flexWrap: 'wrap'
    }
  };

  const requiredInputStyle = {
    '& .MuiOutlinedInput-root': {
      paddingLeft: '8px',
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
    },
    ...inputStyle
  };

  return (
    <>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent sx={{ p: 2.5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <InputLabel>Product Name</InputLabel>
            <TextField fullWidth value={form.product_name} onChange={handleChange('product_name')} sx={requiredInputStyle} />

            <InputLabel sx={{ mt: 2 }}>Product Name Localized</InputLabel>
            <TextField
              fullWidth
              value={form.product_name_localized}
              onChange={handleChange('product_name_localized')}
              // sx={requiredInputStyle}
            />

            {/* <InputLabel sx={{ mt: 2 }}>SKU</InputLabel>
            <TextField disabled fullWidth value={form.sku} onChange={handleChange('sku')} sx={requiredInputStyle} /> */}
            <InputLabel sx={{ mt: 2 }}>SKU</InputLabel>
            <SkuInput companyId={user?.company_id} value={form.sku} handleChange={handleChange} style={TooltipStyle} isEdit={true} />

            <InputLabel sx={{ mt: 2 }}>Product Volume</InputLabel>
            <TextField type="number" fullWidth value={form.product_volume} onChange={handleChange('product_volume')} sx={inputStyle} />

            {/* <InputLabel sx={{ mt: 2 }}>Unit Price (ETB)</InputLabel>
            <TextField type="number" fullWidth value={form.unit_price} onChange={handleChange('unit_price')} sx={requiredInputStyle} /> */}

            <InputLabel sx={{ mt: 2 }}>Category</InputLabel>
            <Autocomplete
              options={productCategories || []}
              getOptionLabel={(opt) => opt.category_name || ''}
              value={productCategories.find((cat) => String(cat.category_id) === String(form.category_id)) || null}
              onChange={(e, val) => setForm({ ...form, category_id: val?.category_id || '' })}
              renderInput={(params) => <TextField {...params} fullWidth />}
              sx={requiredInputStyle}
            />

            <InputLabel sx={{ mt: 2 }}>Unit</InputLabel>
            <Autocomplete
              options={units || []}
              getOptionLabel={(opt) => opt.label || ''}
              value={units.find((u) => u.label === form.product_unit) || null}
              onChange={(e, val) => setForm({ ...form, product_unit: val?.label || '' })}
              renderInput={(params) => <TextField {...params} fullWidth />}
              sx={requiredInputStyle}
            />

            <InputLabel sx={{ mt: 2 }}>Business Unit</InputLabel>
            <Autocomplete
              options={BusinessUnits || []}
              getOptionLabel={(opt) => opt.unit_name || ''}
              value={BusinessUnits.find((b) => b.business_unit_id === form.business_unit_id) || null}
              onChange={(e, val) => setForm({ ...form, business_unit_id: val?.business_unit_id || '' })}
              renderInput={(params) => <TextField {...params} fullWidth />}
              sx={requiredInputStyle}
            />

            {/* <InputLabel sx={{ mt: 2 }}>Location</InputLabel>
            <Autocomplete
              options={(locations || []).filter((l) => l.location_type !== 'branch')}
              getOptionLabel={(opt) => `${opt.location_name} (${opt.location_type})`}
              value={locations.find((l) => l.location_id === form.location_id) || null}
              onChange={(e, val) => setForm({ ...form, location_id: val?.location_id || '' })}
              renderInput={(params) => <TextField {...params} fullWidth />}
              sx={requiredInputStyle}
            /> */}
          </Grid>

          <Grid item xs={12} sm={6}>
            {/* <InputLabel>Quantity</InputLabel>
            <TextField type="number" fullWidth value={form.quantity} onChange={handleChange('quantity')} sx={requiredInputStyle} /> */}

            {/* <InputLabel sx={{ mt: 2 }}>Expires At</InputLabel>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={form.expires_at ? new Date(form.expires_at) : null}
                onChange={(newDate) => handleChange('expires_at')({ target: { value: newDate ? format(newDate, 'yyyy-MM-dd') : '' } })}
                format="yyyy-MM-dd"
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider> */}

            {/* <InputLabel sx={{ mt: 2 }}>Min Quantity</InputLabel>
            <TextField type="number" fullWidth value={form.min_quantity} onChange={handleChange('min_quantity')} sx={requiredInputStyle} />

            <InputLabel sx={{ mt: 2 }}>Max Quantity</InputLabel>
            <TextField type="number" fullWidth value={form.max_quantity} onChange={handleChange('max_quantity')} sx={inputStyle} /> */}

            {['ingredients', 'use_for', 'target_issues', 'disposal_instructions', 'storage_precautions'].map((field) => (
              <Box key={field} sx={{ mt: 2, mb: 2 }}>
                <InputLabel>{field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}</InputLabel>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={form[field]}
                  onChange={handleArrayChange(field)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => <Chip key={index} label={option} {...getTagProps({ index })} color="primary" />)
                  }
                  renderInput={(params) => <TextField {...params} placeholder="Type and press enter" fullWidth />}
                  sx={inputStyle}
                />
              </Box>
            ))}

            <Grid item xs={12} md={6} mb={1}>
              <InputLabel>Is Hazardous</InputLabel>
              <FormControlLabel
                control={<Switch checked={!!form.is_hazardous} onChange={handleChange('is_hazardous')} color="primary" />}
                label={form.is_hazardous ? 'Hazardous' : 'Not Hazardous'}
                sx={{ ml: 1 }}
              />
            </Grid>
            <PictogramSelector
              value={form.pictograms}
              onChange={handleChangePictogram('pictograms')}
              options={pictogramOptions}
              tooltipStyle={TooltipStyle}
            />
            <InputLabel sx={{ mt: 2 }}>Usage</InputLabel>
            <TextField fullWidth value={form.usage} onChange={handleChange('usage')} />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button color="error" onClick={closeModal}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          Update Product
        </Button>
      </DialogActions>
    </>
  );
}

EditProductForm.propTypes = {
  product: PropTypes.object,
  closeModal: PropTypes.func
};
