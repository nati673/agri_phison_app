import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Typography,
  Divider,
  Chip,
  Button,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Box,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Collapse,
  IconButton,
  useMediaQuery,
  alpha,
  Skeleton
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  DollarCircle,
  ShoppingCart,
  CalendarAdd,
  AddCircle,
  ArrowDown,
  ArrowUp,
  CallCalling,
  UserSquare,
  UserTag,
  ArrowSwapHorizontal
} from 'iconsax-react';
import defaultImages from 'assets/images/users/vector-3.png';
import { useGetTransaction } from 'api/customer';
import { useParams } from 'react-router';
import SalesOverTimeChart from 'sections/apps/customer/transaction/charts/SalesOverTimeChart';
import CreditsStatusChart from 'sections/apps/customer/transaction/charts/CreditsStatusChart';

import MainCard from 'components/MainCard';
import { ThemeMode } from 'config';
import SalesByProductChart from 'sections/apps/customer/transaction/charts/SalesByProductChart';
import BalanceCard from 'sections/apps/customer/transaction/balanceCard';

const GlassCard = styled(Card)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: `0px 4px 20px 0px ${theme.palette.primary.main}25`
}));
function TransactionSkeleton() {
  return (
    <Grid container spacing={4}>
      {/* Metrics Skeletons */}
      {[1, 2, 3].map((i) => (
        <Grid item xs={12} md={4} key={'metrics-' + i}>
          <GlassCard>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Skeleton variant="circular" width={56} height={56} />
              <Stack>
                <Skeleton variant="text" width={100} height={28} sx={{ mb: 1 }} />
                <Skeleton variant="text" width={70} height={40} />
              </Stack>
            </CardContent>
          </GlassCard>
        </Grid>
      ))}

      {/* Customer Profile Card Skeleton */}
      <Grid item xs={12} md={4}>
        <GlassCard sx={{ minHeight: 340, px: 2, py: 2 }}>
          <CardHeader
            avatar={<Skeleton variant="circular" width={72} height={72} />}
            title={<Skeleton variant="text" width={140} height={32} />}
            subheader={<Skeleton variant="text" width={80} height={20} />}
          />
          <Divider sx={{ mb: 2, mt: 1 }} />
          <CardContent>
            <Stack spacing={2}>
              {[...Array(6)].map((_, idx) => (
                <Skeleton key={idx} variant="text" width="90%" height={28} />
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              <Skeleton variant="rectangular" width={100} height={38} />
              <Skeleton variant="rectangular" width={100} height={38} />
            </Stack>
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Chart Skeletons */}
      <Grid item xs={12} md={8}>
        <Stack spacing={2}>
          <GlassCard>
            <CardHeader />
            <CardContent>
              <Skeleton variant="rectangular" width="100%" height={260} />
            </CardContent>
          </GlassCard>
          <MainCard>
            <Skeleton variant="rectangular" width="100%" height={80} />
          </MainCard>
        </Stack>
      </Grid>

      {/* Table Cards Skeletons (split 6/6) */}
      <Grid container spacing={1} md={12} sx={{ minHeight: 340, px: 4, py: 5 }}>
        {[1, 2].map((i) => (
          <Grid item xs={12} md={6} key={'table-' + i}>
            <GlassCard>
              <CardContent>
                <Skeleton variant="rectangular" width="100%" height={220} />
              </CardContent>
            </GlassCard>
          </Grid>
        ))}
      </Grid>

      {/* Tabs/Table Skeleton */}
      <Grid item xs={12} md={12}>
        <GlassCard>
          <CardContent>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="text" width={100} height={38} />
              ))}
            </Stack>
            <Stack spacing={2}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" width="100%" height={84} />
              ))}
            </Stack>
          </CardContent>
        </GlassCard>
      </Grid>
    </Grid>
  );
}

function MetricsCard({ primary, secondary, icon, color }) {
  return (
    <GlassCard sx={{ mb: 2, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
        <Stack>
          <Typography variant="subtitle2" color="text.secondary">
            {primary}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, fontFeatureSettings: '"tnum" 1', letterSpacing: 0.4 }}>
            {secondary}
          </Typography>
        </Stack>
      </CardContent>
    </GlassCard>
  );
}
const statusColor = (status) =>
  status === 'active' ? 'success' : status === 'unpaid' ? 'warning' : status === 'paid' ? 'primary' : 'default';

function renderStatusChip(status) {
  return <Chip variant="outlined" size="small" label={status} color={statusColor(status)} />;
}
function formatCurrency(val) {
  return val ? Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00';
}
function formatDate(val) {
  return val ? new Date(val).toLocaleString() : '';
}

