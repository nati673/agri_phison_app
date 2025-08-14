import { useState, useEffect, useRef } from 'react';
import { Box, Grid, Typography, Card, CardContent, CircularProgress, Button } from '@mui/material';
import QRCode from 'react-qr-code';
import { GenPairingToken } from 'api/pair'; // your axios call

export default function ParingAndDevices() {
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const timerRef = useRef(null);

  const fetchToken = async () => {
    try {
      setLoading(true);
      const data = await GenPairingToken();
      setTokenData(data);

      // Clear previous timer if any
      if (timerRef.current) clearTimeout(timerRef.current);

      // Calculate milliseconds until 10 seconds before expiry
      const expiresAt = new Date(data.expires_at).getTime();
      const now = Date.now();
      const msUntilRefresh = expiresAt - now - 10 * 1000; // 10 seconds before expiry

      if (msUntilRefresh > 0) {
        timerRef.current = setTimeout(() => {
          fetchToken();
        }, msUntilRefresh);
      } else {
        // If already expired or close to expiring, fetch immediately
        fetchToken();
      }
    } catch (err) {
      console.error('Error generating pairing token:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToken();

    // Clear timer on unmount
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleRegenerate = () => {
    fetchToken();
  };

  return (
    <Grid container spacing={3} justifyContent="center" alignItems="center" minHeight="60vh">
      <Grid item xs={12} md={6}>
        <Card sx={{ p: 3, textAlign: 'center', boxShadow: 0}}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Device Pairing QR Code
          </Typography>

          {loading ? (
            <CircularProgress />
          ) : tokenData ? (
            <>
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  p: 2,
                  display: 'inline-block',
                  borderRadius: 2,
                  boxShadow: 1,
                  mb: 2
                }}
              >
                <QRCode value={tokenData.pairing_token} size={180} />
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Token: <strong>{tokenData.pairing_token}</strong>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Expires at: {new Date(tokenData.expires_at).toLocaleString()}
              </Typography>

              {/* <Box mt={3}>
                  <Button variant="contained" color="primary" onClick={handleRegenerate}>
                    Regenerate Token
                  </Button>
                </Box> */}
            </>
          ) : (
            <Typography color="error">Failed to load token.</Typography>
          )}
        </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
