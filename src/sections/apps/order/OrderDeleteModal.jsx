import PropTypes from 'prop-types';
// material-ui
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';

// project-imports
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { Trash } from 'iconsax-react';
import toast from 'react-hot-toast';
import { deleteOrder } from 'api/order'; // <-- use your API function here

// ==============================|| Order - DELETE (Relaxed Version) ||============================== //

export default function AlertOrderDelete({ id, company_id, title, open, handleClose, actionDone }) {
  const deleteHandler = async () => {
    try {
      const res = await deleteOrder(id, company_id);
      if (res.success) {
        toast.success(res.message || 'Order removed');
      }
      handleClose();
      if (typeof actionDone === 'function') actionDone((prev) => !prev);
    } catch (error) {
      toast.error(error.message || 'Delete failed');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="order-delete-title"
      aria-describedby="order-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar color="warning" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <Trash variant="Bold" />
          </Avatar>
          <Stack spacing={2}>
            <Typography variant="h5" align="center" id="order-delete-title">
              Remove this order?
            </Typography>
            <Typography align="center" id="order-delete-description" color="text.secondary">
              You are about to remove{' '}
              <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                “Order ID: {title}”
              </Typography>
              . <br />
              This will take it off your records. You can always add a new order later if needed.
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

AlertOrderDelete.propTypes = {
  id: PropTypes.number.isRequired,
  company_id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  actionDone: PropTypes.func.isRequired
};
