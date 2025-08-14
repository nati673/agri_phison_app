import { useEffect, useMemo, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';

// project-imports
import FormBusinessUnitAdd from './FormBusinessUnitAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { handlerBusinessUnitDialog, useGetBusinessUnit, useGetBusinessUnitMaster } from 'api/business_unit';

// ==============================|| BusinessUnit - ADD / EDIT ||============================== //

export default function AddBusinessUnit() {
  const { BusinessUnitMasterLoading, BusinessUnitMaster } = useGetBusinessUnitMaster();
  const { BusinessUnitsLoading: loading, BusinessUnits } = useGetBusinessUnit();
  const isModal = BusinessUnitMaster?.modal;

  const [list, setList] = useState(null);

  useEffect(() => {
    if (BusinessUnitMaster?.modal && typeof BusinessUnitMaster.modal === 'number') {
      const newList = BusinessUnits.filter((info) => info.id === isModal && info)[0];
      setList(newList);
    } else {
      setList(null);
    }
    // eslint-disable-next-line
  }, [BusinessUnitMaster]);

  const closeModal = () => handlerBusinessUnitDialog(false);

  // eslint-disable-next-line
  const BusinessUnitForm = useMemo(
    () => !loading && !BusinessUnitMasterLoading && <FormBusinessUnitAdd BusinessUnit={list} closeModal={closeModal} />,
    [list, loading, BusinessUnitMasterLoading]
  );

  return (
    <>
      {isModal && (
        <Modal
          open={true}
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
            <SimpleBar
              sx={{
                maxHeight: `calc(100vh - 48px)`,
                '& .simplebar-content': { display: 'flex', flexDirection: 'column' }
              }}
            >
              {loading && BusinessUnitMasterLoading ? (
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
