import PropTypes from 'prop-types';

// material-ui
import Modal from '@mui/material/Modal';

// project imports
import FormAddSale from './FormAddSale'; // <-- sales form instead of adjustment
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

// ==============================|| SALE ADD / EDIT MODAL ||============================== //

export default function SalesModal({ open, modalToggler, sale, actionDone }) {
  const closeModal = () => modalToggler(false);

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-sale-add-label"
          aria-describedby="modal-sale-add-description"
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
              <FormAddSale sale={sale || null} closeModal={closeModal} actionDone={actionDone} />
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

SalesModal.propTypes = {
  open: PropTypes.bool,
  modalToggler: PropTypes.func,
  sale: PropTypes.any,
  actionDone: PropTypes.func
};
