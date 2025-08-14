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
import { deleteProductCategories } from 'api/product_category';
import toast from 'react-hot-toast';

// ==============================|| Category - DELETE ||============================== //

export default function AlertCategoryDelete({ id, company_id, title, open, handleClose }) {
  const deleteHandler = async () => {
    try {
      const CategoryDeleteData = await deleteProductCategories({ category_id: id, company_id });
      if (CategoryDeleteData.success) {
        toast.success(CategoryDeleteData.message);
      }

      handleClose();
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
      aria-labelledby="business-unit-delete-title"
      aria-describedby="business-unit-delete-description"
    >
      <DialogContent sx={{ mt: 2, my: 1 }}>
        <Stack alignItems="center" spacing={3.5}>
          <Avatar color="error" sx={{ width: 72, height: 72, fontSize: '1.75rem' }}>
            <Trash variant="Bold" />
          </Avatar>
          <Stack spacing={2}>
            <Typography variant="h4" align="center" id="business-unit-delete-title">
              Are you sure you want to delete?
            </Typography>
            <Typography align="center" id="business-unit-delete-description">
              By deleting
              <Typography variant="subtitle1" component="span" sx={{ fontWeight: 'bold' }}>
                {' '}
                &quot;{title}&quot;{' '}
              </Typography>
              category, all tasks assigned to it will also be deleted.
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

AlertCategoryDelete.propTypes = {
  id: PropTypes.number.isRequired,
  company_id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired
};
