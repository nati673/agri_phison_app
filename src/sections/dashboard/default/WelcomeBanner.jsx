// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';

// assets
import WelcomeImage from 'assets/images/analytics/welcome-banner.png';
import cardBack from 'assets/images/widget/img-dropbox-bg.svg';

// ==============================|| AGRI PHISON - WELCOME ||============================== //

export default function WelcomeBanner() {
  const theme = useTheme();

  return (
    <MainCard
      border={false}
      sx={{
        color: 'common.white',
        bgcolor: theme.palette.mode === ThemeMode.DARK ? 'primary.400' : 'primary.darker',
        '&:after': {
          content: '""',
          background: `url("${cardBack}") 100% 100% / cover no-repeat`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          opacity: 0.5
        }
      }}
    >
      <Grid container>
        <Grid item md={6} sm={6} xs={12}>
          <Stack spacing={2} sx={{ padding: 3, zIndex: 2, position: 'relative' }}>
            <Typography variant="h2" color={theme.palette.background.paper}>
              Welcome to Agri Phison
            </Typography>
            <Typography variant="h6" color={theme.palette.background.paper}>
              Empower your agricultural business with smart tools. Track activity, boost performance, and grow confidently.
            </Typography>
            <Typography variant="body2" color={theme.palette.background.paper}>
              Free users can explore limited features. Upgrade now to unlock full access and maximize your company’s productivity.
            </Typography>
            <Box sx={{ pt: 1.5 }}>
              <Button
                variant="outlined"
                color="secondary"
                href="/price"
                sx={{
                  color: 'background.paper',
                  borderColor: theme.palette.background.paper,
                  '&:hover': { color: 'background.paper', borderColor: theme.palette.background.paper, bgcolor: 'primary.main' }
                }}
              >
                See Subscription Plans
              </Button>
            </Box>
          </Stack>
        </Grid>
        <Grid
          item
          sm={6}
          xs={12}
          sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', justifyContent: 'flex-end', pr: { sm: 3, md: 8 } }}
        >
          <Box component="img" src={WelcomeImage} alt="Welcome to Agri Phison" width="200px" sx={{ zIndex: 2 }} />
        </Grid>
      </Grid>
    </MainCard>
  );
}
