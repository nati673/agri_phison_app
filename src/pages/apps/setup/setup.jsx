import React, { useState, useCallback, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Paper, Typography, Button, TextField, MenuItem, Fade, Grid, Stack, InputAdornment } from '@mui/material';
import { Building4, Call, GlobalSearch, Location, LocationAdd, User } from 'iconsax-react';
import { setupCompany } from 'api/setup';
import useAuth from 'hooks/useAuth';
import MainCard from 'components/MainCard';
import SingleFileUpload from 'components/third-party/dropzone/SingleFile';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router';

const steps = [
  {
    label: 'Company Info',
    Icon: User,
    description: 'Provide your company’s core details including name, contact info, address, website, and brand logos.',
    heading: 'Tell us about your company',
    subheading: 'This helps personalize your experience and get things set up the right way.'
  },
  {
    label: 'Location Info',
    Icon: Location,
    description: 'Add key company locations like warehouses, branches, or sales rooms with their addresses and contact numbers.',
    heading: 'Where is your company located?',
    subheading: 'Provide one or more physical locations to help us organize your structure.'
  },
  {
    label: 'Business Units',
    Icon: Building4,
    description: 'Set up your business units by defining departments, their codes, descriptions, and activity status.',
    heading: 'Define your business units',
    subheading: 'Departments or units help structure your operations clearly.'
  }
];

const CompanyForm = ({ companyInfo, handleChange, logoFile, setLogoFile }) => (
  <Box sx={{ maxWidth: 600 }}>
    <TextField
      label="Company Phone"
      name="company_phone"
      value={companyInfo.company_phone || ''}
      onChange={handleChange}
      required
      fullWidth
      margin="normal"
      placeholder="+251 9XX XXX XXX"
      InputLabelProps={{ shrink: true }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Call />
          </InputAdornment>
        )
      }}
    />
    <TextField
      label="Company Address"
      name="company_address"
      value={companyInfo.company_address || ''}
      onChange={handleChange}
      fullWidth
      margin="normal"
      required
      multiline
      rows={2}
      InputLabelProps={{ shrink: true }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <LocationAdd />
          </InputAdornment>
        )
      }}
    />
    <TextField
      label="Website (Optional)"
      name="website"
      value={companyInfo.website || ''}
      onChange={handleChange}
      fullWidth
      margin="normal"
      placeholder="https://yourcompany.com"
      InputLabelProps={{ shrink: true }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <GlobalSearch />
          </InputAdornment>
        )
      }}
    />
    <Grid item xs={12} mb={2}>
      <MainCard title="Company Logo">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Stack spacing={1.5} alignItems="center">
              <SingleFileUpload file={logoFile} setFile={setLogoFile} error={false} />
            </Stack>
          </Grid>
        </Grid>
      </MainCard>
    </Grid>
  </Box>
);

