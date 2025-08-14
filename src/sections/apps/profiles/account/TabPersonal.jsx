import { useState } from 'react';
import { Box, Grid, Stack, Button, TextField, Typography, Divider, FormHelperText } from '@mui/material';
import MainCard from 'components/MainCard';
import { Formik } from 'formik';
import * as Yup from 'yup';
import ProfileImageUpload from './ProfileImageUpload';
import toast from 'react-hot-toast';
import { updateUserProfile, useGetUserInfo } from 'api/users';

export default function TabPersonal() {
  const { userInfoLoading, userInfoError, userInfo } = useGetUserInfo();

  if (userInfoLoading) {
    return <div>Loading user info...</div>;
  }
  if (userInfoError) {
    return <div>Error loading user info</div>;
  }
  if (!userInfo) {
    return <div>No user info found</div>;
  }

  const [selectedImage, setSelectedImage] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const formData = new FormData();
      formData.append('name', values.name);
      formData.append('phone', values.phone);
      if (selectedImage) {
        formData.append('profile_image', selectedImage);
      }

      const updatedUser = await updateUserProfile(userInfo.user_id, formData);

      if (updatedUser.success) {
        toast.success(updatedUser.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainCard content={false} title="User Information">
      <Formik
        initialValues={{
          name: userInfo.name || '',
          email: userInfo.email || '',
          phone: userInfo.phone || '',
          role: userInfo.role || '',
          company_id: userInfo.company_id || '',
          last_login: userInfo.last_login || '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required('Name is required'),
          phone: Yup.string().required('Phone is required')
        })}
        onSubmit={handleSubmit}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <ProfileImageUpload
                  profileImageUrl={`${import.meta.env.VITE_APP_API_URL}/user/profile/${userInfo?.profile_image}`}
                  setSelectedImage={setSelectedImage}
                />

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Name</Typography>
                    <TextField
                      fullWidth
                      name="name"
                      value={values.name}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Full Name"
                    />
                    {touched.name && errors.name && <FormHelperText error>{errors.name}</FormHelperText>}
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Email</Typography>
                    <TextField fullWidth value={values.email} disabled />
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Phone</Typography>
                    <TextField
                      fullWidth
                      name="phone"
                      value={values.phone}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Phone Number"
                    />
                    {touched.phone && errors.phone && <FormHelperText error>{errors.phone}</FormHelperText>}
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Role</Typography>
                    <TextField fullWidth value={values.role} disabled />
                  </Stack>
                </Grid>
                {/* 
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Company ID</Typography>
                    <TextField fullWidth value={values.company_id} disabled />
                  </Stack>
                </Grid> */}

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Last Login</Typography>
                    <TextField fullWidth value={new Date(values.last_login).toLocaleString()} disabled />
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Stack direction="row" justifyContent="flex-end" spacing={2}>
                <Button variant="outlined" color="secondary">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Save
                </Button>
              </Stack>
            </Box>
          </form>
        )}
      </Formik>
    </MainCard>
  );
}
