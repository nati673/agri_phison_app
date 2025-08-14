import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Modal from '@mui/material/Modal';

// project imports
import FormProductAdd from './FormProductEdit';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// ==============================|| Product ADD / EDIT ||============================== //

export default function ProductModal({ open, modalToggler, Product, actionDone }) {
  const closeModal = () => modalToggler(false);

  const ProductForm = <FormProductAdd product={Product || null} closeModal={closeModal} actionDone={actionDone} />;

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-Product-add-label"
          aria-describedby="modal-Product-add-description"
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{ width: `calc(100% - 48px)`, minWidth: 340, maxWidth: 880, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar sx={{ maxHeight: `calc(100vh - 48px)`, '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
              {ProductForm}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

ProductModal.propTypes = { open: PropTypes.bool, modalToggler: PropTypes.func, Product: PropTypes.any };
