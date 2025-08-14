import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

// third-party

// project-imports
import MainCard from 'components/MainCard';
import Transitions from 'components/@extended/Transitions';

// assets
import { Profile } from 'iconsax-react';

// ==============================|| CUSTOMER - VIEW ||============================== //

export default function CustomerView({ data }) {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Transitions type="slide" direction="down" in={true}>
      <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
        <Grid item xs={12} sm={5} md={4} lg={4} xl={3}>
          <MainCard>
            <Chip
              label={data.status}
              size="small"
              color={data.status === 'active' ? 'success' : 'error'}
              sx={{ position: 'absolute', right: 10, top: 10, fontSize: '0.675rem' }}
            />
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={2.5} alignItems="center">
                  <Profile size="64" color="#37d67a" variant="Bold" />{' '}
                  <Stack spacing={0.5} alignItems="center">
                    <Typography variant="h5">
                      {data.organization_name ? `${data.organization_name}` : `${data.customer_first_name} ${data.customer_last_name}`}{' '}
                    </Typography>
                    <Typography color="secondary">{data.customer_phone}</Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={7} md={8} lg={8} xl={9}>
          <Stack spacing={2.5}>
            <MainCard title="Personal Details">
              <List sx={{ py: 0 }}>
                {!data.organization_name ? (
                  <ListItem divider={!matchDownMD}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                          <Typography color="secondary">Full Name</Typography>
                          <Typography>
                            {data.customer_first_name} {data.customer_last_name}{' '}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                          <Typography color="secondary">Father Name</Typography>
                          <Typography>{data.customer_last_name || 'Not Provided'}</Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </ListItem>
                ) : (
                  <ListItem>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Organization Name</Typography>
                      <Typography>{data.organization_name}</Typography>
                    </Stack>
                  </ListItem>
                )}
                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Phone Number</Typography>
                        <Typography>{data.customer_phone || 'Not Provided'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Address</Typography>
                        <Typography>{data.customer_address || 'Not Provided'}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                {!data.organization_name && (
                  <ListItem divider={!matchDownMD}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Age Group</Typography>
                        <Typography>{data.customer_age || 'Not Provided'}</Typography>
                      </Stack>
                    </Grid>
                  </ListItem>
                )}
              </List>
            </MainCard>
          </Stack>
        </Grid>
      </Grid>
    </Transitions>
  );
}

CustomerView.propTypes = { data: PropTypes.any };
