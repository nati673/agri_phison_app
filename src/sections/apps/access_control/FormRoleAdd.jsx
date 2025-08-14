import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// MUI
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Button,
  Tooltip,
  Divider,
  TextField,
  InputLabel,
  Typography,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// 3rd party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import Autocomplete from '@mui/material/Autocomplete';

// Project imports
import AlertCustomerDelete from './AlertRoleDelete';
import IconButton from 'components/@extended/IconButton';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { openSnackbar } from 'api/snackbar';
import { createNewRole, updateRole, useGetPermissions } from 'api/access_control';

// Icons
import { CloseCircle, SecurityUser, Trash } from 'iconsax-react';

// Utils
import { getImageUrl, ImagePath } from 'utils/getImageUrl';
import useAuth from 'hooks/useAuth';
import toast from 'react-hot-toast';

// ==============================|| ROLE ADD / EDIT FORM ||============================== //

const getInitialValues = (role) => ({
  role_name: '',
  about: '',
  permissions: [],
  ...role
});

const RoleSchema = Yup.object().shape({
  role_name: Yup.string().max(255).required('Role Name is required'),
  permissions: Yup.array().min(1, 'At least one permission is required')
});

export default function FormCustomerAdd({ role, closeModal }) {
  const theme = useTheme();
  const { permissions } = useGetPermissions();
  const { user } = useAuth();
  const companyId = user?.company_id;
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState(getImageUrl(`avatar-${role?.avatar || 1}.png`, ImagePath.USERS));
  const [openAlert, setOpenAlert] = useState(false);

  useEffect(() => {
    if (selectedImage) {
      setAvatar(URL.createObjectURL(selectedImage));
    }
  }, [selectedImage]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const formik = useFormik({
    initialValues: getInitialValues(role),
    validationSchema: RoleSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (role) {
          const data = { company_id: user?.company_id, role_name: values.role_name, permissions: values.permissions };

          const updateResponse = await updateRole(role.role_id, data);
          if (updateResponse.status) {
            toast.success(updateResponse.message);
          }
        } else {
          const data = { company_id: user?.company_id, role_name: values.role_name, permissions: values.permissions };
          const createResponse = await createNewRole(data);

          if (createResponse.status) {
            toast.success(createResponse.message);
          }
        }
        setSubmitting(false);
        closeModal();
      } catch (error) {
        setSubmitting(false);
        toast.error(error.message);
        console.error('Role submission error:', error);
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
            <DialogTitle>{role ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                    <SecurityUser size={60} color="purple" />
                  </Stack>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="role_name">Role Name</InputLabel>
                        <TextField
                          fullWidth
                          id="role_name"
                          placeholder="Enter Role Name"
                          {...getFieldProps('role_name')}
                          error={Boolean(touched.role_name && errors.role_name)}
                          helperText={touched.role_name && errors.role_name}
                        />
                      </Stack>
                    </Grid>

                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="permissions">Permissions</InputLabel>
                        <Autocomplete
                          multiple
                          fullWidth
                          id="permissions"
                          options={permissions}
                          value={formik.values.permissions}
                          onChange={(event, newValue) => {
                            setFieldValue('permissions', newValue);
                          }}
                          getOptionLabel={(option) => `${option.module_name} - ${option.action}`}
                          isOptionEqualToValue={(option, value) => option.permission_id === value.permission_id}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Select Permissions"
                              error={Boolean(touched.permissions && errors.permissions)}
                              helperText={touched.permissions && errors.permissions}
                            />
                          )}
                          renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                              <Chip
                                {...getTagProps({ index })}
                                key={option.permission_id}
                                label={`Can ${option.action} - ${option.module_name}`}
                                variant="combined"
                                deleteIcon={<CloseCircle style={{ fontSize: '0.75rem' }} />}
                              />
                            ))
                          }
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
                <Grid item>
                  {role && (
                    <Tooltip title="Delete Role" placement="top">
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
                      {role ? 'Edit' : 'Add'}
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>

      {role && (
        <AlertCustomerDelete
          id={role.role_id}
          title={role.role_name}
          open={openAlert}
          handleClose={() => {
            setOpenAlert(false);
            closeModal();
          }}
        />
      )}
    </>
  );
}

FormCustomerAdd.propTypes = {
  role: PropTypes.object,
  closeModal: PropTypes.func.isRequired
};
