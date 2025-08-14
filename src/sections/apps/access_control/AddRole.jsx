import { useEffect, useMemo, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';

// project imports
import FormRoleAdd from './FormRoleAdd';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { handlerRoleDialog, useGetRole, useGetRoleMaster } from 'api/customer';

// ==============================|| ROLE - ADD / EDIT MODAL ||============================== //

export default function AddRole() {
  const { customerMasterLoading: roleDialogLoading, customerMaster: roleDialog } = useGetRoleMaster();
  const { customersLoading: rolesLoading, customers: roles } = useGetRole();

  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    if (roleDialog?.modal && typeof roleDialog.modal === 'number' && Array.isArray(roles)) {
      const roleId = roleDialog.modal;
      const foundRole = roles.find((role) => role.role_id === roleId);
      setSelectedRole(foundRole || null);
    } else {
      setSelectedRole(null);
    }
  }, [roleDialog, roles]);

  const closeModal = () => handlerRoleDialog(false);

  const roleForm = useMemo(() => {
    if (!rolesLoading && !roleDialogLoading) {
      return <FormRoleAdd customer={selectedRole} closeModal={closeModal} />;
    }
    return null;
  }, [rolesLoading, roleDialogLoading, selectedRole]);

  return (
    <>
      {roleDialog?.modal && (
        <Modal
          open
          onClose={closeModal}
          aria-labelledby="modal-role-add-label"
          aria-describedby="modal-role-add-description"
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{
              width: `calc(100% - 48px)`,
              minWidth: 340,
              maxWidth: 880,
              height: 'auto',
              maxHeight: 'calc(100vh - 48px)'
            }}
            modal
            content={false}
          >
            <SimpleBar
              sx={{
                maxHeight: `calc(100vh - 48px)`,
                '& .simplebar-content': { display: 'flex', flexDirection: 'column' }
              }}
            >
              {rolesLoading || roleDialogLoading ? (
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
