import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Modal from '@mui/material/Modal';

// project imports
import FormProductAdd from './FormAddPurchase';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// ==============================|| Product ADD / EDIT ||============================== //

export default function ProductModal({ open, modalToggler, purchase, actionDone }) {
  const closeModal = () => modalToggler(false);
  console.log(purchase);
  const ProductForm = <FormProductAdd purchase={purchase || null} closeModal={closeModal} actionDone={actionDone} />;

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-Product-add-label"
          aria-describedby="modal-Product-add-description"
          sx={{
            '& .MuiPaper-root:focus': { outline: 'none' }
          }}
        >
          <MainCard
            sx={{
              width: '100%',
              height: '80vh',
              minWidth: 0,
              maxWidth: '80%',
              maxHeight: '100%',
              borderRadius: 3, 
              display: 'flex',
              flexDirection: 'column',
              padding: 3
            }}
            modal
            content={false}
          >
            <SimpleBar
              sx={{
                flex: 1,
                '& .simplebar-content': {
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%'
                }
              }}
            >
              {ProductForm}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

ProductModal.propTypes = { open: PropTypes.bool, modalToggler: PropTypes.func, purchase: PropTypes.any };
