import {
  Box,
  Chip,
  Grid,
  Stack,
  Typography,
  Tooltip,
  Divider,
  IconButton,
  Paper,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField
} from '@mui/material';
import { getProductBarcodeBySKU } from 'api/barcode';
import useAuth from 'hooks/useAuth';
import { BoxRemove, BoxTick, Danger, DocumentDownload } from 'iconsax-react';
import React, { useEffect, useMemo, useState } from 'react';
import MainCard from 'components/MainCard';
import GHS01 from '../../../../assets/pictograms/GHS01.png';
import GHS02 from '../../../../assets/pictograms/GHS02.png';
import GHS03 from '../../../../assets/pictograms/GHS03.png';
import GHS04 from '../../../../assets/pictograms/GHS04.png';
import GHS05 from '../../../../assets/pictograms/GHS05.png';
import GHS06 from '../../../../assets/pictograms/GHS06.png';
import GHS07 from '../../../../assets/pictograms/GHS07.png';
import GHS08 from '../../../../assets/pictograms/GHS08.png';
import GHS09 from '../../../../assets/pictograms/GHS09.png';
import BatchTable from './BatchTable';

const pictogramOptions = [
  { id: 'GHS01', label: 'Explosive', image: GHS01 },
  { id: 'GHS02', label: 'Flammable', image: GHS02 },
  { id: 'GHS03', label: 'Oxidizing', image: GHS03 },
  { id: 'GHS04', label: 'Compressed Gas', image: GHS04 },
  { id: 'GHS05', label: 'Corrosive', image: GHS05 },
  { id: 'GHS06', label: 'Toxic', image: GHS06 },
  { id: 'GHS07', label: 'Harmful', image: GHS07 },
  { id: 'GHS08', label: 'Health Hazard', image: GHS08 },
  { id: 'GHS09', label: 'Environmental Hazard', image: GHS09 }
];

