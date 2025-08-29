import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box
} from '@mui/material';
import toast from 'react-hot-toast';
import React from 'react';
import { updateTransferStatus } from 'api/transfer';
import { Clock, TickCircle, CloseCircle, ArrowCircleRight, ArrowCircleLeft } from 'iconsax-react';

export default function StockTransferStatusModal({ open, handleClose, transfer, onActionDone }) {
  const [status, setStatus] = React.useState('');
  const [confirming, setConfirming] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  // Backend-supported transitions
  function getAllowedStatuses(current) {
    switch (current) {
      case 'pending':
        return ['received', 'rejected'];
      case 'received':
        return ['pending', 'rejected'];
      case 'rejected':
        return ['pending'];
      default:
        return [];
    }
  }

  const allowedStatuses = React.useMemo(() => {
    if (!transfer?.transfer_status) return [];
    return getAllowedStatuses(transfer.transfer_status);
  }, [transfer]);

  React.useEffect(() => {
    setStatus('');
    setConfirming(false);
  }, [transfer]);

  // Iconsax status icons
  const statusMeta = {
    pending: {
      label: 'Pending (in progress)',
      icon: <Clock color="#F5A623" variant="Bold" size={32} />,
      color: 'warning'
    },
    received: {
      label: 'Received (stock updated)',
      icon: <TickCircle color="#43A047" variant="Bold" size={32} />,
      color: 'success'
    },
    rejected: {
      label: 'Rejected (reversed)',
      icon: <CloseCircle color="#D32F2F" variant="Bold" size={32} />,
      color: 'error'
    }
  };

  // Show clear transition in confirmation
  const transitionDisplay = () => (
    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
      {statusMeta[transfer?.transfer_status]?.icon}
      <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
        {statusMeta[transfer?.transfer_status]?.label}
      </Typography>
      <ArrowCircleRight color="#616161" variant="Broken" size={28} />
      {statusMeta[status]?.icon}
      <Typography variant="body2" color="text.primary" sx={{ mx: 1 }}>
        {statusMeta[status]?.label}
      </Typography>
    </Stack>
  );

  // Contextual info
  const getStatusInfo = () => {
    if (status === 'received') {
      return (
        <Stack direction="row" alignItems="center" spacing={1}>
          <TickCircle color="#76CB29" variant="Outline" size={24} />
          <Typography>
            Items will be stocked into the <b>destination location</b> automatically.
          </Typography>
        </Stack>
      );
    }
    if (status === 'pending') {
      return (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Clock color="#F5A623" variant="Outline" size={24} />
          <Typography>
            Transfer remains <b>in progress</b>. No stock change applied yet.
          </Typography>
        </Stack>
      );
    }
    if (status === 'rejected') {
      return (
        <Stack direction="row" alignItems="center" spacing={1}>
          <CloseCircle color="#D32F2F" variant="Outline" size={24} />
          <Typography>
            Transfer will be <b>cancelled</b> and items restocked{' '}
            {transfer?.transfer_status === 'received' ? 'back from destination to origin' : 'to origin location'}.
          </Typography>
        </Stack>
      );
    }
    return '';
  };
  const finalizeUpdate = async () => {
    setLoading(true);
    try {
      const res = await updateTransferStatus(transfer.transfer_id, status);
      if (res.success) {
        toast.success(res.message || 'Stock transfer status updated');
        onActionDone();
        handleClose();
      } else {
        toast.error(res.message || 'Failed updating');
        onActionDone();
      }
    } catch (err) {
      console.log(err);
      toast.error(err.message || err.error || 'API error');
    } finally {
      setLoading(false);
      setConfirming(false);
      onActionDone();
    }
  };

  const handleUpdate = () => {
    if (!status) {
      toast.error('Please select a status');
      return;
    }
    if (!transfer?.transfer_id) {
      toast.error('No valid transfer selected');
      return;
    }
    setConfirming(true);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{confirming ? 'Confirm Status Change' : 'Set Stock Transfer Status'}</DialogTitle>

      <DialogContent dividers>
        {!confirming ? (
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)} disabled={allowedStatuses.length === 0}>
                {allowedStatuses.map((s) => (
                  <MenuItem key={s} value={s}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {statusMeta[s]?.icon}
                      <Typography>{statusMeta[s]?.label || s}</Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        ) : (
          <Box
            sx={{
              p: 2,
              border: '2px solid',
              borderColor: `${statusMeta[status]?.color}.main`,
              borderRadius: 2,
              // backgroundColor: status === 'rejected' ? 'error.light' : status === 'received' ? 'success.light' : 'warning.light',
              boxShadow: 2,
              mb: 2
            }}
          >
            {transitionDisplay()}
            <Typography variant="h6" sx={{ textTransform: 'capitalize', mb: 1 }}>
              Are you sure you want to change status?
            </Typography>
            <Box>{getStatusInfo()}</Box>
            <Typography variant="caption" mt={2} color="text.disabled">
              Transfer ID: #{transfer?.transfer_id}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {!confirming ? (
          <>
            <Button onClick={handleClose} color="inherit">
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              variant="contained"
              color={statusMeta[status]?.color || 'primary'}
              disabled={!status || status === transfer?.transfer_status}
              sx={{ color: '#fff' }}
            >
              {status ? `Mark as ${statusMeta[status]?.label.split(' ')}` : 'Update'}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setConfirming(false)} color="inherit" disabled={loading}>
              Back
            </Button>
            <Button onClick={finalizeUpdate} variant="contained" color={statusMeta[status]?.color || 'primary'} disabled={loading}>
              {loading ? 'Updating...' : 'Confirm Change'}
            </Button>
          </>
        )}
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
