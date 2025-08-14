import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useFormik, FormikProvider, Form } from 'formik';
import * as Yup from 'yup';

import {
  Box,
  Button,
  TextField,
  Grid,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormLabel,
  FormHelperText,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Divider,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

import { openSnackbar } from 'api/snackbar'; // Assuming you have this utility
import { createCustomers, updateCustomer } from 'api/customer'; // Your API utils
import toast from 'react-hot-toast';
import useAuth from 'hooks/useAuth';

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' }
  // { value: 'pending', label: 'Pending' }
];

const sexOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
];

const customerTypeOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'organization', label: 'Organization' }
];

const ageGroupOptions = [
  { value: 'Below 35', label: 'Below 35' },
  { value: '35 and Above', label: '35 and Above' }
];

// Initial values aligned with your backend keys
const getInitialValues = (customer) => ({
  company_id: customer?.company_id || '',
  customer_type: customer?.customer_type || '',
  customer_first_name: customer?.customer_first_name || '',
  customer_last_name: customer?.customer_last_name || '',
  organization_name: customer?.organization_name || '',
  customer_phone: customer?.customer_phone || '',
  customer_sex: customer?.customer_sex || 'female',
  customer_age: customer?.customer_age || '',
  customer_address: customer?.customer_address || '',
  status: customer?.status || 'active',
  notes: customer?.notes || ''
});

const validationSchema = Yup.object().shape({
  customer_type: Yup.string().required('Customer Type is required'),
  customer_first_name: Yup.string().max(255).required('First Name is required'),
  customer_last_name: Yup.string(),
  customer_phone: Yup.string(),
  status: Yup.string().required('Status is required'),
  customer_address: Yup.string().max(500),
  notes: Yup.string().max(500),
  customer_sex: Yup.string().oneOf(['male', 'female', 'other'])
  // customer_age: Yup.string()
  //   .oneOf(['Below 35', '35 and Above'], 'Age group must be either Below 35 or 35 and Above')
  //   .required('Age group is required')
});

export default function FormCustomerAdd({ customer, closeModal }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const formik = useFormik({
    initialValues: getInitialValues(customer),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      const payload = { ...values, company_id: user?.company_id };

      try {
        if (customer) {
          const updateResponse = await updateCustomer(customer.customer_id, payload);
          if (updateResponse.success) {
            toast.success(updateResponse.message);
          }
        } else {
          const createResponse = await createCustomers(payload);

          if (createResponse.success) {
            toast.success(createResponse.message);
          }
        }
        closeModal();
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const { errors, touched, getFieldProps, handleSubmit, setFieldValue } = formik;

  return (
    <FormikProvider value={formik}>
      <Form onSubmit={handleSubmit} noValidate autoComplete="off">
        <DialogTitle>{customer ? 'Edit Customer' : 'New Customer'}</DialogTitle>
        <Divider />
        <DialogContent dividers sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={touched.customer_type && Boolean(errors.customer_type)}>
                <InputLabel id="customer_type-label">Customer Type</InputLabel>
                <Select
                  labelId="customer_type-label"
                  id="customer_type"
                  label="customer_type"
                  {...getFieldProps('customer_type')}
                  onChange={(e) => setFieldValue('customer_type', e.target.value)}
                  value={formik.values.customer_type}
                >
                  {customerTypeOptions.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
                {touched.customer_type && errors.customer_type && <FormHelperText>{errors.customer_type}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="customer_first_name"
                label="First Name"
                placeholder="Enter First Name"
                {...getFieldProps('customer_first_name')}
                error={touched.customer_first_name && Boolean(errors.customer_first_name)}
                helperText={touched.customer_first_name && errors.customer_first_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="customer_last_name"
                label="Last Name"
                placeholder="Enter Last Name"
                {...getFieldProps('customer_last_name')}
                error={touched.customer_last_name && Boolean(errors.customer_last_name)}
                helperText={touched.customer_last_name && errors.customer_last_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="organization_name"
                label="Organization Name"
                placeholder="Enter Organization Name"
                {...getFieldProps('organization_name')}
                error={touched.organization_name && Boolean(errors.organization_name)}
                helperText={touched.organization_name && errors.organization_name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="customer_phone"
                label="Phone Number"
                placeholder="Enter Phone Number"
                {...getFieldProps('customer_phone')}
                error={touched.customer_phone && Boolean(errors.customer_phone)}
                helperText={touched.customer_phone && errors.customer_phone}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl component="fieldset" error={touched.customer_sex && Boolean(errors.customer_sex)}>
                <FormLabel component="legend">Sex</FormLabel>
                <RadioGroup
                  row
                  aria-label="customer_sex"
                  {...getFieldProps('customer_sex')}
                  onChange={(e) => setFieldValue('customer_sex', e.target.value)}
                  value={formik.values.customer_sex}
                >
                  {sexOptions.map(({ value, label }) => (
                    <FormControlLabel key={value} value={value} control={<Radio />} label={label} />
                  ))}
                </RadioGroup>
                {touched.customer_sex && errors.customer_sex && <FormHelperText>{errors.customer_sex}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={touched.customer_age && Boolean(errors.customer_age)}>
                <InputLabel id="customer_age-label">Customer Age Group</InputLabel>
                <Select
                  labelId="customer_age-label"
                  id="customer_age"
                  label="customer_age"
                  {...getFieldProps('customer_age')}
                  onChange={(e) => setFieldValue('customer_age', e.target.value)}
                  value={formik.values.customer_age}
                >
                  {ageGroupOptions.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
                {touched.customer_age && errors.customer_age && <FormHelperText>{errors.customer_age}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="customer_address"
                label="Address"
                placeholder="Enter Address"
                multiline
                rows={3}
                {...getFieldProps('customer_address')}
                error={touched.customer_address && Boolean(errors.customer_address)}
                helperText={touched.customer_address && errors.customer_address}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={touched.status && Boolean(errors.status)}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  label="Status"
                  {...getFieldProps('status')}
                  onChange={(e) => setFieldValue('status', e.target.value)}
                  value={formik.values.status}
                >
                  {statusOptions.map(({ value, label }) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
                {touched.status && errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="notes"
                label="Notes"
                placeholder="Additional notes"
                multiline
                rows={3}
                {...getFieldProps('notes')}
                error={touched.notes && Boolean(errors.notes)}
                helperText={touched.notes && errors.notes}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions>
          <Button onClick={closeModal} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {customer ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
}

FormCustomerAdd.propTypes = {
  customer: PropTypes.object,
  closeModal: PropTypes.func.isRequired
};
