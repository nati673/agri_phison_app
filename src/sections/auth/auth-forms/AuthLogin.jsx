import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { preload } from 'swr';

// material-ui
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';

// project-imports
import useAuth from 'hooks/useAuth';
import useScriptRef from 'hooks/useScriptRef';
import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import { fetcher } from 'utils/axios';

// assets
import { Eye, EyeSlash } from 'iconsax-react';
import { getSubdomain, hasSubdomain, redirectToSubdomain } from 'utils/redirectToSubdomain';

// ============================|| JWT - LOGIN ||============================ //

export default function AuthLogin({ forgot }) {
  const [checked, setChecked] = useState(false);

  const { isLoggedIn, login, getTenantSubdomain } = useAuth();
  const scriptedRef = useScriptRef();
  const isTenant = hasSubdomain();

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const [searchParams] = useSearchParams();
  const emailFromURL = searchParams.get('email') || '';
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // getTenantSubdomain  to get domain only of !isTenant

  return (
    <>
      <Formik
        initialValues={{
          email: emailFromURL,
          password: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
          ...(isTenant && {
            password: Yup.string().max(255).required('Password is required')
          })
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const subdomain = getSubdomain();

            if (!isTenant) {
              // No subdomain — get tenant subdomain by email first
              const data = { email: values.email };
              const subdomainData = await getTenantSubdomain(data);

              if (!subdomainData.status) {
                throw new Error(subdomainData.message);
              }

              // Redirect to tenant login page with email prefilled
              redirectToSubdomain(subdomainData.subdomain, `/login?email=${encodeURIComponent(values.email)}`);

              return;
            }

            await login(values.email, values.password, subdomain);
            if (scriptedRef.current) {
              setStatus({ success: true });
              setSubmitting(false);
              preload('api/menu/dashboard', fetcher);
            }
          } catch (err) {
            console.error(err);
            if (scriptedRef.current) {
              setStatus({ success: false });
              setErrors({ submit: err.message });
              setSubmitting(false);
            }
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="email-login"> {isTenant ? 'Email Address' : 'Enter your email to continue'}</InputLabel>
                  <OutlinedInput
                    id="email-login"
                    type="email"
                    value={values.email}
                    name="email"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    readOnly={!!emailFromURL}
                    placeholder="Enter email address"
                    fullWidth
                    error={Boolean(touched.email && errors.email)}
                  />
                </Stack>
                {touched.email && errors.email && (
                  <FormHelperText error id="standard-weight-helper-text-email-login">
                    {errors.email}
                  </FormHelperText>
                )}
              </Grid>
              {isTenant && (
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="password-login">Password</InputLabel>
                    <OutlinedInput
                      fullWidth
                      error={Boolean(touched.password && errors.password)}
                      id="-password-login"
                      type={showPassword ? 'text' : 'password'}
                      value={values.password}
                      name="password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            edge="end"
                            color="secondary"
                          >
                            {showPassword ? <Eye /> : <EyeSlash />}
                          </IconButton>
                        </InputAdornment>
                      }
                      placeholder="Enter password"
                    />
                  </Stack>
                  {touched.password && errors.password && (
                    <FormHelperText error id="standard-weight-helper-text-password-login">
                      {errors.password}
                    </FormHelperText>
                  )}
                </Grid>
              )}
              {isTenant && (
                <Grid item xs={12} sx={{ mt: -1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checked}
                          onChange={(event) => setChecked(event.target.checked)}
                          name="checked"
                          color="primary"
                          size="small"
                        />
                      }
                      label={<Typography variant="h6">Keep me sign in</Typography>}
                    />

                    <Link variant="h6" component={RouterLink} to={isLoggedIn && forgot ? forgot : '/forgot-password'} color="text.primary">
                      Forgot Password?
                    </Link>
                  </Stack>
                </Grid>
              )}
              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}
              <Grid item xs={12}>
                <AnimateButton>
                  <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                    {isTenant ? 'Login' : 'Continue'}
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
}

AuthLogin.propTypes = { forgot: PropTypes.string };
