import React from 'react';
import {
  Modal,
  Box,
  Typography,
  Stack,
  Divider,
  IconButton,
  MenuItem,
  Button,
  Select,
  FormControl,
  InputLabel,
  TextField,
  CircularProgress
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Edit2, CloseCircle, Key, Clock, NotificationStatus } from 'iconsax-react';
import { updateInvoice } from 'api/invoice';
import toast from 'react-hot-toast';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import FormHelperText from 'themes/overrides/FormHelperText';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' }
];
const accessTypeOptions = [
  { value: 'internal', label: 'Internal' },
  { value: 'public', label: 'Public' }
];

const validationSchema = Yup.object({
  status: Yup.string()
    .oneOf(
      statusOptions.map((o) => o.value),
      'Invalid status'
    )
    .required('Status is required'),
  access_type: Yup.string()
    .oneOf(
      accessTypeOptions.map((o) => o.value),
      'Invalid access type'
    )
    .required('Access type is required'),
  expires_at: Yup.date().nullable().typeError('Must be a valid date')
});

export default function InvoiceShareEditModal({ open, onClose, share }) {
  if (!share) return null;

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="edit-invoice-share-modal" sx={{ zIndex: 1300 }}>
      <Box
        sx={{
          bgcolor: 'background.paper',
          maxWidth: 420,
          mx: 'auto',
          my: 6,
          borderRadius: 3,
          boxShadow: 24,
          px: 3,
          py: 3,
          position: 'relative'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Edit2 size={24} color="#1565c0" />
            <Typography variant="h6" fontWeight={700}>
              Edit Share Info
            </Typography>
          </Stack>
          <IconButton onClick={onClose}>
            <CloseCircle color="#ce1c1c" size={22} />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        <Formik
          initialValues={{
            status: share.share_status || 'active',
            access_type: share.access_type || 'internal',
            expires_at: share.expires_at ? new Date(share.expires_at) : null
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const payload = {
                status: values.status,
                access_type: values.access_type,
                expires_at: values.expires_at ? values.expires_at.toISOString() : null
              };

              const res = await updateInvoice(share.share_id, payload);

              if (res.success) {
                toast.success(res.message);
              }
              onClose();
            } catch (err) {
              toast.error(err.message);
              console.error('Error updating invoice share:', err);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ values, handleChange, setFieldValue, handleBlur, errors, touched, isSubmitting }) => (
            <Form>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel id="access-type-label">
                    <Key size={17} style={{ marginRight: 5, marginBottom: -4 }} />
                    Access Type
                  </InputLabel>
                  <Select
                    labelId="access-type-label"
                    name="access_type"
                    value={values.access_type}
                    label="Access Type"
                    onChange={handleChange}
                  >
                    {accessTypeOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth error={!!errors.status && touched.status}>
                  <InputLabel id="status-label">
                    <NotificationStatus size={17} style={{ marginRight: 5, marginBottom: -4 }} />
                    Share Status
                  </InputLabel>
                  <Select
                    labelId="status-label"
                    name="status"
                    value={values.status}
                    label="Share Status"
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    {statusOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.status && errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                </FormControl>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label={
                      <span>
                        <Clock size={15} style={{ marginRight: 4, marginBottom: -4 }} />
                        Expires At
                      </span>
                    }
                    value={values.expires_at}
                    onChange={(d) => setFieldValue('expires_at', d)}
                    minDateTime={new Date()}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        name="expires_at"
                        onBlur={handleBlur}
                        fullWidth
                        error={!!errors.expires_at && touched.expires_at}
                        helperText={touched.expires_at && errors.expires_at}
                      />
                    )}
                  />
                </LocalizationProvider>

                <Stack direction="row" justifyContent="flex-end" spacing={2}>
                  <Button onClick={onClose} color="inherit" disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    startIcon={isSubmitting ? <CircularProgress size={17} /> : <Edit2 size={18} />}
                    disabled={isSubmitting}
                  >
                    Save
                  </Button>
                </Stack>
              </Stack>
            </Form>
          )}
        </Formik>
      </Box>
    </Modal>
  );
}
