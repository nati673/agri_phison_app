// ProfileImageUpload.js
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, FormLabel, Stack, TextField, Typography, useTheme } from '@mui/material';
import { Camera } from 'iconsax-react';
import { ThemeMode } from 'config';
// import { ThemeMode } from 'themes/config'; // Adjust to your project setup

const ProfileImageUpload = ({ profileImageUrl, setSelectedImage }) => {
  const theme = useTheme();
  const [avatar, setAvatar] = useState(profileImageUrl);

  useEffect(() => {
    if (!profileImageUrl) return;
    setAvatar(profileImageUrl);
  }, [profileImageUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Stack spacing={2.5} alignItems="center" sx={{ m: 3 }}>
        <FormLabel
          htmlFor="change-avatar"
          sx={{
            position: 'relative',
            borderRadius: '50%',
            overflow: 'hidden',
            '&:hover .MuiBox-root': { opacity: 1 },
            cursor: 'pointer'
          }}
        >
          <Avatar alt="User Avatar" src={avatar} sx={{ width: 76, height: 76 }} />
          <Box
            className="MuiBox-root"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: theme.palette.mode === ThemeMode.DARK ? 'rgba(255, 255, 255, 0.75)' : 'rgba(0, 0, 0, 0.65)',
              width: '100%',
              height: '100%',
              opacity: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'opacity 0.3s ease'
            }}
          >
            <Stack spacing={0.5} alignItems="center">
              <Camera style={{ color: theme.palette.secondary.lighter, fontSize: '1.5rem' }} />
              <Typography sx={{ color: 'secondary.lighter' }} variant="caption">
                Upload
              </Typography>
            </Stack>
          </Box>
        </FormLabel>

        <TextField
          type="file"
          id="change-avatar"
          variant="outlined"
          sx={{ display: 'none' }}
          inputProps={{ accept: 'image/*' }}
          onChange={handleFileChange}
        />
      </Stack>
    </Box>
  );
};

ProfileImageUpload.propTypes = {
  profileImageUrl: PropTypes.string,
  setSelectedImage: PropTypes.func.isRequired
};

export default ProfileImageUpload;
