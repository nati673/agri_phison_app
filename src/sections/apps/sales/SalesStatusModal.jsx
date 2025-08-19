import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import toast from 'react-hot-toast';
import { updateSalesStatus } from 'api/sales'; // Your sales status update API call
import React from 'react';

const allowedStatuses = ['paid', 'unpaid', 'partially paid', 'refunded'];

export default function SalesStatusModal({ open, handleClose, sale, actionDone }) {
  const [status, setStatus] = React.useState(sale?.status || '');

  React.useEffect(() => {
    setStatus(sale?.status || '');
  }, [sale]);

  const handleUpdate = async () => {
    try {
      if (!status) {
        toast.error('Please select a status');
        return;
      }
        if (!sale.sale_id) {
          toast.error('Please select a sales');
          return;
        }
      const res = await updateSalesStatus(sale.sale_id, status);
      if (res.success) {
        toast.success(res.message);
        actionDone((prev) => !prev);
        handleClose();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.error || 'Failed to update status');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Set Sale Status</DialogTitle>
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
          {status === 'paid' ? 'Mark Paid' : status === 'refunded' ? 'Refund' : status === 'unpaid' ? 'Mark Unpaid' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SalesStatusModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  sale: PropTypes.object,
  actionDone: PropTypes.func.isRequired
};
