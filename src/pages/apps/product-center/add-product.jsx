import React, { useState } from 'react';
import {
  Grid,
  TextField,
  InputLabel,
  Button,
  Stack,
  Typography,
  Autocomplete,
  Chip,
  Tooltip,
  FormControlLabel,
  Switch,
  Box,
  FormHelperText
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { Information } from 'iconsax-react';

// Formik/Yup
import { Formik, Form, Field, getIn } from 'formik';
import * as Yup from 'yup';

import MainCard from 'components/MainCard';
import SkuInput from 'sections/apps/product-center/products/SkuInput';
import PictogramSelector from 'sections/apps/product-center/products/PictogramSelector';

import { useGetProductCategories } from 'api/product_category';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import { useGetUnits } from 'api/unit';
import useAuth from 'hooks/useAuth';
import toast from 'react-hot-toast';

// Pictogram images
import GHS01 from '../../../assets/pictograms/GHS01.png';
import { createProduct, useGetProductSuggestions } from 'api/products';
import GHS02 from '../../../assets/pictograms/GHS02.png';
import GHS03 from '../../../assets/pictograms/GHS03.png';
import GHS04 from '../../../assets/pictograms/GHS04.png';
import GHS05 from '../../../assets/pictograms/GHS05.png';
import GHS06 from '../../../assets/pictograms/GHS06.png';
import GHS07 from '../../../assets/pictograms/GHS07.png';
import GHS08 from '../../../assets/pictograms/GHS08.png';
import GHS09 from '../../../assets/pictograms/GHS09.png';
import { requiredInputStyle } from 'components/inputs/requiredInputStyle';
import { renderProductOption } from 'components/inputs/renderProductOption';

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

const storagePrecautionOptions = [
  'Store in a cool, dry place.',
  'Store in a well-ventilated area.',
  'Keep out of reach of children.',
  'Keep container tightly closed.',
  'Store locked up.',
  'Store away from food, drink, and animal feed.',
  'Keep only in original container.',
  'Protect from sunlight.',
  'Do not store above [specific temperature].',
  'Do not contaminate water, food, or feed by storage or disposal.',
  'Other (please specify):'
];

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
    minHeight: 48,
    paddingY: '6px',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  '& .MuiChip-root': { margin: '2px' }
};

// --- Yup Validation Schema ---

const AddProductSchema = Yup.object().shape({
  product_name: Yup.string().required('Product name is required.').min(2, 'Product name must be at least 2 characters.'),
  product_unit: Yup.string().required('Unit is required.'),
  category_id: Yup.string().required('Category is required.'),
  business_unit_id: Yup.string().required('Business unit is required.'),
  location_id: Yup.string().required('Location is required.'),
  unit_price: Yup.number()
    .typeError('Sailing price must be a number.')
    .required('Sailing price is required.')
    .min(0, 'Sailing price must be zero or positive.'),
  purchase_price: Yup.number()
    .typeError('Purchase price must be a number.')
    .required('Purchase price is required.')
    .min(0, 'Purchase price must be zero or positive.'),
  quantity: Yup.number()
    .typeError('Quantity must be a number.')
    .required('Quantity is required.')
    .min(0, 'Quantity must be zero or positive.'),
  min_quantity: Yup.number()
    .typeError('Minimum quantity must be a number.')
    .required('Minimum quantity is required.')
    .min(0, 'Minimum quantity must be zero or positive.')
});

const initialValues = {
  product_name: '',
  product_name_localized: '',
  sku: '',
  product_volume: '',
  product_unit: '',
  category_id: '',
  business_unit_id: '',
  location_id: '',
  is_active: true,
  unit_price: '',
  purchase_price: '',
  quantity: '',
  min_quantity: 5,
  max_quantity: '',
  expires_at: '',
  manufacture_date: '',
  is_hazardous: false,
  pictograms: '',
  ingredients: [],
  use_for: [],
  target_issues: [],
  usage: '',
  storage_precautions: [],
  disposal_instructions: []
};

