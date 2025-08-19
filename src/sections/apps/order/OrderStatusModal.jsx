import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import toast from 'react-hot-toast';
import { updateOrderStatus } from 'api/order'; // Use your actual function here
import React from 'react';

const allowedStatuses = ['pending', 'approved', 'delivered', 'cancelled'];

export default function OrderStatusModal({ open, handleClose, order, actionDone }) {
  const [status, setStatus] = React.useState(order?.status || '');

  React.useEffect(() => {
    setStatus(order?.status || '');
  }, [order]);

  const handleUpdate = async () => {
    try {
      if (!status) {
        toast.error('Please select a status');
        return;
      }
      const res = await updateOrderStatus(order.order_id, status);
      if (res.success) {
        toast.success(res.message);
        if (typeof actionDone === 'function') actionDone((prev) => !prev);
        handleClose();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Set Order Status</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
              {allowedStatuses.map((s) => (
                <MenuItem key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleUpdate} variant="contained">
          {status === 'approved'
            ? 'Approve'
            : status === 'delivered'
              ? 'Mark Delivered'
              : status === 'cancelled'
                ? 'Cancel Order'
                : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

OrderStatusModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  order: PropTypes.object,
  actionDone: PropTypes.func.isRequired
};
