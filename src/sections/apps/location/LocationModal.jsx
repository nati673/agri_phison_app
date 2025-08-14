import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Modal from '@mui/material/Modal';

// project imports
import FormLocationAdd from './FormLocationAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { useGetLocation } from 'api/location';

// ==============================|| Location ADD / EDIT ||============================== //

export default function LocationModal({ open, modalToggler, Location }) {
  const { LocationsLoading: loading } = useGetLocation();

  const closeModal = () => modalToggler(false);

  const LocationForm = useMemo(
    () => !loading && <FormLocationAdd Location={Location || null} closeModal={closeModal} />,
    // eslint-disable-next-line
    [Location, loading]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-Location-add-label"
          aria-describedby="modal-Location-add-description"
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
                LocationForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

LocationModal.propTypes = { open: PropTypes.bool, modalToggler: PropTypes.func, Location: PropTypes.any };
