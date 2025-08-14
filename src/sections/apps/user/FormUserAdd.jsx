import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material ui
import {
  Box,
  Grid,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  Typography,
  Divider,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  OutlinedInput,
  FormLabel,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import ListItemText from '@mui/material/ListItemText';

// date picker
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import _ from 'lodash';

// project imports
import AlertUserDelete from './AlertUserDelete';
import Avatar from 'components/@extended/Avatar';
import IconButton from 'components/@extended/IconButton';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { openSnackbar } from 'api/snackbar';
import { createNewUser, updateUser } from 'api/users';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import { useGetRoles } from 'api/access_control';
import { ImagePath, getImageUrl } from 'utils/getImageUrl';
import { ThemeMode } from 'config';

// icons
import { Camera, Trash } from 'iconsax-react';
import toast from 'react-hot-toast';
import useAuth from 'hooks/useAuth';

const getInitialValues = (user) => ({
  name: '',
  email: '',
  password: '',
  phone: '',
  role_id: '',
  company_id: '',
  business_unit_id: '',
  location_id: '',
  is_active: true,
  ...user
});

const allStatus = [
  { value: true, label: 'Active' },
  { value: false, label: 'Inactive' }
];

export default function FormUserAdd({ user, closeModal }) {
  const theme = useTheme();
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { roles } = useGetRoles();
  const { user: localUser } = useAuth();
  const company_id = localUser?.company_id;
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState(getImageUrl(`avatar-${user?.avatar || 1}.png`, ImagePath.USERS));
  const [openAlert, setOpenAlert] = useState(false);

  useEffect(() => {
    if (selectedImage) setAvatar(URL.createObjectURL(selectedImage));
  }, [selectedImage]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const UserSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: user ? Yup.string() : Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    role_id: Yup.string().required('Role is required'),
    phone: Yup.string().required('Phone Number is required'),
    company_id: Yup.string(),
    business_unit_id: Yup.string(),
    location_id: Yup.string(),
    is_active: Yup.boolean().required()
  });

  const formik = useFormik({
    initialValues: getInitialValues(user),
    validationSchema: UserSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('password', values.password);
        formData.append('phone', values.phone);
        formData.append('role_id', values.role_id);
        formData.append('company_id', company_id);
        formData.append('business_unit_id', values.business_unit_id || '');
        formData.append('location_id', values.location_id || '');
        formData.append('is_active', values.is_active);

        if (selectedImage) {
          formData.append('profile_image', selectedImage);
        }

        if (user) {
          const response = await updateUser(user.user_id, company_id, formData);
          if (response.success) {
            toast.success(response.message);
          }
        } else {
          const createResponse = await createNewUser(company_id, formData);

          if (createResponse.success) {
            toast.success(createResponse.message);
          }
        }

        setSubmitting(false);
        closeModal();
      } catch (error) {
        toast.error(error.message);
        setSubmitting(false);
        console.error(error);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

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
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{user ? 'Edit Employee' : 'New Employee'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                    <FormLabel
                      htmlFor="change-avtar"
                      sx={{
                        position: 'relative',
                        borderRadius: '50%',
                        overflow: 'hidden',
                        '&:hover .MuiBox-root': { opacity: 1 },
                        cursor: 'pointer'
                      }}
                    >
                      <Avatar
                        alt="Avatar 1"
                        src={user ? `${import.meta.env.VITE_APP_API_URL}/user/profile/${user.profile_image}` : avatar}
                        sx={{ width: 72, height: 72, border: '1px dashed' }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
                          width: '100%',
                          height: '100%',
                          opacity: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Stack spacing={0.5} alignItems="center">
                          <Camera style={{ color: theme.palette.secondary.lighter, fontSize: '2rem' }} />
                          <Typography sx={{ color: 'secondary.lighter' }}>Upload</Typography>
                        </Stack>
                      </Box>
                    </FormLabel>
                    <TextField
                      type="file"
                      id="change-avtar"
                      placeholder="Outlined"
                      variant="outlined"
                      sx={{ display: 'none' }}
                      onChange={(e) => setSelectedImage(e.target.files?.[0])}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={9}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="user-name">Full Name</InputLabel>
                        <TextField
                          fullWidth
                          id="user-name"
                          placeholder="Enter Employee's Full Name"
                          {...getFieldProps('name')}
                          error={Boolean(touched.name && errors.name)}
                          helperText={touched.name && errors.name}
                        />
                      </Stack>
                    </Grid>

                    <Grid item xs={9}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="user-email">Email</InputLabel>
                        <TextField
                          fullWidth
                          id="user-email"
                          placeholder="Enter Employee's Email Address"
                          {...getFieldProps('email')}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={9}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="user-phone">Phone</InputLabel>
                        <TextField
                          fullWidth
                          id="user-phone"
                          placeholder="Enter Employee's Phone Number"
                          {...getFieldProps('phone')}
                          error={Boolean(touched.phone && errors.phone)}
                          helperText={touched.phone && errors.phone}
                        />
                      </Stack>
                    </Grid>

                    <Grid item xs={9}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="password">Password (Employee's can change it later)</InputLabel>
                        <TextField
                          fullWidth
                          id="password"
                          type="password"
                          placeholder="Enter Password"
                          {...getFieldProps('password')}
                          error={Boolean(touched.password && errors.password)}
                          helperText={touched.password && errors.password}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={9}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="user-role">Employee Role</InputLabel>
                        <Autocomplete
                          fullWidth
                          id="user-role"
                          options={roles || []}
                          getOptionLabel={(option) => option.role_name || ''}
                          value={roles?.find((unit) => unit.role_id === formik.values.role_id) || null}
                          onChange={(event, newValue) => {
                            setFieldValue('role_id', newValue ? newValue.role_id : '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Role"
                              error={Boolean(touched.role_id && errors.role_id)}
                              helperText={touched.role_id && errors.role_id}
                            />
                          )}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="user-status">Account Status</InputLabel>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={formik.values.is_active}
                              onChange={(e) => setFieldValue('is_active', e.target.checked)}
                              name="is_active"
                              color="primary"
                            />
                          }
                          label={formik.values.is_active ? 'Active' : 'Inactive'}
                        />
                        {touched.is_active && errors.is_active && (
                          <FormHelperText error id="standard-weight-helper-text-email-login" sx={{ pl: 1.75 }}>
                            {errors.is_active}
                          </FormHelperText>
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="user-location_id">Location</InputLabel>
                        <Autocomplete
                          fullWidth
                          id="user-location_id"
                          options={(locations || []).filter((loc) => loc.location_type !== 'branch')}
                          getOptionLabel={(option) => `${option.location_name}  (${option.location_type})` || ''}
                          value={locations?.find((loc) => loc.location_id === formik.values.location_id) || null}
                          onChange={(event, newValue) => {
                            setFieldValue('location_id', newValue ? newValue.location_id : '');
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select Location"
                              error={Boolean(touched.location_id && errors.location_id)}
                              helperText={touched.location_id && errors.location_id}
                            />
                          )}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="user-business_unit_id">Business Unit</InputLabel>
                        <Autocomplete
                          fullWidth
                          id="user-business_unit_id"
                          options={BusinessUnits || []}
                          getOptionLabel={(option) => option.unit_name || ''}
                          value={BusinessUnits?.find((unit) => unit.business_unit_id === formik.values.business_unit_id) || null}
                          onChange={(event, newValue) => {
                            setFieldValue('business_unit_id', newValue ? newValue.business_unit_id : '');
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
                  </Grid>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item></Grid>
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button color="error" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      {user ? 'Edit' : 'Add'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
    </>
  );
}

FormUserAdd.propTypes = { user: PropTypes.any, closeModal: PropTypes.func };
