import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import toast from 'react-hot-toast';
import React from 'react';

// Import your API function for stock transfer status update
import { updateTransferStatus } from 'api/transfer';

// Allowed statuses for transfers
const allowedStatuses = ['pending', 'received', 'rejected'];

export default function StockTransferStatusModal({ open, handleClose, transfer, actionDone }) {
  const [status, setStatus] = React.useState(transfer?.transfer_status || '');
  const [confirming, setConfirming] = React.useState(false);

  React.useEffect(() => {
    setStatus(transfer?.transfer_status || '');
  }, [transfer]);

  // Confirm & update handler
  const handleUpdate = async () => {
    try {
      if (!status) {
        toast.error('Please select a status');
        return;
      }
      if (!transfer?.transfer_id) {
        toast.error('No valid transfer selected');
        return;
      }

      // If not yet confirming, first step asks for confirmation
      if (!confirming) {
        setConfirming(true);
        toast(
          (t) => (
            <span>
              Are you sure you want to mark transfer <b>#{transfer.transfer_id}</b> as{' '}
              <b style={{ textTransform: 'capitalize' }}>{status}</b>?
              <br />
              <Button
                onClick={async () => {
                  toast.dismiss(t.id);
                  await finalizeUpdate();
                }}
                color="success"
                size="small"
              >
                Yes
              </Button>
              <Button onClick={() => toast.dismiss(t.id)} color="inherit" size="small" sx={{ ml: 1 }}>
                Cancel
              </Button>
            </span>
          ),
          { duration: 6000 }
        );
        return;
      }

      // If already confirming, proceed
      await finalizeUpdate();
    } catch (error) {
      console.error(error);
      toast.error(error?.message || 'Failed to update status');
    }
  };

  const finalizeUpdate = async () => {
    try {
      const res = await updateTransferStatus(transfer.transfer_id, status);
      if (res.success) {
        toast.success(res.message || 'Stock transfer status updated');
        actionDone((prev) => !prev);
        handleClose();
      } else {
        toast.error(res.message || 'Failed updating');
      }
    } catch (err) {
      toast.error(err.message || 'API error');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Set Stock Transfer Status</DialogTitle>
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
        <Button
          onClick={handleUpdate}
          variant="contained"
          color={status === 'rejected' ? 'error' : status === 'received' ? 'success' : 'warning'}
        >
          {status ? `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}` : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

StockTransferStatusModal.propTypes = {
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  transfer: PropTypes.object,
  actionDone: PropTypes.func.isRequired
};
