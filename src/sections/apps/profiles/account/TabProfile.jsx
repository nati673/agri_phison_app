import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';

// third-party

// project-imports
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

import defaultImages from 'assets/images/users/avatar-2.png';

// assets
import { useGetUserInfo } from 'api/users';

// ==============================|| ACCOUNT PROFILE - BASIC ||============================== //

export default function TabProfile() {
  const matchDownMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const { userInfo } = useGetUserInfo();
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={5} md={4} xl={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MainCard>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Stack spacing={2.5} alignItems="center">
                    <Avatar
                      alt="Avatar 1"
                      size="xl"
                      src={
                        userInfo?.profile_image
                          ? `${import.meta.env.VITE_APP_API_URL}/user/profile/${userInfo?.profile_image}`
                          : defaultImages
                      }
                    />
                    <Stack spacing={0.5} alignItems="center">
                      <Typography variant="h5">{userInfo?.name}</Typography>
                      <Typography color="secondary">{userInfo?.role}</Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
              </Grid>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} sm={7} md={8} xl={9}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MainCard title="Personal Details">
              <List sx={{ py: 0 }}>
                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Full Name</Typography>
                        <Typography>{userInfo?.name}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Role</Typography>
                        <Typography>{userInfo?.role}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>

                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Email</Typography>
                        <Typography>{userInfo?.email}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary">Phone</Typography>
                        <Typography>{userInfo?.phone}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
              </List>
            </MainCard>
          </Grid>
          <Grid item xs={12}>
            <MainCard title="More Details">
              <List sx={{ py: 0 }}>
                <ListItem divider={!matchDownMD}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="textSecondary" variant="body2">
                          Location Name (Branch)
                        </Typography>
                        <Typography color={userInfo?.location_name ? '' : 'red'}>
                          {userInfo?.location_name || 'No Branch assigned'}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Grid item xs={12} md={6}>
                        <Stack spacing={0.5}>
                          <Typography color="textSecondary" variant="body2">
                            Business Unit (Department)
                          </Typography>
                          <Typography color={userInfo?.business_unit_name ? '' : 'red'}>
                            {userInfo?.business_unit_name || 'No Department assigned'}
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
                        <Typography variant="body1">
                          {userInfo?.last_login ? new Date(userInfo?.last_login).toLocaleString() : 'N/A'}
                        </Typography>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="textSecondary" variant="body2">
                          Created At
                        </Typography>
                        <Typography variant="body1">
                          {userInfo?.created_at ? new Date(userInfo?.created_at).toLocaleString() : 'N/A'}
                        </Typography>
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
                      <Typography>{userInfo?.updated_at ? new Date(userInfo?.created_at).toLocaleString() : 'N/A'}</Typography>
                    </Stack>
                  </Grid>
                </ListItem>
              </List>
            </MainCard>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
