import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';

// third-party
import * as Yup from 'yup';
import { Formik } from 'formik';
import OtpInput from 'react18-input-otp';

// project-imports
import useScriptRef from 'hooks/useScriptRef';
import AnimateButton from 'components/@extended/AnimateButton';
import { ThemeMode } from 'config';
import useAuth from 'hooks/useAuth';
import { openSnackbar } from 'api/snackbar';
import { useNavigate } from 'react-router';
import { hasSubdomain, redirectToSubdomain } from 'utils/redirectToSubdomain';

// ============================|| STATIC - CODE VERIFICATION ||============================ //

export default function AuthCodeVerification() {
  const theme = useTheme();
  const { verifyOtp, resendOtp, getCompanyInfo } = useAuth();
  const navigate = useNavigate();
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendFail, setResendFail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await resendOtp();
      if (response.status === 'success') {
        setResendSuccess(response.message);
        setTimeout(() => {
          setResendSuccess('');
        }, 6000);
      } else if (response.status === 'fail') {
        setResendFail(response.message);
        setTimeout(() => {
          setResendFail('');
        }, 4000);
      }
    } catch (error) {
      console.error(error);
      setResendFail(error.message);
      setTimeout(() => {
        setResendFail('');
      }, 4000);
    } finally {
      setIsLoading(false);
    }
  };

  const scriptedRef = useScriptRef();
  const borderColor = theme.palette.mode === ThemeMode.DARK ? theme.palette.secondary[200] : theme.palette.secondary.light;

  return (
    <Formik
      initialValues={{
        otp: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        otp: Yup.string().length(6, 'OTP must be exactly 6 digits').required('OTP is required')
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          // Assuming verifyOtp is a function that verifies the OTP
          const result = await verifyOtp(values.otp);
          if (scriptedRef.current) {
            setStatus({ success: true });
            setSubmitting(false);
            openSnackbar({
              open: true,
              message: 'OTP successfully verified!',
              variant: 'alert',

              alert: {
                color: 'success'
              }
            });

            const companyData = await getCompanyInfo(result.COMPANY_ID);
            if (companyData?.setup_status?.status === 'incomplete') {
              window.location.href = '/price';
            } else {
              window.location.href = '/dashboard/default';
            }
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
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <OtpInput
                value={values.otp}
                onChange={(otp) => setFieldValue('otp', otp)}
                numInputs={6}
                containerStyle={{ justifyContent: 'space-between' }}
                inputStyle={{
                  width: '100%',
                  margin: '8px',
                  padding: '10px',
                  border: '1px solid',
                  borderColor: borderColor,
                  borderRadius: 4,
                  ':hover': { borderColor: theme.palette.primary.main }
                }}
                focusStyle={{
                  outline: 'none',
                  boxShadow: theme.customShadows.primary,
                  border: '1px solid',
                  borderColor: theme.palette.primary.main
                }}
                name="otp"
                onBlur={handleBlur}
                error={Boolean(touched.otp && errors.otp)}
              />
              {touched.otp && errors.otp && (
                <FormHelperText error id="standard-weight-helper-text-otp-verification">
                  {errors.otp}
                </FormHelperText>
              )}
            </Grid>
            {errors.submit && (
              <Grid item xs={12}>
                <FormHelperText error>{errors.submit}</FormHelperText>
              </Grid>
            )}
            <Grid item xs={12}>
              <AnimateButton>
                <Button disableElevation disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained">
                  Continue
                </Button>
              </AnimateButton>
            </Grid>
            <Grid item xs={12}>
              {resendFail && (
                <Typography variant="body2" color={'red'}>
                  {resendFail}
                </Typography>
              )}
              {resendSuccess && (
                <Typography variant="body2" color={'green'}>
                  {resendSuccess}
                </Typography>
              )}
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography>Not received Code?</Typography>
                <Button
                  variant="body1"
                  disabled={isLoading}
                  onClick={handleResendOtp}
                  sx={{ minWidth: 85, ml: 2, textDecoration: 'none', cursor: 'pointer' }}
                  color="primary"
                >
                  {isLoading ? 'Resending...' : 'Resend code'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}