function CreditTable({ credits }) {
  return (
    <TableContainer component={Box} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Credit ID</TableCell>
            <TableCell>Credit Total</TableCell>
            <TableCell>Payback Day</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Remaining</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(credits || []).length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No credits
              </TableCell>
            </TableRow>
          ) : (
            credits.map((row) => (
              <TableRow key={row.credit_id}>
                <TableCell>{row.credit_id}</TableCell>
                <TableCell>{formatCurrency(row.credit_total)}</TableCell>
                <TableCell>{formatDate(row.payback_day)}</TableCell>
                <TableCell>{renderStatusChip(row.status)}</TableCell>
                <TableCell>{formatCurrency(row.total_paid)}</TableCell>
                <TableCell>{formatCurrency(row.remaining_balance)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function SalesTable({ sales }) {
  const [openRow, setOpenRow] = useState(null);
  return (
    <TableContainer component={Box} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Sale ID</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Type</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(sales || []).length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No sales
              </TableCell>
            </TableRow>
          ) : (
            sales.map((row) => (
              <React.Fragment key={row.sale_id}>
                <TableRow>
                  <TableCell>
                    <IconButton
                      size="small"
                      aria-label="expand row"
                      onClick={() => setOpenRow(openRow === row.sale_id ? null : row.sale_id)}
                    >
                      {openRow === row.sale_id ? <ArrowUp /> : <ArrowDown />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{row.sale_id}</TableCell>
                  <TableCell>{formatCurrency(row.total_amount)}</TableCell>
                  <TableCell>{formatDate(row.sale_date)}</TableCell>
                  <TableCell>{renderStatusChip(row.status)}</TableCell>
                  <TableCell>{row.sale_type}</TableCell>
                </TableRow>
                {/* Items subtable */}
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={openRow === row.sale_id} timeout="auto" unmountOnExit>
                      <Box sx={{ my: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Sale Items
                        </Typography>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Sale Item ID</TableCell>
                              <TableCell>Product ID</TableCell>
                              <TableCell>Quantity</TableCell>
                              <TableCell>Unit Price</TableCell>
                              <TableCell>Total Price</TableCell>
                              <TableCell>Purchase Price</TableCell>
                              <TableCell>Discount Amount</TableCell>
                              <TableCell>Discount %</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(row.items || []).map((item) => (
                              <TableRow key={item.sale_item_id}>
                                <TableCell>{item.sale_item_id}</TableCell>
                                <TableCell>{item.product_id}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                                <TableCell>{formatCurrency(item.total_price)}</TableCell>
                                <TableCell>{formatCurrency(item.purchase_price)}</TableCell>
                                <TableCell>{formatCurrency(item.discount_amount)}</TableCell>
                                <TableCell>{item.discount_percent}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function OrdersTable({ orders }) {
  return (
    <TableContainer component={Box} sx={{ mb: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(orders || []).length === 0 ? (
            <TableRow>
              <TableCell align="center">No orders</TableCell>
            </TableRow>
          ) : (
            orders.map((row) => (
              <TableRow key={row.order_id}>
                <TableCell>{row.order_id}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function TransactionProfile() {
  const theme = useTheme();
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const [view, setView] = useState('list');
  const [selectedTab, setSelectedTab] = useState(0);
  const { post_id } = useParams();
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await useGetTransaction(post_id);
      setTransaction(data.data);
    }
    if (post_id) fetchData();
  }, [post_id]);
  if (!transaction) return <TransactionSkeleton />;

  const customerInfo = transaction?.customer;

  const totalSales = transaction.sales?.reduce((acc, cur) => acc + parseFloat(cur.total_amount || 0), 0) || 0;
  const ordersCount = transaction.orders?.length || 0;
  const creditTotal = transaction.credits?.reduce((acc, cur) => acc + parseFloat(cur.credit_total || 0), 0) || 0;

  return (
    <Grid container spacing={isMdDown ? 2 : 4}>
      {/* Metrics */}
      <Grid item xs={12} md={4}>
        <MetricsCard
          primary="Total Sales"
          secondary={formatCurrency(totalSales)}
          icon={<ShoppingCart />}
          color={theme.palette.success.main}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <MetricsCard
          primary="Total Credits"
          secondary={formatCurrency(creditTotal)}
          icon={<DollarCircle />}
          color={theme.palette.primary.main}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <MetricsCard primary="Orders Received" secondary={ordersCount} icon={<CalendarAdd />} color={theme.palette.warning.main} />
      </Grid>

      {/* Customer Profile Card: Hot Modern Style */}
      <Grid item xs={12} md={4}>
        <GlassCard sx={{ minHeight: 340, px: 2, py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CardHeader
            sx={{ width: '100%', px: 0 }}
            avatar={
              <Avatar
                sx={{
                  width: 82,
                  height: 82,
                  bgcolor: '#e3f1fb',
                  boxShadow: (theme) => `0 0 0 4px ${theme.palette.primary.light}22`
                }}
                src={defaultImages}
              >
                {/* 
            <UserSquare color="#1976d2" variant="Bold" size={54} />
          */}
              </Avatar>
            }
            title={
              <Stack direction="row" alignItems="center" gap={1} sx={{ minHeight: 40 }}>
                <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                  {customerInfo?.customer_first_name} {customerInfo?.customer_last_name}
                </Typography>
              </Stack>
            }
            subheader={
              <Typography variant="body2" color="text.secondary">
                {customerInfo?.customer_type === 'individual' ? 'Private Customer' : 'Business'}
                <Chip size="small" label={customerInfo?.status} color={statusColor(customerInfo?.status)} sx={{ fontWeight: 700, ml: 1 }} />
              </Typography>
            }
          />
          <Divider sx={{ mb: 2, mt: 1 }} />
          <CardContent sx={{ width: '100%', px: 1 }}>
            <Stack spacing={2} sx={{ width: '100%', mt: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <UserSquare color="#7E8B96" variant="Bold" size={22} />
                <Typography fontWeight={600} color="text.secondary">
                  Type:&nbsp;
                </Typography>
                <Typography fontWeight={700}>{customerInfo?.customer_type || 'N/A'}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CallCalling color="#7E8B96" variant="Bold" size={22} />
                <Typography fontWeight={600} color="text.secondary">
                  Phone:&nbsp;
                </Typography>
                <Typography fontWeight={700}>{customerInfo?.customer_phone || 'N/A'}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <UserSquare color="#7E8B96" variant="Bold" size={22} />
                <Typography fontWeight={600} color="text.secondary">
                  Sex:&nbsp;
                </Typography>
                <Typography fontWeight={700}>{customerInfo?.customer_sex || 'N/A'}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <UserTag color="#7E8B96" variant="Bold" size={22} />
                <Typography fontWeight={600} color="text.secondary">
                  Age:&nbsp;
                </Typography>
                <Typography fontWeight={700}>{customerInfo?.customer_age || 'N/A'}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarAdd color="#7E8B96" variant="Bold" size={22} />
                <Typography fontWeight={600} color="text.secondary">
                  Created:&nbsp;
                </Typography>
                <Typography fontWeight={700}>{formatDate(customerInfo?.created_at)}</Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                <Typography fontWeight={600} color="text.secondary">
                  Notes:&nbsp;
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                  {customerInfo?.notes || ''}
                </Typography>
              </Stack>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
              <Button variant="contained" color="primary" size="medium" startIcon={<AddCircle />}>
                New Sale
              </Button>
              <Button variant="contained" color="warning" size="medium" startIcon={<AddCircle />}>
                New Order
              </Button>
            </Stack>
          </CardContent>
        </GlassCard>
      </Grid>

      <Grid item xs={12} md={8}>
        <Stack>
          <GlassCard>
            <CardHeader />
            <CardContent>
              <SalesOverTimeChart transaction={transaction} />
            </CardContent>
          </GlassCard>
        </Stack>
        <BalanceCard transaction={transaction} />
      </Grid>

      <Grid container spacing={1} md={12} sx={{ minHeight: 340, px: 4, py: 5, alignItems: 'center' }}>
        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent>
              <SalesByProductChart transaction={transaction} />
            </CardContent>
          </GlassCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <GlassCard>
            <CardContent>
              <CreditsStatusChart transaction={transaction} />
            </CardContent>
          </GlassCard>
        </Grid>
      </Grid>
      {/* Transactions Tabs/Lists */}
      <Grid item xs={12} md={12}>
        <GlassCard>
          <CardContent>
            <Stack direction={isMdDown ? 'column' : 'row'} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Tabs
                value={selectedTab}
                onChange={(_, v) => setSelectedTab(v)}
                textColor="primary"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons
                allowScrollButtonsMobile
              >
                <Tab label="Credit History" />
                <Tab label="Sales History" />
                <Tab label="Order History" />
              </Tabs>
              <Select value={view} onChange={(e) => setView(e.target.value)} size="small" sx={{ minWidth: 110 }}>
                <MenuItem value="tab">Tab View</MenuItem>
                <MenuItem value="list">List View</MenuItem>
              </Select>
            </Stack>
            {view === 'tab' && (
              <Box>
                {selectedTab === 0 && <CreditTable credits={transaction.credits} />}
                {selectedTab === 1 && <SalesTable sales={transaction.sales} />}
                {selectedTab === 2 && <OrdersTable orders={transaction.orders} />}
              </Box>
            )}
            {view === 'list' && (
              <Stack spacing={4} sx={{ width: '100%', mt: 2 }}>
                <GlassCard>
                  <CardHeader
                    title={
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Credit History
                      </Typography>
                    }
                    sx={{ pb: 0 }}
                  />
                  <Divider />
                  <CardContent>
                    <CreditTable credits={transaction.credits} />
                  </CardContent>
                </GlassCard>
                <GlassCard>
                  <CardHeader
                    title={
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Sales History
                      </Typography>
                    }
                    sx={{ pb: 0 }}
                  />
                  <Divider />
                  <CardContent>
                    <SalesTable sales={transaction.sales} />
                  </CardContent>
                </GlassCard>
                <GlassCard>
                  <CardHeader
                    title={
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Order History
                      </Typography>
                    }
                    sx={{ pb: 0 }}
                  />
                  <Divider />
                  <CardContent>
                    <OrdersTable orders={transaction.orders} />
                  </CardContent>
                </GlassCard>
              </Stack>
            )}
          </CardContent>
        </GlassCard>
      </Grid>
    </Grid>
  );
}
