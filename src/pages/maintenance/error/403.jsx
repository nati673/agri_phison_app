import { Link } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project-imports
import { APP_DEFAULT_PATH } from 'config';

// assets
import error403 from 'assets/images/maintenance/restriction.png'; // replace with actual 403 image or use 404 as fallback

// ==============================|| ERROR 403 ||============================== //

export default function Error403() {
  return (
    <Grid
      container
      spacing={10}
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ minHeight: '100vh', pt: 2, pb: 1, overflow: 'hidden' }}
    >
      <Grid item xs={12}>
        <Stack direction="row">
          <Grid item>
            <Box justifyContent={'center'} >
              <img src={error403} alt="error 403" width={120} />
            </Box>
          </Grid>
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <Typography variant="h1">403</Typography>
          <Typography color="text.secondary" align="center" sx={{ width: { xs: '73%', sm: '61%' } }}>
            You don’t have permission to access this page. If you believe this is an error, please contact your administrator.
          </Typography>
          <Button component={Link} to={APP_DEFAULT_PATH} variant="contained">
            Back To Home
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
