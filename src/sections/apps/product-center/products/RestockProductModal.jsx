import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, Button, Autocomplete, InputLabel } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Formik, Form, getIn } from 'formik';
import * as Yup from 'yup';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetLocation } from 'api/location';
import { requiredInputStyle } from 'components/inputs/requiredInputStyle';
import { renderLocationOption } from 'components/inputs/renderLocationOption';
import { RestockProductForLocation } from 'api/products';
import useAuth from 'hooks/useAuth';
import toast from 'react-hot-toast';

// Restock product validation schema
const RestockSchema = Yup.object().shape({
  location_id: Yup.string().required('Location is required.'),
  unit_price: Yup.number()
    .typeError('Selling price must be a number.')
    .required('Selling price is required.')
    .min(0, 'Must be zero or positive.'),
  purchase_price: Yup.number()
    .typeError('Purchase price must be a number.')
    .required('Purchase price is required.')
    .min(0, 'Must be zero or positive.'),
  quantity: Yup.number().typeError('Quantity must be a number.').required('Quantity is required.').min(0, 'Must be zero or positive.'),
  min_quantity: Yup.number()
    .typeError('Minimum quantity must be a number.')
    .required('Minimum quantity is required.')
    .min(0, 'Must be zero or positive.'),
  max_quantity: Yup.number().typeError('Max quantity must be a number.').nullable(true),
  expires_at: Yup.string().nullable(true),
  manufacture_date: Yup.string().nullable(true)
});

// Initial form values
const initialValues = {
  business_unit_id: '',
  location_id: '',
  unit_price: '',
  purchase_price: '',
  quantity: '',
  min_quantity: 5,
  max_quantity: '',
  expires_at: '',
  manufacture_date: ''
};

// Main modal component
export default function RestockProductModal({ open, onClose, product, companyId }) {
  const { BusinessUnits } = useGetBusinessUnit();
  const { locations } = useGetLocation();
  const { user } = useAuth();
  const bu = BusinessUnits?.find((b) => b.business_unit_id === product?.business_unit_id);

  const locationOptions = bu
    ? (bu.locations || []).filter((loc) => loc.location_type !== 'branch')
    : (locations || []).filter((loc) => loc.location_type !== 'branch');

  // Submit handler
  async function handleRestockSubmit(values, actions) {
    try {
      const response = await RestockProductForLocation(product?.product_id, {
        ...values,
        business_unit_id: product.business_unit_id,
        company_id: user?.company_id
      });

      if (response.success) {
        toast.success(response.message);
      }
      actions.setSubmitting(false);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Restock failed, please try again.');
      actions.setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Restock Product</DialogTitle>
      <Formik initialValues={initialValues} validationSchema={RestockSchema} onSubmit={handleRestockSubmit}>
        {({ values, setFieldValue, errors, touched, handleChange, handleBlur, isSubmitting, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <InputLabel>Business Unit</InputLabel>
                  <TextField
                    value={BusinessUnits.find((b) => b.business_unit_id === product.business_unit_id)?.unit_name || 'Unknown'}
                    disabled
                    fullWidth
                    name="business_unit_id"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InputLabel>Location</InputLabel>
                  <Autocomplete
                    options={locationOptions}
                    getOptionLabel={(option) => `${option.location_name || ''} (${option.location_type || ''})`}
                    value={locationOptions.find((l) => l.location_id === values.location_id) || null}
                    onChange={(e, newValue) => setFieldValue('location_id', newValue?.location_id || '')}
                    renderOption={renderLocationOption}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select location"
                        name="location_id"
                        error={!!getIn(touched, 'location_id') && !!getIn(errors, 'location_id')}
                        helperText={getIn(touched, 'location_id') && getIn(errors, 'location_id')}
                        onBlur={handleBlur}
                        fullWidth
                        sx={requiredInputStyle}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <InputLabel>Selling Price (ETB)</InputLabel>
                  <TextField
                    name="unit_price"
                    type="number"
                    placeholder="Selling price"
                    fullWidth
                    value={values.unit_price}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!getIn(touched, 'unit_price') && !!getIn(errors, 'unit_price')}
                    helperText={getIn(touched, 'unit_price') && getIn(errors, 'unit_price')}
                    sx={requiredInputStyle}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <InputLabel>Purchase Price (ETB)</InputLabel>
                  <TextField
                    name="purchase_price"
                    type="number"
                    placeholder="Purchase price"
                    fullWidth
                    value={values.purchase_price}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!getIn(touched, 'purchase_price') && !!getIn(errors, 'purchase_price')}
                    helperText={getIn(touched, 'purchase_price') && getIn(errors, 'purchase_price')}
                    sx={requiredInputStyle}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <InputLabel>Quantity</InputLabel>
                  <TextField
                    name="quantity"
                    type="number"
                    placeholder="Quantity"
                    fullWidth
                    value={values.quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!getIn(touched, 'quantity') && !!getIn(errors, 'quantity')}
                    helperText={getIn(touched, 'quantity') && getIn(errors, 'quantity')}
                    sx={requiredInputStyle}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <InputLabel>Min Quantity</InputLabel>
                  <TextField
                    name="min_quantity"
                    type="number"
                    placeholder="Min quantity"
                    fullWidth
                    value={values.min_quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    sx={requiredInputStyle}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <InputLabel>Max Quantity</InputLabel>
                  <TextField
                    name="max_quantity"
                    type="number"
                    placeholder="Max quantity"
                    fullWidth
                    value={values.max_quantity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InputLabel>Expiry Date</InputLabel>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={values.expires_at ? new Date(values.expires_at) : null}
                      onChange={(nv) => setFieldValue('expires_at', nv ? nv.toISOString() : '')}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <InputLabel>Manufacture Date</InputLabel>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={values.manufacture_date ? new Date(values.manufacture_date) : null}
                      onChange={(nv) => setFieldValue('manufacture_date', nv ? nv.toISOString() : '')}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="secondary" disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                Re-stock
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
