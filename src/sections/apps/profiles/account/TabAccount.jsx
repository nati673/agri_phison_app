import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';

// project-imports
import MainCard from 'components/MainCard';
import { DocumentUpload } from 'iconsax-react';
import { useGetCompanyInfo, updateCompanyInfo } from 'api/company';
import toast from 'react-hot-toast';

export default function TabCompanyAccount() {
  const { companyInfo: list } = useGetCompanyInfo(); // company must include the necessary fields
  const [preview, setPreview] = useState(list?.company_info?.company_logo || null);
  // if (companyInfoLoading) {
  //   return <div>Loading company info...</div>;
  // }
  // if (companyInfoError) {
  //   return <div>Error loading company info</div>;
  // }
  // if (!companyInfo) {
  //   return <div>No company info found</div>;
  // }

  const company = list?.company_info;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      company_name: company?.company_name || '',
      company_email: company?.company_email || '',
      company_phone: company?.company_phone || '',
      company_address: company?.company_address || '',
      website: company?.website || '',
      company_logo: null
    },
    validationSchema: Yup.object({
      company_name: Yup.string().required('Company name is required'),
      company_email: Yup.string().email('Invalid email').required('Email is required')
    }),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('company_name', values.company_name);
        formData.append('company_email', values.company_email);
        formData.append('company_phone', values.company_phone);
        formData.append('company_address', values.company_address);
        formData.append('company_id', company?.company_id);
        formData.append('website', values.website);
        if (values.company_logo) {
          formData.append('company_logo', values.company_logo);
        }

        const response = await updateCompanyInfo(company?.company_id, formData);

        if (response.success) {
          toast.success(response.message);

          if (values.company_logo) {
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error(error.message);
      }
    }
  });

  const handleFileChange = (event) => {
    const file = event.currentTarget.files[0];
    formik.setFieldValue('company_logo', file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MainCard title="General Company Settings">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="company_name">Company Name </InputLabel>
                  <TextField
                    fullWidth
                    id="company_name"
                    name="company_name"
                    value={formik.values.company_name}
                    onChange={formik.handleChange}
                    error={formik.touched.company_name && Boolean(formik.errors.company_name)}
                    helperText={formik.touched.company_name && formik.errors.company_name}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="company_email">Company Email</InputLabel>
                  <TextField
                    fullWidth
                    id="company_email"
                    name="company_email"
                    value={formik.values.company_email}
                    onChange={formik.handleChange}
                    error={formik.touched.company_email && Boolean(formik.errors.company_email)}
                    helperText={formik.touched.company_email && formik.errors.company_email}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="company_phone">Phone</InputLabel>
                  <TextField
                    fullWidth
                    id="company_phone"
                    name="company_phone"
                    value={formik.values.company_phone}
                    onChange={formik.handleChange}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="company_address">Address</InputLabel>
                  <TextField
                    fullWidth
                    id="company_address"
                    name="company_address"
                    value={formik.values.company_address}
                    onChange={formik.handleChange}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="website">Website</InputLabel>
                  <TextField fullWidth id="website" name="website" value={formik.values.website} onChange={formik.handleChange} />
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  <InputLabel>Company Logo</InputLabel>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar src={preview} alt="logo" sx={{ width: 56, height: 56 }} />
                    <label htmlFor="upload-logo">
                      <input accept="image/*" id="upload-logo" type="file" hidden onChange={handleFileChange} />
                      <IconButton component="span" color="primary">
                        <DocumentUpload />
                      </IconButton>
                    </label>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" color="secondary" onClick={formik.handleReset}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Update Info
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
}