export default function ProductViewModern({ data }) {
  const quantity = Number(data?.quantity) || 0;
  const unitPrice = Number(data?.unit_price) || 0;
  const totalPrice = Number(data?.total_price) || 0;
  const isActive = Boolean(data?.is_active);
  const [barcode, setBarcode] = useState(null);
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const filteredBatches = useMemo(() => {
    if (!search) return data.batches;
    return data.batches.filter((batch) =>
      Object.values(batch).some((value) => value && value.toString().toLowerCase().includes(search.toLowerCase()))
    );
  }, [data.batches, search]);
  // Paginate
  const paginatedBatches = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredBatches.slice(start, start + rowsPerPage);
  }, [filteredBatches, page, rowsPerPage]);
  useEffect(() => {
    const fetchBarcode = async () => {
      if (data?.sku && user?.company_id) {
        try {
          const response = await getProductBarcodeBySKU(user?.company_id, data.sku);

          const blob = new Blob([response], { type: 'image/png' });
          const url = URL.createObjectURL(blob);
          setBarcode(url);
        } catch (error) {
          console.error('Failed to load barcode:', error);
        }
      }
    };

    fetchBarcode();

    return () => {
      if (barcode) {
        URL.revokeObjectURL(barcode);
      }
    };
  }, [data?.sku, user?.company_id]);

  const getSelectedPictograms = (pictogramsString) => {
    if (!pictogramsString) return [];
    const ids = pictogramsString
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    const pictogramMap = Object.fromEntries(pictogramOptions.map((p) => [p.id, p]));
    return ids.map((id) => pictogramMap[id]).filter(Boolean);
  };

  const chipStyle = {
    px: 2,
    py: 0.5,
    borderRadius: 3,
    background: 'linear-gradient(90deg, #D1FBEA 0%, #F8FFF9 100%)',
    color: '#229672',
    fontWeight: 600,
    fontSize: '11px',
    boxShadow: '0 1px 8px 0 rgba(60,200,140,0.07)',
    transition: 'box-shadow 0.24s, background 0.18s',
    cursor: 'default',
    '&:hover': {
      boxShadow: '0 3px 14px 0 rgba(60,200,140,0.12)',
      background: 'linear-gradient(90deg, #B1E6C4 0%, #BEFFD5 100%)'
    }
  };

  console.log(data);
  return (
    <MainCard
      elevation={0}
      sx={{
        p: { xs: 2, sm: 4 },
        borderRadius: 4,
        // background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(7px)'
      }}
    >
      <Grid container spacing={3} alignItems="flex-start">
        {/* Visual status and identity */}
        <Grid item xs={12} sm={4} md={3}>
          <Stack alignItems="center" spacing={2} textAlign="center">
            {quantity > 0 ? (
              <BoxTick size={window.innerWidth < 400 ? '64' : '90'} variant="Bulk" color="#3fc06f" />
            ) : (
              <BoxRemove size={window.innerWidth < 400 ? '64' : '90'} variant="Bulk" color="#e68b6f" />
            )}
            <Chip
              label={isActive ? 'Active' : 'Inactive'}
              color={isActive ? 'success' : 'error'}
              variant="soft"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, fontWeight: 600 }}
              aria-label={`product status: ${isActive ? 'active' : 'inactive'}`}
            />
            <Typography variant="caption" sx={{ mt: 1 }} color="text.secondary">
              SKU: {data?.sku}
            </Typography>
          </Stack>
        </Grid>

        {/* Main content */}
        <Grid item xs={12} sm={8} md={9}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={1}
            >
              <Stack spacing={0.5}>
                <Typography variant="h5" component="div" fontWeight={700} sx={{ letterSpacing: 0.3 }}>
                  {data?.product_name} ({data?.product_name_localized})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data?.category_name} &nbsp;|&nbsp; {data?.business_unit}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {data?.company_name} | {data?.location_name}
                </Typography>
              </Stack>

              {barcode && (
                <Box
                  sx={{
                    position: 'relative',
                    display: 'inline-block',
                    mt: 2
                  }}
                >
                  {/* Barcode Image Box */}
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      mt: 2,
                      border: '1px dashed #ddd',
                      borderRadius: 2,
                      p: 1,
                      backgroundColor: '#fafafa',
                      transition: 'all 0.3s ease-in-out',
                      '&:hover .download-btn': {
                        opacity: 1,
                        visibility: 'visible'
                      }
                    }}
                  >
                    <Box
                      component="img"
                      src={barcode}
                      alt="Product Barcode"
                      sx={{
                        maxWidth: 180,
                        display: 'block',
                        mx: 'auto'
                      }}
                    />

                    {/* Download Button on Hover */}
                    <Tooltip title="Download Barcode" arrow>
                      <IconButton
                        className="download-btn"
                        onClick={() => {
                          const a = document.createElement('a');
                          a.href = barcode;
                          a.download = `${data?.product_name}-barcode.png`;
                          a.click();
                        }}
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          backgroundColor: 'white',
                          boxShadow: 1,
                          opacity: 0,
                          visibility: 'hidden',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': { backgroundColor: '#f0f0f0' }
                        }}
                      >
                        <DocumentDownload size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ mt: 1.5, textAlign: 'center' }}>
                    <Button
                      variant="text"
                      size="small"
                      color="primary"
                      href="/workspace/barcode"
                      sx={{
                        fontSize: '0.85rem',
                        textDecoration: 'underline',
                        '&:hover': {
                          textDecoration: 'none'
                        }
                      }}
                    >
                      Show All Barcodes
                    </Button>
                  </Box>
                </Box>
              )}
            </Stack>

            <Divider sx={{ my: 1 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary">Quantity</Typography>
                <Typography variant="subtitle1">
                  {quantity.toLocaleString()} {data?.product_unit}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary">Unit Price</Typography>
                <Typography variant="subtitle1">ETB {unitPrice.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary">Total Price</Typography>
                <Typography variant="subtitle1">ETB {totalPrice.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography color="text.secondary">Last Updated</Typography>
                <Typography variant="body2">
                  {data?.stock_last_updated
                    ? new Date(data.stock_last_updated).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })
                    : '-'}
                </Typography>
              </Grid>
            </Grid>

            <Divider variant="dashed" sx={{ mt: 2, mb: 1 }} />
            <Grid container spacing={2}>
              {data?.ingredients && (
                <Grid item xs={12} md={6}>
                  <Typography color="text.secondary" sx={{ mb: 0.7 }}>
                    Ingredients
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.5 }}>
                    {data.ingredients.split(',').map((prec, idx, arr) => (
                      <React.Fragment key={idx}>
                        <Box component="span" sx={chipStyle}>
                          {prec.trim()}
                        </Box>
                      </React.Fragment>
                    ))}
                  </Box>
                </Grid>
              )}
              {data?.use_for && (
                <Grid item xs={12} md={6}>
                  <Typography color="text.secondary" sx={{ mb: 0.7 }}>
                    Use For
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.5 }}>
                    {data.use_for.split(',').map((prec, idx, arr) => (
                      <React.Fragment key={idx}>
                        <Box component="span" sx={chipStyle}>
                          {prec.trim()}
                        </Box>
                      </React.Fragment>
                    ))}
                  </Box>
                </Grid>
              )}

              {data?.target_issues && (
                <Grid item xs={12} md={6}>
                  <Typography color="text.secondary" sx={{ mb: 0.7 }}>
                    Target Issues
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.5 }}>
                    {data.target_issues.split(',').map((prec, idx, arr) => (
                      <React.Fragment key={idx}>
                        <Box component="span" sx={chipStyle}>
                          {prec.trim()}
                        </Box>
                      </React.Fragment>
                    ))}
                  </Box>
                </Grid>
              )}
              {data?.usage && (
                <Grid item xs={12} md={6}>
                  <Typography color="text.secondary">Usage</Typography>
                  <Typography variant="body2">{data.usage}</Typography>
                </Grid>
              )}
              {data?.storage_precautions && (
                <Grid item xs={12} md={6}>
                  <Typography color="text.secondary" sx={{ mb: 0.7 }}>
                    Storage Precautions
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.5 }}>
                    {data.storage_precautions.split(',').map((prec, idx, arr) => (
                      <React.Fragment key={idx}>
                        <Box component="span" sx={chipStyle}>
                          {prec.trim()}
                        </Box>
                      </React.Fragment>
                    ))}
                  </Box>
                </Grid>
              )}
              {data?.disposal_instructions && (
                <Grid item xs={12} md={6}>
                  <Typography color="text.secondary" sx={{ mb: 0.7 }}>
                    Disposal Instructions
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 0.5 }}>
                    {data.disposal_instructions.split(',').map((instruction, idx) => (
                      <Box key={idx} component="span" sx={chipStyle}>
                        {instruction.trim()}
                      </Box>
                    ))}
                  </Box>
                </Grid>
              )}
              {typeof data?.is_hazardous !== 'undefined' && (
                <Grid item xs={12} md={6}>
                  <Typography color="text.secondary" sx={{ mb: 0.7 }}>
                    Is Hazardous?
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    {data.is_hazardous ? (
                      <Tooltip title="Hazardous" arrow>
                        <Box
                          sx={{
                            px: 2,
                            py: 0.5,
                            borderRadius: 3,
                            background: 'linear-gradient(90deg, #F2FFF1 0%, #F7FFF7 100%)',
                            color: '#1D9431',
                            fontWeight: 600,
                            fontSize: '11px'
                          }}
                        >
                          Yes!
                        </Box>
                      </Tooltip>
                    ) : (
                      <Box
                        sx={{
                          px: 1,
                          py: 0.2,
                          borderRadius: 3,
                          background: 'linear-gradient(90deg, #F2FFF1 0%, #F7FFF7 100%)',
                          color: '#1D9431',
                          fontWeight: 600,
                          fontSize: '11px'
                        }}
                      >
                        Not Hazardous!
                      </Box>
                    )}
                  </Stack>
                </Grid>
              )}
              {data?.pictograms && (
                <Grid item xs={12} md={6}>
                  <Typography color="text.secondary" sx={{ mb: 0.7 }}>
                    Pictograms
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                    {getSelectedPictograms(data.pictograms).map((p, idx) => (
                      <Tooltip title={p.label} key={idx} arrow>
                        <Box
                          component="img"
                          src={p.image}
                          alt={p.label}
                          sx={{
                            height: 50,
                            width: 50,
                            objectFit: 'contain',
                            borderRadius: 2
                            // backgroundColor: '#ffb'
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Stack>
                </Grid>
              )}

              {Array.isArray(data.batches) && data.batches.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    Product Batches
                  </Typography>
                  <BatchTable batches={data.batches} />
                </Grid>
              )}
            </Grid>
          </Stack>
        </Grid>
      </Grid>
    </MainCard>
  );
}
