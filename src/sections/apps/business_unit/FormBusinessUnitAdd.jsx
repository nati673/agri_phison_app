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

import { openSnackbar } from 'api/snackbar';
import { createBusinessUnit, updateBusinessUnit } from 'api/business_unit';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';
import { useGetLocation } from 'api/location';

// icons
import { Trash } from 'iconsax-react';
import useAuth from 'hooks/useAuth';
import toast from 'react-hot-toast';

// CONSTANT
const getInitialValues = (BusinessUnit) => {
  const defaultValues = {
    unit_name: '',
    unit_code: '',
    description: '',
    location_ids: [],
    is_active: true
  };

  return BusinessUnit ? _.merge({}, defaultValues, BusinessUnit) : defaultValues;
};

export default function FormBusinessUnitAdd({ BusinessUnit, closeModal }) {
  const theme = useTheme();
  const { locations } = useGetLocation();
  const { user } = useAuth();
  const company_id = user?.company_id;
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState(getImageUrl(`avatar-${BusinessUnit?.avatar || 1}.png`, ImagePath.USERS));

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const BusinessUnitSchema = Yup.object().shape({
    unit_name: Yup.string().max(255).required('Unit name is required'),
    unit_code: Yup.string().max(100),
    description: Yup.string().max(1000),
    location_ids: Yup.array().min(1, 'At least one location is required'),
    is_active: Yup.boolean()
  });

  const [openAlert, setOpenAlert] = useState(false);
  const handleAlertClose = () => {
    setOpenAlert(false);
    closeModal();
  };

  const formik = useFormik({
    initialValues: getInitialValues(BusinessUnit),
    validationSchema: BusinessUnitSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (BusinessUnit) {
          const updateResult = await updateBusinessUnit(BusinessUnit.business_unit_id, { ...values, company_id: company_id });

          if (updateResult.success) {
            toast.success(updateResult.message);

            setTimeout(() => {
              closeModal();
              setSubmitting(false);
            }, 2000);
          }
        } else {
          const createResult = await createBusinessUnit({
            ...values,
            company_id
          });

          if (createResult.success) {
            toast.success(createResult.message);

            setTimeout(() => {
              closeModal();
              setSubmitting(false);
            }, 2000);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message);
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
          <DialogTitle>{BusinessUnit ? 'Edit Business Unit' : 'New Business Unit'}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={12}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="unit_name">Unit Name</InputLabel>
                      <TextField
                        fullWidth
                        id="unit_name"
                        placeholder="Enter Unit Name"
                        {...getFieldProps('unit_name')}
                        error={Boolean(touched.unit_name && errors.unit_name)}
                        helperText={touched.unit_name && errors.unit_name}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="unit_code">Unit Code (optional)</InputLabel>
                      <TextField
                        fullWidth
                        id="unit_code"
                        placeholder="Enter Unit Code"
                        {...getFieldProps('unit_code')}
                        error={Boolean(touched.unit_code && errors.unit_code)}
                        helperText={touched.unit_code && errors.unit_code}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="location_ids">Locations</InputLabel>
                      <Autocomplete
                        multiple
                        id="location_ids"
                        options={locations || []}
                        getOptionLabel={(option) =>
                          option?.location_name
                            ? `${option.location_name} (${option.location_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())})`
                            : ''
                        }
                        value={locations?.filter((loc) => values.location_ids.includes(loc.location_id)) || []}
                        onChange={(e, selectedOptions) => {
                          const ids = selectedOptions.map((opt) => opt.location_id);
                          setFieldValue('location_ids', ids);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Select Locations"
                            error={Boolean(touched.location_ids && errors.location_ids)}
                            helperText={touched.location_ids && errors.location_ids}
                          />
                        )}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="unit_code">Description (Optional)</InputLabel>
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
                      <InputLabel htmlFor="is_active">Unit Status</InputLabel>
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
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                {BusinessUnit && (
                  <Tooltip title="Delete BusinessUnit" placement="top">
                    <IconButton onClick={() => setOpenAlert(true)} size="large" color="error">
                      <Trash variant="Bold" />
                    </IconButton>
                  </Tooltip>
                )}
              </Grid>
              <Grid item>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button color="error" onClick={closeModal}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="contained" disabled={isSubmitting}>
                    {BusinessUnit ? 'Edit' : 'Add'}
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

FormBusinessUnitAdd.propTypes = {
  BusinessUnit: PropTypes.any,
  closeModal: PropTypes.func
};
