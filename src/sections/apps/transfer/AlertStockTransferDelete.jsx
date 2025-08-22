import PropTypes from 'prop-types';

// material-ui
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import DialogContent from '@mui/material/DialogContent';

// project imports
import Avatar from 'components/@extended/Avatar';
import { PopupTransition } from 'components/@extended/Transitions';

// assets
import { Trash } from 'iconsax-react';
import toast from 'react-hot-toast';
import { deleteTransfer } from 'api/transfer';

// ==============================|| Stock Transfer - DELETE ||============================== //

export default function AlertStockTransferDelete({ id, company_id, title, open, handleClose, actionDone , status}) {
  const deleteHandler = async () => {
    try {
      const res = await deleteTransfer(id, company_id);
      if (res.success) {
        toast.success(res.message || 'Stock transfer deleted successfully');
      }
      handleClose();
      actionDone((prev) => !prev); // refresh parent list
    } catch (error) {
      toast.error(error.message || 'Failed to delete stock transfer');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      keepMounted
      TransitionComponent={PopupTransition}
      maxWidth="xs"
      aria-labelledby="transfer-delete-title"
      aria-describedby="transfer-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar color="warning" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <Trash variant="Bold" />
          </Avatar>

          <Stack spacing={2}>
            <Typography variant="h5" align="center" id="transfer-delete-title">
              Remove this stock transfer?
            </Typography>

            <Typography align="center" id="transfer-delete-description" color="text.secondary">
              {status === 'pending' ? (
                <>
                  You are about to remove{' '}
                  <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    “Transfer ID: {title}”
                  </Typography>
                  .<br />
                  <b>Note:</b> When a pending stock transfer is deleted, any items transferred will automatically be restocked to their
                  original location.
                  <br />
                  If you made a mistake, you can always add a new transfer later.
                </>
              ) : (
                <>
                  <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    This transfer has already been {status} and cannot be deleted.
                  </Typography>
                  <br />
                  When a transfer is <b>approved</b>, the inventory and records are finalized.
                  <br />
                  When it is <b>rejected</b>, items are already reversed back to their original place.
                  <br />
                  <b>Recommendation:</b> Use <span style={{ fontWeight: 600, color: '#1976D2' }}>stock adjustment</span> if you need to
                  correct inventory in these cases.
                </>
              )}
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

AlertStockTransferDelete.propTypes = {
  id: PropTypes.number.isRequired,
  company_id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  actionDone: PropTypes.func.isRequired
};