const LocationForm = ({ locationInfo, handleLocationChange, removeLocation, addLocation }) => (
  <Box sx={{ maxWidth: 600 }}>
    {locationInfo.map((loc, idx) => (
      <Paper key={idx} variant="outlined" sx={{ p: 3, mb: 3, position: 'relative', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Location #{idx + 1}
        </Typography>
        <TextField
          label="Location Name"
          name="location_name"
          value={loc.location_name}
          onChange={(e) => handleLocationChange(idx, e)}
          fullWidth
          margin="normal"
          placeholder="e.g. Addis Ababa, Bahir Dar, Hawassa"
          required
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          select
          label="Location Type"
          name="location_type"
          value={loc.location_type}
          onChange={(e) => handleLocationChange(idx, e)}
          fullWidth
          margin="normal"
          required
          InputLabelProps={{ shrink: true }}
        >
          <MenuItem value="warehouse">Warehouse</MenuItem>
          <MenuItem value="sales_room">Sales Room</MenuItem>
          <MenuItem value="branch">Branch</MenuItem>
        </TextField>
        <TextField
          label="Address (Optional)"
          name="address"
          value={loc.address}
          onChange={(e) => handleLocationChange(idx, e)}
          fullWidth
          margin="normal"
          multiline
          rows={2}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Phone Number"
          name="phone_number"
          value={loc.phone_number}
          onChange={(e) => handleLocationChange(idx, e)}
          fullWidth
          required
          margin="normal"
          placeholder="+251 9XX XXX XXX"
          InputLabelProps={{ shrink: true }}
        />
        {locationInfo.length > 1 && (
          <a style={{ position: 'absolute', top: 8, right: 8, color: 'Red', cursor: 'pointer' }} onClick={() => removeLocation(idx)}>
            Remove
          </a>
        )}
      </Paper>
    ))}
    <Button variant="contained" color="success" onClick={addLocation}>
      + Add Another Location
    </Button>
  </Box>
);

const BusinessUnitsForm = ({ businessUnits, handleBusinessUnitChange, removeBusinessUnit, addBusinessUnit }) => (
  <Box sx={{ maxWidth: 600 }}>
    {businessUnits.map((unit, idx) => (
      <Paper key={idx} variant="outlined" sx={{ p: 3, mb: 3, position: 'relative', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Business Unit #{idx + 1}
        </Typography>
        <TextField
          label="Unit Name"
          name="unit_name"
          value={unit.unit_name}
          onChange={(e) => handleBusinessUnitChange(idx, e)}
          fullWidth
          margin="normal"
          required
          placeholder="e.g. Seed Store, Fertilizer Sales Room, Veterinary Sales Room"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Unit Code (Optional)"
          name="unit_code"
          value={unit.unit_code}
          onChange={(e) => handleBusinessUnitChange(idx, e)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Description (Optional)"
          name="description"
          value={unit.description}
          onChange={(e) => handleBusinessUnitChange(idx, e)}
          fullWidth
          margin="normal"
          multiline
          rows={3}
          placeholder="Briefly describe this unit"
          InputLabelProps={{ shrink: true }}
        />
        {businessUnits.length > 1 && (
          <a style={{ position: 'absolute', top: 8, right: 8, color: 'Red', cursor: 'pointer' }} onClick={() => removeBusinessUnit(idx)}>
            Remove
          </a>
        )}
      </Paper>
    ))}
    <Button variant="contained" color="success" onClick={addBusinessUnit}>
      + Add Another Business Unit
    </Button>
  </Box>
);

export default function OneFormAtATimeWizard() {
  const [activeStep, setActiveStep] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const { user, company } = useAuth();
  const theme = useTheme();
  const [logoFile, setLogoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [companyInfo, setCompanyInfo] = useState({ company_phone: '', company_address: '', website: '' });
  const [locationInfo, setLocationInfo] = useState([{ location_name: '', location_type: '', address: '', phone_number: '' }]);
  const [businessUnits, setBusinessUnits] = useState([{ unit_name: '', unit_code: '', description: '' }]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setCompanyInfo((prev) => ({ ...prev, [name]: value }));
  }, []);

  // useeaffect

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (company?.setup_status?.status === 'setup_complete') {
      navigate('/dashboard/default', {
        state: {
          from: location.pathname
        },
        replace: true
      });
    }
  }, [company]);

  const handleLocationChange = (index, e) => {
    const { name, value } = e.target;
    setLocationInfo((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const handleBusinessUnitChange = (index, e) => {
    const { name, value } = e.target;
    setBusinessUnits((prev) => {
      const updated = [...prev];
      updated[index][name] = value;
      return updated;
    });
  };

  const addLocation = () => setLocationInfo([...locationInfo, { location_name: '', location_type: '', address: '', phone_number: '' }]);
  const removeLocation = (index) => locationInfo.length > 1 && setLocationInfo(locationInfo.filter((_, i) => i !== index));

  const addBusinessUnit = () => setBusinessUnits([...businessUnits, { unit_name: '', unit_code: '', description: '' }]);
  const removeBusinessUnit = (index) => businessUnits.length > 1 && setBusinessUnits(businessUnits.filter((_, i) => i !== index));

  const goToStep = (step) => {
    if (step !== activeStep) {
      setFadeIn(false);
      setTimeout(() => {
        setActiveStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setFadeIn(true);
      }, 300);
    }
  };

  const validateStep = () => {
    if (activeStep === 0) {
      const { company_phone, company_address } = companyInfo;

      if (!company_phone.trim()) {
        toast.error('Company phone is required.');
        return false;
      }
      if (!company_address.trim()) {
        toast.error('Company address is required.');
        return false;
      }
      if (!logoFile) {
        toast.error('Company logo is required.');
        return false;
      }
    }

    if (activeStep === 1) {
      for (let i = 0; i < locationInfo.length; i++) {
        const { location_name, location_type, phone_number } = locationInfo[i];

        // Check each field one by one, in order, for each location
        if (!location_name.trim()) {
          toast.error(`Please enter Location Name for Location #${i + 1}`);
          return false; // stops immediately here, so user fixes this first
        }
        if (!location_type) {
          toast.error(`Please select Location Type for Location #${i + 1}`);
          return false;
        }
        if (!phone_number.trim()) {
          toast.error(`Please enter Phone Number for Location #${i + 1}`);
          return false;
        }
      }
    }
    if (activeStep === 2) {
      for (let i = 0; i < businessUnits.length; i++) {
        const { unit_name } = businessUnits[i];
        if (!unit_name.trim()) {
          toast.error(`Please enter Unit Name for Business Unit #${i + 1}`);
          return false;
        }
      }
    }

    return true;
  };
  const handleNext = () => {
    if (!validateStep()) return; // Block progression if invalid

    if (activeStep < steps.length - 1) {
      goToStep(activeStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => activeStep > 0 && goToStep(activeStep - 1);

  const handleSubmit = async () => {
    setIsLoading(true); // start loading

    try {
      const formData = new FormData();
      Object.entries(companyInfo).forEach(([key, value]) => formData.append(key, value));
      if (logoFile && logoFile.length > 0) formData.append('company_logo', logoFile[0]);
      formData.append('user_id', JSON.stringify(user.user_id));
      formData.append('locations', JSON.stringify(locationInfo));
      formData.append('business_units', JSON.stringify(businessUnits));

      const result = await setupCompany(formData);

      if (result.status) {
        toast.success(result.message);

        setTimeout(() => {
          navigate('/dashboard/default', {
            state: {
              from: location.pathname
            },
            replace: true
          });
        }, 2000);
      } else {
        toast.error(result.error || 'Submission failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false); // stop loading
    }
  };
  const renderStepForm = () => {
    const { heading, subheading } = steps[activeStep];
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" mb={1}>
          {heading}
        </Typography>
        <Typography variant="body1" color="textSecondary" mb={3}>
          {subheading}
        </Typography>
        {(() => {
          switch (activeStep) {
            case 0:
              return <CompanyForm companyInfo={companyInfo} handleChange={handleChange} logoFile={logoFile} setLogoFile={setLogoFile} />;
            case 1:
              return (
                <LocationForm
                  locationInfo={locationInfo}
                  handleLocationChange={handleLocationChange}
                  removeLocation={removeLocation}
                  addLocation={addLocation}
                />
              );
            case 2:
              return (
                <BusinessUnitsForm
                  businessUnits={businessUnits}
                  handleBusinessUnitChange={handleBusinessUnitChange}
                  removeBusinessUnit={removeBusinessUnit}
                  addBusinessUnit={addBusinessUnit}
                />
              );
            default:
              return null;
          }
        })()}
      </Box>
    );
  };
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
      <Box
        sx={{
          bgcolor: '#2AB939',
          color: 'white',
          width: { xs: '100%', sm: '40%', md: '35%' },
          p: 6,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          {steps.map(({ label, Icon, description }, idx) => (
            <Box
              key={label}
              sx={{
                mb: 4,
                cursor: 'pointer',
                bgcolor: activeStep === idx ? '#032f07' : 'green',
                p: 2,
                borderRadius: 2,
                opacity: activeStep === idx ? 1 : 0.6,
                transform: activeStep === idx ? 'scale(1.02)' : 'scale(1)',
                transition: '0.3s ease'
              }}
              onClick={() => goToStep(idx)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Icon size={24} />
                <Typography variant="h6" fontWeight={600}>
                  {label}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ ml: 4, mt: 0.5 }}>
                {description}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box>
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            size="large"
            onClick={handleNext}
            disabled={isLoading}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 'bold', mb: 2 }}
          >
            {isLoading ? 'Submitting...' : activeStep === steps.length - 1 ? 'Finish Setup' : 'Next Step'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{ borderRadius: 3, textTransform: 'none' }}
            >
              Back
            </Button>
            <Button variant="outlined" color="inherit" onClick={() => goToStep(0)} sx={{ borderRadius: 3, textTransform: 'none' }}>
              Restart
            </Button>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.dark : theme.palette.light,
          p: { xs: 3, sm: 6 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          overflowY: 'auto',
          height: { xs: 'auto', sm: '100vh' }
        }}
      >
        <Fade in={fadeIn} timeout={300}>
          <Box sx={{ width: '100%', maxWidth: 600 }}>{renderStepForm()}</Box>
        </Fade>
      </Box>
    </Box>
  );
}
