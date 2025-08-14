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
import error404 from 'assets/images/maintenance/img-error-404.svg';

// ==============================|| ERROR 404 - NO TENANT ||============================== //

export default function NoTenant() {
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
            <Box sx={{ width: { xs: 250, sm: 590 }, height: { xs: 130, sm: 300 } }}>
              <img src={error404} alt="Tenant not found" style={{ width: '100%', height: '100%' }} />
            </Box>
          </Grid>
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <Typography variant="h1">No Tenant Found</Typography>
          <Typography color="text.secondary" align="center" sx={{ width: { xs: '73%', sm: '61%' } }}>
            The subdomain or tenant you are trying to access doesn't exist or has been removed. Please check the URL or return to the main
            page.
          </Typography>
          <Button variant="contained" component="a" href={`${import.meta.env.VITE_APP_MAIN_URL}`}>
            Back To Home
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
