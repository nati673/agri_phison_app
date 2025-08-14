import PropTypes from 'prop-types';

// MUI
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { TickCircle } from 'iconsax-react';

export default function RoleView({ data }) {
  const theme = useTheme();
  const permissions = Array.isArray(data?.permissions) ? data.permissions.filter(Boolean) : [];

  return (
    <Grid container>
      <Grid item xs={12}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            Capabilities of the <strong>{data?.role_name || 'Unknown'}</strong> Role
          </Typography>

          {permissions.length > 0 ? (
            <Stack spacing={1}>
              {permissions.map((perm) => (
                <Box
                  key={perm.permission_id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    pl: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100]
                  }}
                >
                  <TickCircle size={20} color={theme.palette.success.main} />
                  <Typography variant="body2" color="text.primary">
                    {`${perm.action || '—'} → ${perm.module_name || '—'}`}
                  </Typography>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="error">
              No permissions assigned to this role.
            </Typography>
          )}
        </Box>
      </Grid>
    </Grid>
  );
}

RoleView.propTypes = {
  data: PropTypes.shape({
    role_name: PropTypes.string,
    permissions: PropTypes.arrayOf(
      PropTypes.shape({
        permission_id: PropTypes.number.isRequired,
        action: PropTypes.string,
        module_name: PropTypes.string
      })
    )
  })
};