export default function AddNewProductSectioned() {
  const { productCategories } = useGetProductCategories();
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { units } = useGetUnits();
  const { user } = useAuth();

  const [customPrecaution, setCustomPrecaution] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  const [productAutoFilled, setProductAutoFilled] = useState(false);
  const { suggestions, loading } = useGetProductSuggestions({
    search: productSearch
  });

  console.log(suggestions);
  const handleCancel = () => window.history.back();

  const getError = (name, touched, errors) => getIn(touched, name) && getIn(errors, name);

  return (
    <MainCard>
      <Typography sx={{ mb: 2, color: 'text.secondary' }}>
        Fields with a{' '}
        <Box
          component="span"
          sx={{ display: 'inline-block', width: 12, height: 12, bgcolor: '#76CB2B', borderRadius: '50%', mr: 0.5, verticalAlign: 'middle' }}
        />{' '}
        are <strong style={{ color: 'orange' }}>required</strong>. All other fields are <strong style={{ color: 'orange' }}>crucial</strong>{' '}
        for maximizing platform benefits—please don’t skip them!
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={AddProductSchema}
        enableReinitialize
        onSubmit={async (values, { setSubmitting, setErrors, resetForm }) => {
          let formattedPayload;
          if (productAutoFilled) {
            formattedPayload = {
              is_selected: true,
              product_id: selectedProduct.product_id,
              business_unit_id: values.business_unit_id,
              location_id: values.location_id,
              quantity: values.quantity,
              unit_price: values.unit_price,
              purchase_price: values.purchase_price,
              min_quantity: values.min_quantity,
              max_quantity: values.max_quantity,
              expires_at: values.expires_at,
              manufacture_date: values.manufacture_date,
              company_id: user?.company_id
            };
          } else {
            formattedPayload = {
              ...values,
              company_id: user?.company_id,
              ingredients: values.ingredients.join(','),
              use_for: values.use_for.join(','),
              target_issues: values.target_issues.join(','),
              storage_precautions: Array.isArray(values.storage_precautions)
                ? values.storage_precautions.join(',')
                : values.storage_precautions,
              disposal_instructions: Array.isArray(values.disposal_instructions)
                ? values.disposal_instructions.join(',')
                : values.disposal_instructions,
              is_selected: productAutoFilled
            };
          }

          try {
            setSubmitting(true);
            const createResult = await createProduct(user?.company_id, formattedPayload);
            if (createResult.success) {
              toast.success(createResult.message);
              setTimeout(() => {
                handleCancel();
              }, 2000);
            } else {
              toast.error(createResult.message || 'Failed to create product');
            }
          } catch (err) {
            toast.error((err && err.message) || 'Error!');
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, setFieldValue, errors, touched, handleChange, handleBlur, isSubmitting, handleSubmit }) => (
          <Form onSubmit={handleSubmit} autoComplete="off">
            {/* SECTION: General Info */}

            {/* <MainCard title="Product Catalog Search" sx={{ mb: 2 }}>
              <Autocomplete
                freeSolo
                loading={loading}
                value={values.product_name || ''}
                inputValue={values.product_name || ''}
                options={Array.isArray(suggestions) ? suggestions : []}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.product_name || '')}
                renderOption={renderProductOption}
                onInputChange={(e, val) => {
                  setProductAutoFilled(false);
                  setProductSearch(val);
                }}
                onChange={(e, newValue) => {
                  let selected = null;
                  if (typeof newValue === 'string') {
                    selected = suggestions?.find((s) => s.product_name === newValue);
                  } else if (typeof newValue === 'object') {
                    selected = newValue;
                  }
                  if (!selected) {
                    setProductAutoFilled(false);
                    setSelectedProduct(null);

                    setFieldValue('product_name', '');
                    setFieldValue('product_name_localized', '');
                    setFieldValue('product_unit', '');
                    setFieldValue('category_id', '');
                    setFieldValue('sku', '');
                    setFieldValue('product_volume', '');
                    setFieldValue('business_unit_id', '');
                    setFieldValue('location_id', '');

                    setFieldValue('ingredients', []);
                    setFieldValue('use_for', []);
                    setFieldValue('target_issues', []);
                    setFieldValue('usage', '');

                    setFieldValue('is_hazardous', false);
                    setFieldValue('pictograms', '');

                    setFieldValue('storage_precautions', []);
                    setFieldValue('disposal_instructions', []);
                    return;
                  }
                  setProductAutoFilled(true);
                  setSelectedProduct(selected);

                  setFieldValue('product_name', selected.product_name);
                  setFieldValue('product_name_localized', selected.product_name_localized);
                  setFieldValue('product_unit', selected.product_unit || '');
                  setFieldValue('category_id', selected.category_id || '');
                  setFieldValue('sku', selected.sku || '');
                  setFieldValue('product_volume', selected.product_volume || '');
                  setFieldValue('business_unit_id', selected.business_unit_id || '');
                  setFieldValue('location_id', selected.location_id || '');

                  setFieldValue('ingredients', selected.ingredients ? selected.ingredients.split(',') : []);
                  setFieldValue('use_for', selected.use_for ? selected.use_for.split(',') : []);
                  setFieldValue('target_issues', selected.target_issues ? selected.target_issues.split(',') : []);
                  setFieldValue('usage', selected.usage || '');

                  setFieldValue('is_hazardous', !!selected.is_hazardous);
                  setFieldValue('pictograms', selected.pictograms || '');

                  setFieldValue('storage_precautions', selected.storage_precautions ? selected.storage_precautions.split(',') : []);
                  setFieldValue('disposal_instructions', selected.disposal_instructions ? selected.disposal_instructions.split(',') : []);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search or select product"
                    placeholder="Type to search…"
                    sx={{ minWidth: 270 }}
                    error={!!getError('product_name', touched, errors)}
                    helperText={getError('product_name', touched, errors)}
                    onBlur={handleBlur}
                  />
                )}
              />
              {productAutoFilled && (
                <FormHelperText sx={{ color: 'green' }}>Product selected! Catalog details below are read-only.</FormHelperText>
              )}
            </MainCard> */}

            <MainCard title="General Info" sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <InputLabel>Product Name</InputLabel>
                  <TextField
                    fullWidth
                    name="product_name"
                    placeholder="Enter product name"
                    value={values.product_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={requiredInputStyle}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Product Name Localized</InputLabel>
                    <Tooltip title="Enter product name in local language" componentsProps={TooltipStyle} arrow>
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>
                  <TextField
                    fullWidth
                    name="product_name_localized"
                    placeholder="Enter local language name"
                    value={values.product_name_localized}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
                {!productAutoFilled && (
                  <Grid item xs={12} md={6}>
                    <SkuInput
                      companyId={user?.company_id}
                      value={values.sku}
                      handleChange={(field) => (e) => setFieldValue('sku', e.target.value)}
                      style={TooltipStyle}
                      error={!!getError('sku', touched, errors)}
                      helperText={getError('sku', touched, errors)}
                      isEdit={productAutoFilled}
                    />
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Product Volume</InputLabel>
                    <Tooltip
                      title="The volume or size of the product (e.g., in liters or kilograms). Required for packaging, stock tracking, and sales calculations."
                      componentsProps={TooltipStyle}
                      arrow
                    >
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>
                  <TextField
                    type="number"
                    fullWidth
                    name="product_volume"
                    placeholder="Enter product volume"
                    value={values.product_volume}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Category</InputLabel>
                    <Tooltip
                      title="Select the product category (e.g., Insecticide, Herbicide, Antibiotic). Categorization helps with filtering, reporting, and stock grouping."
                      componentsProps={TooltipStyle}
                      arrow
                    >
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>{' '}
                  <Autocomplete
                    options={productCategories || []}
                    getOptionLabel={(option) => option.category_name || ''}
                    value={productCategories?.find((cat) => cat.category_id === values.category_id) || null}
                    onChange={(e, newValue) => setFieldValue('category_id', newValue?.category_id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="category_id"
                        placeholder="Select category"
                        fullWidth
                        sx={requiredInputStyle}
                        error={!!getError('category_id', touched, errors)}
                        helperText={getError('category_id', touched, errors)}
                        onBlur={handleBlur}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Unit</InputLabel>
                    <Tooltip title="Specify the unit (kg, L, etc)" componentsProps={TooltipStyle} arrow>
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>
                  <Autocomplete
                    options={units || []}
                    getOptionLabel={(option) => option.label || ''}
                    value={units?.find((unit) => unit.label === values.product_unit) || null}
                    onChange={(e, newValue) => setFieldValue('product_unit', newValue?.label || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="product_unit"
                        placeholder="Select unit"
                        fullWidth
                        sx={requiredInputStyle}
                        error={!!getError('product_unit', touched, errors)}
                        helperText={getError('product_unit', touched, errors)}
                        onBlur={handleBlur}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Business Unit</InputLabel>
                    <Tooltip
                      title="Select the business unit responsible for this product (e.g., Agrochemicals, Pharmaceuticals). This helps organize operations and assign responsibilities."
                      componentsProps={TooltipStyle}
                      arrow
                    >
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>
                  <Autocomplete
                    options={BusinessUnits || []}
                    getOptionLabel={(option) => option.unit_name || ''}
                    value={BusinessUnits?.find((b) => b.business_unit_id === values.business_unit_id) || null}
                    onChange={(e, newValue) => setFieldValue('business_unit_id', newValue?.business_unit_id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="business_unit_id"
                        placeholder="Select business unit"
                        fullWidth
                        sx={requiredInputStyle}
                        error={!!getError('business_unit_id', touched, errors)}
                        helperText={getError('business_unit_id', touched, errors)}
                        onBlur={handleBlur}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Location</InputLabel>
                    <Tooltip
                      title="Select the location where this product will be stored or managed (e.g., warehouse, sales room). This helps with inventory tracking."
                      componentsProps={TooltipStyle}
                      arrow
                    >
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>
                  <Autocomplete
                    options={(locations || []).filter((loc) => loc.location_type !== 'branch')}
                    getOptionLabel={(option) => `${option.location_name || ''} (${option.location_type || ''})`}
                    value={locations?.find((l) => l.location_id === values.location_id) || null}
                    onChange={(e, newValue) => setFieldValue('location_id', newValue?.location_id || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="location_id"
                        placeholder="Select location"
                        fullWidth
                        sx={requiredInputStyle}
                        error={!!getError('location_id', touched, errors)}
                        helperText={getError('location_id', touched, errors)}
                        onBlur={handleBlur}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </MainCard>
            {/* SECTION: Pricing & Inventory */}
            <MainCard title="Pricing & Inventory" sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <InputLabel sx={{ mb: 1 }}>Sailing Price (ETB)</InputLabel>
                  <TextField
                    name="unit_price"
                    type="number"
                    placeholder="Selling price"
                    fullWidth
                    value={values.unit_price}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={requiredInputStyle}
                    error={!!getError('unit_price', touched, errors)}
                    helperText={getError('unit_price', touched, errors)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <InputLabel sx={{ mb: 1 }}>Purchase Price (ETB)</InputLabel>
                  <TextField
                    name="purchase_price"
                    type="number"
                    placeholder="Purchase price"
                    fullWidth
                    value={values.purchase_price}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={requiredInputStyle}
                    error={!!getError('purchase_price', touched, errors)}
                    helperText={getError('purchase_price', touched, errors)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <InputLabel sx={{ mb: 1 }}>Quantity</InputLabel>
                  <TextField
                    name="quantity"
                    type="number"
                    placeholder="Quantity"
                    fullWidth
                    value={values.quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={requiredInputStyle}
                    error={!!getError('quantity', touched, errors)}
                    helperText={getError('quantity', touched, errors)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Min Quantity</InputLabel>
                    <Tooltip title="Minimum stock level to trigger restocking alerts" componentsProps={TooltipStyle} arrow>
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>{' '}
                  <TextField
                    name="min_quantity"
                    type="number"
                    placeholder="Min quantity"
                    fullWidth
                    value={values.min_quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={requiredInputStyle}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Max Quantity</InputLabel>
                    <Tooltip title="Maximum inventory quantity to avoid overstocking" componentsProps={TooltipStyle} arrow>
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>{' '}
                  <TextField
                    name="max_quantity"
                    type="number"
                    placeholder="Max quantity"
                    fullWidth
                    value={values.max_quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
              </Grid>
            </MainCard>
            {/* SECTION: Batch & Expiry */}
            <MainCard
              sx={{
                mb: 3
              }}
              title="Batch & Expiry"
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Stack spacing={1}>
                      <InputLabel>Manufacture Date</InputLabel>
                      <DatePicker
                        value={values.manufacture_date ? new Date(values.manufacture_date) : null}
                        onChange={(nv) => setFieldValue('manufacture_date', nv ? format(nv, 'yyyy-MM-dd') : '')}
                        format="yyyy-MM-dd"
                        slotProps={{
                          textField: { InputLabelProps: { shrink: true } }
                        }}
                        sx={{ '& .MuiInputBase-root': { height: 48 } }}
                      />
                      <FormHelperText error={!!(touched.manufacture_date && errors.manufacture_date)}>
                        {touched.manufacture_date && typeof errors.manufacture_date === 'string' ? errors.manufacture_date : ''}
                      </FormHelperText>
                    </Stack>
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Stack spacing={1}>
                      <InputLabel>Expiry Date</InputLabel>
                      <DatePicker
                        value={values.expires_at ? new Date(values.expires_at) : null}
                        onChange={(nv) => setFieldValue('expires_at', nv ? format(nv, 'yyyy-MM-dd') : '')}
                        format="yyyy-MM-dd"
                        slotProps={{
                          textField: { InputLabelProps: { shrink: true } }
                        }}
                        sx={{ '& .MuiInputBase-root': { height: 48 } }}
                      />
                    </Stack>
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </MainCard>
            {/* SECTION: Product Attributes & Usage */}

            <MainCard
              sx={{
                mb: 3,
                pointerEvents: productAutoFilled ? 'none' : 'auto',
                opacity: productAutoFilled ? 0.6 : 1
              }}
              title="Product Attributes & Usage"
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <InputLabel sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    Ingredients
                    <Tooltip
                      title="Enter the product's active ingredients. Helps the AI engine provide accurate recommendations."
                      componentsProps={TooltipStyle}
                      arrow
                    >
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </InputLabel>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={values.ingredients}
                    onChange={(e, val) => setFieldValue('ingredients', val)}
                    sx={inputStyle}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => <Chip key={index} label={option} {...getTagProps({ index })} color="primary" />)
                    }
                    renderInput={(params) => <TextField {...params} placeholder="Type and press enter" fullWidth multiline />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Use For</InputLabel>
                    <Tooltip
                      title="Specify what this product is used for (e.g., wheat, onion, dog, cow). Helps AI suggest relevant matches and organize data properly."
                      componentsProps={TooltipStyle}
                      arrow
                    >
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={values.use_for}
                    onChange={(e, val) => setFieldValue('use_for', val)}
                    sx={inputStyle}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => <Chip key={index} label={option} {...getTagProps({ index })} color="primary" />)
                    }
                    renderInput={(params) => <TextField {...params} placeholder="Type and press enter" fullWidth />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Target Issues</InputLabel>
                    <Tooltip
                      title="Specify the specific issues or pests this product targets. Helps fine-tune AI-driven suggestions."
                      componentsProps={TooltipStyle}
                      arrow
                    >
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={values.target_issues}
                    onChange={(e, val) => setFieldValue('target_issues', val)}
                    sx={inputStyle}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => <Chip key={index} label={option} {...getTagProps({ index })} color="primary" />)
                    }
                    renderInput={(params) => <TextField {...params} placeholder="Type and press enter" fullWidth />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Usage</InputLabel>
                    <Tooltip
                      title="Instructional message to be sent via SMS to farmers, explaining how to apply the product."
                      componentsProps={TooltipStyle}
                      arrow
                    >
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>
                  <TextField
                    name="usage"
                    placeholder="Enter product usage"
                    fullWidth
                    value={values.usage}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
              </Grid>
            </MainCard>
            {/* SECTION: Safety & Compliance */}
            <MainCard
              sx={{
                mb: 3,
                pointerEvents: productAutoFilled ? 'none' : 'auto',
                opacity: productAutoFilled ? 0.6 : 1
              }}
              title="Safety & Compliance"
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <InputLabel>Is Hazardous</InputLabel>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!!values.is_hazardous}
                        onChange={(e) => setFieldValue('is_hazardous', e.target.checked)}
                        color="primary"
                      />
                    }
                    label={values.is_hazardous ? 'Hazardous' : 'Not Hazardous'}
                    sx={{ ml: 1 }}
                  />
                  <Tooltip title="Mark as hazardous if special safety needed." componentsProps={TooltipStyle} arrow>
                    <Information size={15} color="#4CAF50" variant="Outline" />
                  </Tooltip>
                </Grid>
                <PictogramSelector
                  value={values.pictograms}
                  onChange={(val) => setFieldValue('pictograms', val)}
                  options={pictogramOptions}
                  tooltipStyle={TooltipStyle}
                />
              </Grid>
            </MainCard>
            {/* SECTION: Storage & Disposal */}
            <MainCard
              sx={{
                mb: 3,
                pointerEvents: productAutoFilled ? 'none' : 'auto',
                opacity: productAutoFilled ? 0.6 : 1
              }}
              title="Storage & Disposal"
            >
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Disposal Instructions</InputLabel>
                    <Tooltip
                      title="Instructional message to be sent via SMS to farmers, explaining how to apply the product."
                      componentsProps={TooltipStyle}
                      arrow
                    >
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={values.disposal_instructions}
                    onChange={(e, val) => setFieldValue('disposal_instructions', val)}
                    sx={inputStyle}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => <Chip key={index} label={option} {...getTagProps({ index })} color="primary" />)
                    }
                    renderInput={(params) => <TextField {...params} placeholder="Type and press enter" fullWidth />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    <InputLabel>Storage Precautions</InputLabel>
                    <Tooltip
                      title="Select storage guidelines to prevent product spoilage, fire, or chemical reaction."
                      componentsProps={TooltipStyle}
                      arrow
                    >
                      <Information size={15} color="#4CAF50" variant="Outline" />
                    </Tooltip>
                  </Box>
                  <Autocomplete
                    multiple
                    options={storagePrecautionOptions}
                    value={values.storage_precautions}
                    onChange={(e, val) => {
                      let updated = val.filter((v) => v !== 'Other (please specify):');
                      if (val.includes('Other (please specify):') && customPrecaution) {
                        updated = [...updated, customPrecaution];
                      }
                      setFieldValue('storage_precautions', updated);
                    }}
                    onBlur={() => {
                      if ((values.storage_precautions || []).includes('Other (please specify):') && customPrecaution) {
                        const vals = values.storage_precautions.filter((v) => v !== 'Other (please specify):');
                        setFieldValue('storage_precautions', [...vals, customPrecaution]);
                      }
                    }}
                    freeSolo
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => <Chip key={index} label={option} {...getTagProps({ index })} color="primary" />)
                    }
                    renderInput={(params) => <TextField {...params} placeholder="Select or enter custom" fullWidth />}
                    sx={inputStyle}
                  />
                  {(values.storage_precautions || []).includes('Other (please specify):') && (
                    <TextField
                      placeholder="Please specify other precautions"
                      value={customPrecaution}
                      onChange={(e) => setCustomPrecaution(e.target.value)}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Grid>
              </Grid>
            </MainCard>
            {/* ACTIONS */}
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 2 }}>
              <Button variant="outlined" color="secondary" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" sx={{ textTransform: 'none' }} disabled={isSubmitting}>
                Add New Product
              </Button>
            </Stack>
          </Form>
        )}
      </Formik>
    </MainCard>
  );
}
