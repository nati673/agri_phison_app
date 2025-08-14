import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import toast from 'react-hot-toast';
import { updateInventoryAdjustmentStatus } from 'api/adjustment';
import React from 'react';

const allowedStatuses = ['approved', 'submitted', 'rejected'];

export default function AdjustmentStatusModal({ open, handleClose, adjustment, actionDone }) {
  const [status, setStatus] = React.useState(adjustment?.adjustment_status || '');

  React.useEffect(() => {
    setStatus(adjustment?.adjustment_status || '');
  }, [adjustment]);

  const handleUpdate = async () => {
    try {
      if (!status) {
        toast.error('Please select a status');
        return;
      }
      const res = await updateInventoryAdjustmentStatus(adjustment.header_id, status);

      if (res.success) {
        toast.success(res.message);
        actionDone((prev) => !prev);
        handleClose();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.error);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Set Adjustment Status</DialogTitle>
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
          {status === 'approved' ? 'Approve' : status === 'rejected' ? 'Reject' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AdjustmentStatusModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  adjustment: PropTypes.object,
  actionDone: PropTypes.func.isRequired
};
