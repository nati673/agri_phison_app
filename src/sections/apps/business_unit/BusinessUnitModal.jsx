import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Modal from '@mui/material/Modal';

// project imports
import FormBusinessUnitAdd from './FormBusinessUnitAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { useGetBusinessUnit } from 'api/business_unit';

// ==============================|| BusinessUnit ADD / EDIT ||============================== //

export default function BusinessUnitModal({ open, modalToggler, BusinessUnit }) {
  const { BusinessUnitsLoading: loading } = useGetBusinessUnit();

  const closeModal = () => modalToggler(false);

  const BusinessUnitForm = useMemo(
    () => !loading && <FormBusinessUnitAdd BusinessUnit={BusinessUnit || null} closeModal={closeModal} />,
    // eslint-disable-next-line
    [BusinessUnit, loading]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-BusinessUnit-add-label"
          aria-describedby="modal-BusinessUnit-add-description"
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{ width: `calc(100% - 48px)`, minWidth: 340, maxWidth: 880, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar sx={{ maxHeight: `calc(100vh - 48px)`, '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
              {loading ? (
                <Box sx={{ p: 5 }}>
                  <Stack direction="row" justifyContent="center">
                    <CircularWithPath />
                  </Stack>
                </Box>
              ) : (
                BusinessUnitForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

BusinessUnitModal.propTypes = { open: PropTypes.bool, modalToggler: PropTypes.func, BusinessUnit: PropTypes.any };
