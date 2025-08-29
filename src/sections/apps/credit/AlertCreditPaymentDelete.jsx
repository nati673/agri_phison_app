import PropTypes from 'prop-types';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';

// Project imports
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';
import { Trash } from 'iconsax-react';
import toast from 'react-hot-toast';
import { deleteCreditPayment } from 'api/credit'; // Make sure this is your API

// ==============================|| Credit Payment - DELETE ALERT ||============================== //

export default function AlertCreditPaymentDelete({ payment_id, amount, open, handleClose, onPaymentSuccess }) {
  const deleteHandler = async () => {
    try {
      const result = await deleteCreditPayment(payment_id);
      if (result.success) {
        toast.success(result.message || 'Payment deleted');
      }
      onPaymentSuccess();
      handleClose();
    } catch (error) {
      toast.error(error.message || 'Could not delete payment');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="credit-payment-delete-title"
      aria-describedby="credit-payment-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <Trash variant="Bold" />
          </Avatar>
          <Stack spacing={2}>
            <Typography variant="h4" align="center" id="credit-payment-delete-title">
              Are you sure you want to delete this payment?
            </Typography>
            <Typography align="center" id="credit-payment-delete-description">
              By deleting this payment of
              <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>
                {' '}
                ETB {amount}{' '}
              </Typography>
              linked to this credit, the credit balance will update automatically.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ width: 1 }}>
            <Button fullWidth onClick={handleClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button fullWidth color="error" variant="contained" onClick={deleteHandler} autoFocus>
              Delete
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

AlertCreditPaymentDelete.propTypes = {
  payment_id: PropTypes.number.isRequired,
  amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // to show in alert
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
};
