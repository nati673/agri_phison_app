import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function InactiveCompany() {
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
          <Typography variant="h1">Company Inactive</Typography>
          <Typography color="text.secondary" align="center" sx={{ width: { xs: '73%', sm: '61%' } }}>
            The company associated with this account is currently inactive. Please contact support for further information.
          </Typography>
        </Stack>
      </Grid>
    </Grid>
  );
}
