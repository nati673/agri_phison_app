import React from 'react';
import { Box, Card, CardContent, Grid, Skeleton, Divider, Typography, Stack } from '@mui/material';
import MainCard from 'components/MainCard';

export function SalesFormSkeleton() {
  return (
    <form>
      {/* <MainCard sx={{ mb: 3, p: 3 }}> */}
      <Skeleton variant="text" width={160} height={40} />
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={7}>
            {[...Array(4)].map((_, idx) => (
              <Grid item xs={12} sm={3} key={idx} sx={{ py: 10 }}>
                <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {[...Array(3)].map((_, idx) => (
        <Card key={idx} variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={2.3}>
                <Skeleton variant="rectangular" height={37} sx={{ borderRadius: 1 }} />
              </Grid>
              {[...Array(4)].map((_, i) => (
                <Grid item xs={6} sm={1.8} key={i}>
                  <Skeleton variant="rectangular" height={37} sx={{ borderRadius: 1 }} />
                </Grid>
              ))}
              <Grid item xs={6} sm={1.2}>
                <Skeleton variant="rectangular" height={37} sx={{ borderRadius: 1 }} />
              </Grid>
              <Grid item xs={12} sm="auto">
                <Skeleton variant="circular" width={40} height={40} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      ))}
      <Stack spacing={2} sx={{ mt: 2, mb: 1 }}>
        <Box display="flex" justifyContent="space-between">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={120} />
        </Box>
        <Divider />
        <Box display="flex" justifyContent="space-between">
          <Skeleton variant="text" width={80} />
          <Skeleton variant="text" width={120} />
        </Box>
        <Divider />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Skeleton variant="text" width={100} />
          <Skeleton variant="text" width={120} />
        </Box>
      </Stack>
      <Skeleton variant="rectangular" width={140} height={40} sx={{ borderRadius: 1, mt: 2 }} />
      <Skeleton variant="rectangular" width={80} height={40} sx={{ borderRadius: 1, mt: 2 }} />
      {/* </MainCard> */}
    </form>
  );
}
