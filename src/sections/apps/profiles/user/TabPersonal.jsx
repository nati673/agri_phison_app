import { useOutletContext } from 'react-router';
import { Box, Grid, Stack, Button, TextField, Typography, CardHeader, Divider, FormHelperText } from '@mui/material';
import MainCard from 'components/MainCard';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useGetUserInfo } from 'api/users';

export default function TabPersonal() {
  // const { userInfo } = useGetUserInfo();
  const userInfo = {
    user_id: 1,
    company_id: 1,
    business_unit_id: null,
    location_id: null,
    name: 'Natnael Hailu',
    email: 'natnaelhailu245@gmail.com',
    phone: '0924676177',
    role_id: 3,
    is_active: 1,
    profile_image: null,
    last_login: '2025-07-24T06:53:40.000Z',
    created_at: '2025-07-22T20:32:40.000Z',
    updated_at: '2025-07-24T06:53:40.000Z',
    role: 'admin',
    business_unit_name: null,
    location_name: null
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
          email: Yup.string().email('Invalid email').required('Email is required'),
          phone: Yup.string().required('Phone is required')
        })}
        onSubmit={(values, { setSubmitting }) => {
          console.log('Form submitted', values);
          setSubmitting(false);
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Box sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
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
                    <TextField
                      fullWidth
                      name="email"
                      disabled
                      value={values.email}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      placeholder="Email"
                    />
                    {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">Phone</Typography>
                    <TextField
                      fullWidth
                      disabled
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
