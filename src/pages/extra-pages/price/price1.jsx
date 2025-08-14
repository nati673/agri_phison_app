import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Stack, Select, MenuItem, Button, List, ListItem, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Bank, Call, InfoCircle, Information, Send2, TickCircle } from 'iconsax-react';
import MainCard from 'components/MainCard';
import { useGetPlans } from 'api/plan';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router';
export default function Pricing() {
  const theme = useTheme();
  const { plans: apiPlans } = useGetPlans();
  const [selectedCycle, setSelectedCycle] = useState('');
  const [uniqueBillingCycles, setUniqueBillingCycles] = useState([]);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  useEffect(() => {
    if (apiPlans.length > 0) {
      const unique = [...new Set(apiPlans.map((plan) => plan.billing_cycle))];
      setUniqueBillingCycles(unique);
      setSelectedCycle(unique[0]);
    }
  }, [apiPlans]);

  const filteredPlans = apiPlans.filter((plan) => plan.billing_cycle === selectedCycle);

  return (
    <Box sx={{ px: { xs: 4, sm: 5, md: 7, lg: 10 }, py: { xs: 1, sm: 2, md: 4, lg: 7 } }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} justifyContent="space-between">
            <Stack spacing={0}>
              <Typography variant="h5">Quality is never an accident. It is always the result of intelligent effort</Typography>
              <Typography color="text.secondary">It makes no difference what the price is, it all makes sense to us.</Typography>
            </Stack>
            <Select
              size="small"
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              displayEmpty
              sx={{ minWidth: 150 }}
            >
              {uniqueBillingCycles.map((cycle, index) => (
                <MenuItem key={index} value={cycle}>
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1).replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Grid>

        <Grid item container spacing={3} xs={12} alignItems="stretch">
          {filteredPlans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={plan.plan_id}>
              <MainCard sx={{ height: '100%' }}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Box sx={{ padding: 3 }}>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Stack spacing={0} textAlign="center">
                            <Typography variant="h4">{plan.name}</Typography>
                          </Stack>
                        </Grid>
                        <Grid item xs={12}>
                          <Stack spacing={0} alignItems="center">
                            <Typography variant="h3" sx={{ fontSize: '35px', fontWeight: 700, lineHeight: 1 }}>
                              ETB {parseFloat(plan.price).toFixed(2)}
                            </Typography>
                            <Stack direction="column" spacing={1} justifyContent="c" alignItems="center">
                              <Typography variant="h6" color="text.secondary">
                                {plan.billing_cycle.replace('_', ' ')}
                              </Typography>
                              <Tooltip
                                title={
                                  <Stack>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                      Description
                                    </Typography>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                      {plan.description}
                                    </Typography>
                                  </Stack>
                                }
                                arrow
                                placement="top"
                              >
                                <Box
                                  sx={{ display: 'flex', gap: 0.6, alignItems: 'center', cursor: 'pointer', fontSize: 10 }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Information size="15" color="green" />{' '}
                                  <Typography variant="body2" color={'green'}>
                                    View Description
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </Stack>
                          </Stack>
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            color="secondary"
                            variant="outlined"
                            fullWidth
                            onClick={() => {
                              if (plan.name === 'TESTER') {
                                navigate('/setup');
                              } else {
                                setSelectedPlan(plan);
                                setOpenModal(true);
                              }
                            }}
                          >
                            Start
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <List sx={{ m: 0, p: 0, '& > li': { px: 0.5, py: 0.5, display: 'flex', alignItems: 'center' } }} component="ul">
                      {plan.features.map(({ feature_name, feature_value }, i) => (
                        <ListItem key={i} disableGutters>
                          <TickCircle size="16" color={theme.palette.success.main} style={{ marginRight: 8 }} />
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 0.5 }}>
                            {feature_name}:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'normal' }}>
                            {feature_value}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
              </MainCard>
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, p: 2, backgroundColor: 'white' }
        }}
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <img src="https://agriphison.com/assets/img/logo/logo-black.png" alt="Yegara Soft" height={50} />
            <Typography variant="h6">Secure Payment Instructions</Typography>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                <Bank size="32" color="#37d67a" style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Bank Transfer
              </Typography>
              <Typography variant="body2" mt={1}>
                <strong>Bank:</strong> Commercial Bank of Ethiopia <br />
                <strong>Account No:</strong> 100023456789 <br />
                <strong>Account Name:</strong> Delta Technology PLC.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                <Call size="32" color="#37d67a" style={{ verticalAlign: 'middle', marginRight: 8 }} />
                Telebirr
              </Typography>
              <Typography variant="body2" mt={1}>
                <strong>Phone Number:</strong> 0912345678 <br />
                <strong>Name:</strong> Delta Technology PLC.
              </Typography>
            </Box>

            {selectedPlan && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  <Information size="32" color="#37d67a" style={{ verticalAlign: 'middle', marginRight: 8 }} />
                  Plan Details
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                  {selectedPlan.description}
                </Typography>
              </Box>
            )}

            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#e0f7fa', mt: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                After Payment
              </Typography>
              <Typography variant="body2">
                📸 Please take a screenshot of your payment confirmation.
                <br />
                💬 Send it to us on <strong>Telegram:</strong>{' '}
                <a href="https://t.me/AgriPhisonSupport" target="_blank" rel="noopener noreferrer">
                  @AgriPhisonSupport
                </a>
                <br />
                🕒 You’ll receive access in less than <strong>15 minutes</strong> after verification.
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <Box textAlign="right" p={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={<Send2 color="#fff" size={20} />}
            onClick={() => window.open('https://t.me/AgriPhisonSupport', '_blank')}
            sx={{ textTransform: 'none' }}
          >
            Send Screenshot on Telegram
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
