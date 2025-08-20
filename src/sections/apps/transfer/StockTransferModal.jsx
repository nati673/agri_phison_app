import PropTypes from 'prop-types';

// material-ui
import Modal from '@mui/material/Modal';

// project imports
import FormAddTransfer from './FormStockTransferEdit'; // <-- new stock transfer form
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// ==============================|| STOCK TRANSFER ADD / EDIT MODAL ||============================== //

export default function StockTransferModal({ open, modalToggler, transfer, actionDone }) {
  const closeModal = () => modalToggler(false);

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-transfer-add-label"
          aria-describedby="modal-transfer-add-description"
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
              padding: 5
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
              <FormAddTransfer transfer={transfer || null} closeModal={closeModal} actionDone={actionDone} />
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

StockTransferModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  transfer: PropTypes.any,
  actionDone: PropTypes.func
};
