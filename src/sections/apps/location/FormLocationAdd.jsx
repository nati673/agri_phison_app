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
  Tooltip,
  FormControl,
  Select,
  MenuItem
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
import { createLocation, updateLocation, useGetLocation } from 'api/location';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';

// icons
import { Trash } from 'iconsax-react';
import useAuth from 'hooks/useAuth';
import toast from 'react-hot-toast';

// CONSTANT
const getInitialValues = (Location) => {
  const defaultValues = {
    location_name: '',
    location_type: '',
    address: '',
    phone_number: '',
    is_active: true,
    parent_location_id: null // NEW
  };

  return Location ? _.merge({}, defaultValues, Location) : defaultValues;
};

export default function FormLocationAdd({ Location, closeModal }) {
  const theme = useTheme();
  const { locations } = useGetLocation();
  const { user } = useAuth();
  const company_id = user?.company_id;
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState(getImageUrl(`avatar-${Location?.avatar || 1}.png`, ImagePath.USERS));

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const LocationSchema = Yup.object().shape({
    location_name: Yup.string().max(100).required('Location name is required'),
    location_type: Yup.string().oneOf(['warehouse', 'sales_room', 'branch']).required('Location type is required'),
    address: Yup.string().max(255),
    phone_number: Yup.string().max(20),
    is_active: Yup.boolean(),
    parent_location_id: Yup.number().nullable() // allow null or a number
  });

  const [openAlert, setOpenAlert] = useState(false);
  const handleAlertClose = () => {
    setOpenAlert(false);
    closeModal();
  };

  const formik = useFormik({
    initialValues: getInitialValues(Location),
    validationSchema: LocationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (Location) {
          const updateResult = await updateLocation(Location.location_id, { ...values, company_id: company_id });

          if (updateResult.success) {
            toast.success(updateResult.message);

            setTimeout(() => {
              closeModal();
              setSubmitting(false);
            }, 2000);
          }
        } else {
          const createResult = await createLocation({
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
          <DialogTitle>{Location ? 'Edit Location' : 'New Location'}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="location_name">Location Name</InputLabel>
                  <TextField
                    fullWidth
                    id="location_name"
                    placeholder="Enter Location Name"
                    {...getFieldProps('location_name')}
                    error={Boolean(touched.location_name && errors.location_name)}
                    helperText={touched.location_name && errors.location_name}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="location_type">Location Type</InputLabel>
                  <FormControl fullWidth error={Boolean(touched.location_type && errors.location_type)}>
                    <Select
                      id="location_type"
                      displayEmpty
                      {...getFieldProps('location_type')}
                      value={values.location_type}
                      onChange={(e) => setFieldValue('location_type', e.target.value)}
                    >
                      <MenuItem value="" disabled>
                        Select Location Type
                      </MenuItem>
                      <MenuItem value="warehouse">Warehouse</MenuItem>
                      <MenuItem value="sales_room">Sales Room</MenuItem>
                      <MenuItem value="branch">Branch</MenuItem>
                    </Select>
                    {touched.location_type && errors.location_type && <FormHelperText>{errors.location_type}</FormHelperText>}
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="parent_location_id">Parent Location (optional)</InputLabel>
                  <Autocomplete
                    id="parent_location_id"
                    options={locations.filter((loc) => loc.location_type === 'branch' && loc.location_id !== values.location_id)}
                    getOptionLabel={(option) => option.location_name}
                    value={locations.find((loc) => loc.location_id === values.parent_location_id) || null}
                    onChange={(event, newValue) => {
                      setFieldValue('parent_location_id', newValue ? newValue.location_id : null);
                    }}
                    renderInput={(params) => <TextField {...params} placeholder="Select Parent Location" />}
                    isOptionEqualToValue={(option, value) => option.location_id === value.location_id}
                  />
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="address">Address</InputLabel>
                  <TextField
                    fullWidth
                    id="address"
                    placeholder="Enter Address"
                    {...getFieldProps('address')}
                    error={Boolean(touched.address && errors.address)}
                    helperText={touched.address && errors.address}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="phone_number">Phone Number</InputLabel>
                  <TextField
                    fullWidth
                    id="phone_number"
                    placeholder="Enter Phone Number"
                    {...getFieldProps('phone_number')}
                    error={Boolean(touched.phone_number && errors.phone_number)}
                    helperText={touched.phone_number && errors.phone_number}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="is_active">Location Status</InputLabel>
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
                {Location && (
                  <Tooltip title="Delete Location" placement="top">
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
                    {Location ? 'Edit' : 'Add'}
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

FormLocationAdd.propTypes = {
  Location: PropTypes.any,
  closeModal: PropTypes.func
};
