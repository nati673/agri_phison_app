import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function InactiveUser() {
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
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <Typography variant="h1">Account Inactive</Typography>
          <Typography color="text.secondary" align="center" sx={{ width: { xs: '73%', sm: '61%' } }}>
            Your user account has been marked as inactive. Please contact your company administrator or support team for assistance.
          </Typography>
          <Button variant="contained" component={Link} to="/login">
            Back to Login
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
