import { useEffect, useMemo, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';

// project-imports
import FormLocationAdd from './FormLocationAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { handlerLocationDialog, useGetLocation, useGetLocationMaster } from 'api/business_unit';

// ==============================|| Location - ADD / EDIT ||============================== //

export default function AddLocation() {
  const { LocationMasterLoading, LocationMaster } = useGetLocationMaster();
  const { LocationsLoading: loading, Locations } = useGetLocation();
  const isModal = LocationMaster?.modal;

  const [list, setList] = useState(null);

  useEffect(() => {
    if (LocationMaster?.modal && typeof LocationMaster.modal === 'number') {
      const newList = Locations.filter((info) => info.id === isModal && info)[0];
      setList(newList);
    } else {
      setList(null);
    }
    // eslint-disable-next-line
  }, [LocationMaster]);

  const closeModal = () => handlerLocationDialog(false);

  // eslint-disable-next-line
  const LocationForm = useMemo(
    () => !loading && !LocationMasterLoading && <FormLocationAdd Location={list} closeModal={closeModal} />,
    [list, loading, LocationMasterLoading]
  );

  return (
    <>
      {isModal && (
        <Modal
          open={true}
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
            <SimpleBar
              sx={{
                maxHeight: `calc(100vh - 48px)`,
                '& .simplebar-content': { display: 'flex', flexDirection: 'column' }
              }}
            >
              {loading && LocationMasterLoading ? (
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
