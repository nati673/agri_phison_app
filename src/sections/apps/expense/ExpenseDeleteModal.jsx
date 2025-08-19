import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';

import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';
import { Trash } from 'iconsax-react';
import toast from 'react-hot-toast';

// 🟢 Import your Expense delete API (create this function in api/expense.js)
import { deleteExpense } from 'api/expense';
import useAuth from 'hooks/useAuth';

export default function AlertExpenseDelete({ id, open, handleClose, actionDone, title }) {
  const { user } = useAuth();

  const company_id = user?.company_id;
  const deleteHandler = async () => {
    try {
      const res = await deleteExpense(id, company_id); // call Expense API
      if (res.success) {
        toast.success(res.message);
        handleClose();
      } else {
        toast.error(res.message || 'Failed to remove expense');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="expense-delete-title"
      aria-describedby="expense-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar color="warning" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <Trash variant="Bold" />
          </Avatar>
          <Stack spacing={2}>
            <Typography variant="h5" align="center" id="expense-delete-title">
              Remove this expense?
            </Typography>
            <Typography align="center" id="expense-delete-description" color="text.secondary">
              You are about to remove{' '}
              <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                “{title}”
              </Typography>
              . <br />
              This will permanently delete it from records.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button fullWidth onClick={handleClose} color="inherit" variant="outlined">
              Keep it
            </Button>
            <Button fullWidth color="error" variant="contained" onClick={deleteHandler} autoFocus>
              Remove
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

AlertExpenseDelete.propTypes = {
  id: PropTypes.number.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  actionDone: PropTypes.func.isRequired,
  title: PropTypes.string // could be expense name/paid_to
};
