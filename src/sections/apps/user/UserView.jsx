import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

// third-party

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import Transitions from 'components/@extended/Transitions';

// assets
import { ListItemText } from '@mui/material';

// ==============================|| User - VIEW ||============================== //

export default function UserView({ data }) {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Transitions type="slide" direction="down" in={true}>
      <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
        <Grid item xs={12} sm={5} md={4} lg={4} xl={3}>
          <MainCard>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Stack spacing={2.5} alignItems="center">
                  <Avatar alt="Avatar 1" size="xl" src={`${import.meta.env.VITE_APP_API_URL}/user/profile/${data.profile_image}`} />
                  <Stack spacing={0.5} alignItems="center">
                    <Typography variant="h5">{data.name}</Typography>
                    <Typography color="secondary">{data.role}</Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Divider />
              </Grid>
              <Grid item xs={12}>
                <List aria-label="contact info" sx={{ py: 0 }}>
                  <ListItem disableGutters>
                    <ListItemText
                      primary="Email"
                      secondary={
                        <Typography variant="body2" color="textPrimary">
                          {data.email}
                        </Typography>
                      }
                    />
                  </ListItem>

                  <ListItem disableGutters>
                    <ListItemText
                      primary="Phone"
                      secondary={
                        <Typography variant="body2" color="textPrimary">
                          {data.phone}
                        </Typography>
                      }
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>
        <Grid item xs={12} sm={7} md={8} lg={8} xl={9}>
          <Stack spacing={2.5}>
            <MainCard title="More Details">
              <List sx={{ py: 0 }}>
                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="textSecondary" variant="body2">
                          Location Name (Branch)
                        </Typography>
                        <Typography color={data.location_name ? '' : 'red'}>{data.location_name || 'No Branch assigned'}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                          <Typography color="textSecondary" variant="body2">
                            Business Unit (Department)
                          </Typography>
                          <Typography color={data.business_unit_name ? '' : 'red'}>
                            {data.business_unit_name || 'No Department assigned'}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                </ListItem>

                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="textSecondary" variant="body2">
                          Last Login
                        </Typography>
                        <Typography variant="body1">{data.last_login ? new Date(data.last_login).toLocaleString() : 'N/A'}</Typography>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="textSecondary" variant="body2">
                          Created At
                        </Typography>
                        <Typography variant="body1">{data.created_at ? new Date(data.created_at).toLocaleString() : 'N/A'}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>

                <ListItem divider={!matchDownMD}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="textSecondary" variant="body2">
                        Updated At
                      </Typography>
                      <Typography>{data.updated_at ? new Date(data.created_at).toLocaleString() : 'N/A'}</Typography>
                    </Stack>
                  </Grid>
                </ListItem>
              </List>
            </MainCard>
          </Stack>
        </Grid>
      </Grid>
    </Transitions>
  );
}

UserView.propTypes = { data: PropTypes.any };
