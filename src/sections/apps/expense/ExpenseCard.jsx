import PropTypes from 'prop-types';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Fade from '@mui/material/Fade';
import Avatar from '@mui/material/Avatar';

import MoreIcon from 'components/@extended/MoreIcon';
import { Money2, Category, Calendar, Card, Location } from 'iconsax-react';
import AlertExpenseDelete from './ExpenseDeleteModal';
import ExpenseEditModal from './ExpenseEditModal';

export default function ExpenseCard({ expense }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const currency = (amt) => Number(amt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  console.log(expense);
  return (
    <>
      <Fade in>
        <Box
          sx={{
            width: '100%',
            maxWidth: 430,
            borderRadius: 5,
            p: 3,
            bgcolor: 'background.paper',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: 'divider',
            transition: 'box-shadow 0.3s',
            '&:hover': { boxShadow: 0.6 }
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                <Stack direction="row" alignItems="center" gap={1}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {expense.paid_to}
                  </Typography>
                  <Chip
                    label={expense.unit_name}
                    size="small"
                    sx={{
                      bgcolor: '#E8F5E9',
                      color: 'primary.main',
                      ml: 1,
                      fontWeight: 500,
                      borderRadius: 1
                    }}
                  />
                </Stack>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                  <MoreIcon />
                </IconButton>
              </Stack>
              <Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
                <MenuItem
                  onClick={() => {
                    setOpenEdit(true);
                    setAnchorEl(null);
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setOpenDelete(true);
                    setAnchorEl(null);
                  }}
                >
                  Delete
                </MenuItem>
              </Menu>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" gap={1}>
                <Money2 color="#7D8430" />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, #75CB2C 0%, #7D8430 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: 0.5
                  }}
                >
                  Birr {currency(expense.amount)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Chip
                icon={<Category size={18} />}
                label={expense.category}
                sx={{
                  color: 'text.primary',
                  borderRadius: 1,
                  fontWeight: 500
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {expense.description}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} alignItems="center" divider={<Divider orientation="vertical" flexItem />}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Card size={18} />
                  <Typography variant="body2" color="text.secondary">
                    {expense.payment_method}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Calendar size={18} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Location size={18} />
                  <Typography variant="body2" color="text.secondary">
                    {expense.location_name}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" alignItems="center" gap={2} mt={1}>
                <Avatar
                  alt="Avatar"
                  src={expense?.profile ? `${import.meta.env.VITE_APP_API_URL}/user/profile/${expense?.profile}` : expense.added_by_name[0]}
                  sx={{ width: 30, height: 30 }}
                />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {expense.added_by_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {expense.added_by_email}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                <Chip size="small" icon={<Location size={16} />} label={expense.location_type} sx={{ color: 'secondary.main', ml: 1 }} />
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Fade>

      <AlertExpenseDelete
        id={Number(expense.expense_id)}
        open={openDelete}
        title={expense.paid_to}
        handleClose={() => setOpenDelete(false)}
      />
      <ExpenseEditModal open={openEdit} onClose={() => setOpenEdit(false)} expense={expense} />
    </>
  );
}

ExpenseCard.propTypes = {
  expense: PropTypes.object.isRequired
};
