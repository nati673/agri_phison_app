import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Modal from '@mui/material/Modal';

// project imports
import FormCustomerAdd from './FormRoleAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { useGetRoles } from 'api/access_control';

// ==============================|| CUSTOMER ADD / EDIT ||============================== //

export default function RoleModal({ open, modalToggler, role }) {
  const { rolesLoading: loading } = useGetRoles();

  const closeModal = () => modalToggler(false);

  const roleForm = useMemo(
    () => !loading && <FormCustomerAdd role={role || null} closeModal={closeModal} />,
    // eslint-disable-next-line
    [role, loading]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-role-add-label"
          aria-describedby="modal-role-add-description"
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
                roleForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

RoleModal.propTypes = { open: PropTypes.bool, modalToggler: PropTypes.func, role: PropTypes.any };
