import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material ui
import {
  Box,
  Grid,
  Stack,
  Button,
  Checkbox,
  Divider,
  TextField,
  InputLabel,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  FormControlLabel,
  Autocomplete,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// date picker
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { createProductCategories, updateProductCategories } from 'api/product_category';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// icons
import { Trash } from 'iconsax-react';
import useAuth from 'hooks/useAuth';
import toast from 'react-hot-toast';
import { useGetBusinessUnit } from 'api/business_unit';

// CONSTANT
const getInitialValues = (Category) => {
  const defaultValues = {
    category_name: '',
    description: '',
    business_unit_id: '',
    is_active: true
  };

  return Category ? _.merge({}, defaultValues, Category) : defaultValues;
};

export default function FormCategoryAdd({ Category, closeModal }) {
  const theme = useTheme();
  const { BusinessUnits } = useGetBusinessUnit();
  const { user } = useAuth();
  const company_id = user?.company_id;
  const [loading, setLoading] = useState(true);
  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(false);
    closeModal();
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  const CategorySchema = Yup.object().shape({
    category_name: Yup.string().max(255).required('Category name is required'),
    description: Yup.string().max(1000),
    business_unit_id: Yup.string().required('Business Unit is required'),
    is_active: Yup.boolean()
  });

  const formik = useFormik({
    initialValues: getInitialValues(Category),
    validationSchema: CategorySchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (Category) {
          const updateResult = await updateProductCategories(Category.category_id, {
            ...values,
            company_id
          });
          if (updateResult.success) {
            toast.success(updateResult.message);
            setTimeout(() => {
              closeModal();
              setSubmitting(false);
            }, 1500);
          }
        } else {
          const createResult = await createProductCategories({
            ...values,
            company_id
          });
          if (createResult.success) {
            toast.success(createResult.message);
            setTimeout(() => {
              closeModal();
              setSubmitting(false);
            }, 1500);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'An error occurred');
      }
    }
  });

  const { values, errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  if (loading) {
    return (
      <Box sx={{ p: 5 }}>
        <Stack direction="row" justifyContent="center">
          <CircularWithPath />
        </Stack>
      </Box>
    );
  }

  return (
    <FormikProvider value={formik}>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>{Category ? 'Edit Product Category' : 'New Product Category'}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="category_name">Category Name</InputLabel>
                  <TextField
                    fullWidth
                    id="category_name"
                    placeholder="Enter Category Name"
                    {...getFieldProps('category_name')}
                    error={Boolean(touched.category_name && errors.category_name)}
                    helperText={touched.category_name && errors.category_name}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="business_unit_id">Business Unit</InputLabel>
                  <Autocomplete
                    id="business_unit_id"
                    options={BusinessUnits || []}
                    getOptionLabel={(option) => option.unit_name || ''}
                    value={BusinessUnits?.find((unit) => unit.business_unit_id === values.business_unit_id) || null}
                    onChange={(e, selectedOption) => {
                      setFieldValue('business_unit_id', selectedOption?.business_unit_id || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Business Unit"
                        error={Boolean(touched.business_unit_id && errors.business_unit_id)}
                        helperText={touched.business_unit_id && errors.business_unit_id}
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="description">Description</InputLabel>
                  <TextField
                    fullWidth
                    id="description"
                    placeholder="Write Description"
                    {...getFieldProps('description')}
                    error={Boolean(touched.description && errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="is_active">Category Status</InputLabel>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={values.is_active}
                        onChange={(e) => setFieldValue('is_active', e.target.checked)}
                        name="is_active"
                        color="primary"
                      />
                    }
                    label={values.is_active ? 'Active' : 'Inactive'}
                  />
                  {touched.is_active && errors.is_active && (
                    <FormHelperText error sx={{ pl: 1.75 }}>
                      {errors.is_active}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                {Category && (
                  <Tooltip title="Delete Category" placement="top">
                    <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                      <Trash variant="Bold" />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={2}>
                  <Button color="error" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {Category ? 'Update' : 'Add'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </LocalizationProvider>
    </FormikProvider>
  );
}

FormCategoryAdd.propTypes = {
  Category: PropTypes.object,
  closeModal: PropTypes.func.isRequired
};
