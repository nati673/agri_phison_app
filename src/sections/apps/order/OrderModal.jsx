import PropTypes from 'prop-types';
import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Modal from '@mui/material/Modal';

import FormAddOrder from './FormAddOrder'; 
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// ==============================|| Order ADD / EDIT MODAL ||============================== //

export default function OrderModal({ open, modalToggler, order, actionDone }) {
  const closeModal = () => modalToggler(false);

  const OrderForm = <FormAddOrder order={order || null} closeModal={closeModal} actionDone={actionDone} />;

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-order-add-label"
          aria-describedby="modal-order-add-description"
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
              padding: 1
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
              {OrderForm}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

OrderModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  order: PropTypes.any,
  actionDone: PropTypes.func
};
