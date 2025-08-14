import PropTypes from 'prop-types';
// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

// project-imports
import ColorOptions from './ColorOptions';
import IconButton from 'components/@extended/IconButton';

// assets
import { Add } from 'iconsax-react';
import { useGetLocation } from 'api/location';
import { useGetProductCategories } from 'api/product_category';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetUnits } from 'api/unit';

function getColor(color) {
  return ColorOptions.filter((item) => item.value === color);
}

// ==============================|| PRODUCT - FILTER VIEW ||============================== //

export default function ProductFilterView({ filter, filterIsEqual, handelFilter, initialState }) {
  const theme = useTheme();
  const matchDownMD = useMediaQuery(theme.breakpoints.down('lg'));
  const { locations } = useGetLocation();
  const { productCategories } = useGetProductCategories();
  const { BusinessUnits } = useGetBusinessUnit();
  const { units } = useGetUnits();

  const getLocationName = (id) => {
    const loc = locations?.find((l) => l.location_id === id);
    return loc ? `${loc.location_name} (${loc.location_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())})` : id;
  };
  const getCategoryName = (id) => productCategories?.find((c) => c.category_id === id)?.category_name || id;
  const getBusinessUnitName = (id) => BusinessUnits?.find((b) => b.business_unit_id === id)?.unit_name || id;
  const getUnitName = (id) => units?.find((u) => u.value === id)?.label || id;

  return (
    <>
      {!filterIsEqual(initialState, filter) && (
        <Stack spacing={2}>
          <Typography variant="h5">Active Filters</Typography>
          {!(initialState.search === filter.search) && (
            <Grid item>
              <Stack direction="row" alignItems="center" sx={{ ml: '-10px' }}>
                <Chip
                  size={matchDownMD ? 'small' : undefined}
                  label={filter.search}
                  sx={{
                    borderRadius: '4px',
                    textTransform: 'capitalize',
                    color: 'secondary.main',
                    bgcolor: 'inherit',
                    '& .MuiSvgIcon-root': { color: `grey` }
                  }}
                />
                <IconButton
                  color="secondary"
                  size="small"
                  sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5 }}
                  onClick={() => handelFilter('search', '')}
                >
                  <Add style={{ transform: 'rotate(45deg)' }} />
                </IconButton>
              </Stack>
            </Grid>
          )}
          {/* {!(initialState.sort === filter.sort) && (
            <Grid item>
              <Stack>
                <Typography variant="subtitle1">Sort</Typography>
                <Stack direction="row" alignItems="center" sx={{ ml: '-10px' }}>
                  <Chip
                    size={matchDownMD ? 'small' : undefined}
                    label={filter.sort}
                    sx={{
                      borderRadius: '4px',
                      textTransform: 'capitalize',
                      color: 'secondary.main',
                      bgcolor: 'inherit',
                      '& .MuiSvgIcon-root': { color: `grey` }
                    }}
                  />
                  <IconButton
                    color="secondary"
                    size="small"
                    sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5 }}
                    onClick={() => handelFilter('sort', initialState.sort)}
                  >
                    <Add style={{ transform: 'rotate(45deg)' }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Grid>
          )} */}
          {!(JSON.stringify(initialState.location_id) === JSON.stringify(filter.location_id)) && (
            <Grid item>
              <Stack>
                <Typography variant="subtitle1">Location</Typography>
                <Grid container item sx={{ ml: '-10px' }}>
                  {filter.location_id.map((item, index) => (
                    <Stack direction="row" alignItems="center" key={index}>
                      <Chip
                        size={matchDownMD ? 'small' : undefined}
                        label={getLocationName(item)}
                        sx={{
                          borderRadius: '4px',
                          textTransform: 'capitalize',
                          color: 'secondary.main',
                          bgcolor: 'inherit',
                          '& .MuiSvgIcon-root': { color: `grey` }
                        }}
                      />
                      <IconButton
                        color="secondary"
                        size="small"
                        sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5 }}
                        onClick={() => handelFilter('location_id', item)}
                      >
                        <Add style={{ transform: 'rotate(45deg)' }} />
                      </IconButton>
                    </Stack>
                  ))}
                </Grid>
              </Stack>
            </Grid>
          )}
          {!(JSON.stringify(initialState.business_unit_id) === JSON.stringify(filter.business_unit_id)) && (
            <Grid item>
              <Stack>
                <Typography variant="subtitle1">Business Unit</Typography>
                <Grid container item sx={{ ml: '-10px' }}>
                  {filter.business_unit_id.map((item, index) => (
                    <Stack direction="row" alignItems="center" key={index}>
                      <Chip
                        size={matchDownMD ? 'small' : undefined}
                        label={getBusinessUnitName(item)}
                        sx={{
                          borderRadius: '4px',
                          textTransform: 'capitalize',
                          color: 'secondary.main',
                          bgcolor: 'inherit',
                          '& .MuiSvgIcon-root': { color: `grey` }
                        }}
                      />
                      <IconButton
                        color="secondary"
                        size="small"
                        sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5 }}
                        onClick={() => handelFilter('business_unit_id', item)}
                      >
                        <Add style={{ transform: 'rotate(45deg)' }} />
                      </IconButton>
                    </Stack>
                  ))}
                </Grid>
              </Stack>
            </Grid>
          )}
          {!(JSON.stringify(initialState.category_id) === JSON.stringify(filter.category_id)) && filter.category_id.length > 0 && (
            <Grid item>
              <Stack>
                <Typography variant="subtitle1">Categories</Typography>
                <Grid container item sx={{ ml: '-10px' }}>
                  {filter.category_id.map((item, index) => (
                    <Stack direction="row" alignItems="center" key={index}>
                      <Chip
                        size={matchDownMD ? 'small' : undefined}
                        label={getCategoryName(item)}
                        sx={{
                          borderRadius: '4px',
                          textTransform: 'capitalize',
                          color: 'secondary.main',
                          bgcolor: 'inherit',
                          '& .MuiSvgIcon-root': { color: `grey` }
                        }}
                      />
                      <IconButton
                        color="secondary"
                        size="small"
                        sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5 }}
                        onClick={() => handelFilter('category_id', item)}
                      >
                        <Add style={{ transform: 'rotate(45deg)' }} />
                      </IconButton>
                    </Stack>
                  ))}
                </Grid>
              </Stack>
            </Grid>
          )}
          {!(JSON.stringify(initialState.product_unit) === JSON.stringify(filter.product_unit)) && filter.product_unit.length > 0 && (
            <Grid item>
              <Stack>
                <Typography variant="subtitle1">Units</Typography>
                <Grid container item sx={{ ml: '-10px' }}>
                  {filter.product_unit.map((item, index) => (
                    <Stack direction="row" alignItems="center" key={index}>
                      <Chip
                        size={matchDownMD ? 'small' : undefined}
                        label={getUnitName(item)}
                        sx={{
                          borderRadius: '4px',
                          textTransform: 'capitalize',
                          color: 'secondary.main',
                          bgcolor: 'inherit',
                          '& .MuiSvgIcon-root': { color: `grey` }
                        }}
                      />
                      <IconButton
                        color="secondary"
                        size="small"
                        sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5 }}
                        onClick={() => handelFilter('product_unit', item)}
                      >
                        <Add style={{ transform: 'rotate(45deg)' }} />
                      </IconButton>
                    </Stack>
                  ))}
                </Grid>
              </Stack>
            </Grid>
          )}
          {/* {!(initialState.price === filter.price) && (
            <Grid item>
              <Stack>
                <Typography variant="subtitle1">Price</Typography>
                <Grid item sx={{ ml: '-10px' }}>
                  <Chip
                    size={matchDownMD ? 'small' : undefined}
                    label={filter.price}
                    sx={{
                      borderRadius: '4px',
                      textTransform: 'capitalize',
                      color: 'secondary.main',
                      bgcolor: 'inherit',
                      '& .MuiSvgIcon-root': { color: `grey` }
                    }}
                  />
                </Grid>
              </Stack>
            </Grid>
          )} */}
          {/* {!(initialState.rating === filter.rating) && (
            <Grid item>
              <Stack>
                <Typography variant="subtitle1">Rating</Typography>
                <Grid item sx={{ ml: '-10px' }}>
                  <Stack direction="row" alignItems="center">
                    <Chip
                      size={matchDownMD ? 'small' : undefined}
                      label={String(filter.rating)}
                      sx={{
                        borderRadius: '4px',
                        textTransform: 'capitalize',
                        color: 'secondary.main',
                        bgcolor: 'inherit',
                        '& .MuiSvgIcon-root': { color: `grey` }
                      }}
                    />
                    <IconButton
                      color="secondary"
                      size="small"
                      sx={{ '&:hover': { bgcolor: 'transparent' }, ml: -1.5 }}
                      onClick={() => handelFilter('rating', '', 0)}
                    >
                      <Add style={{ transform: 'rotate(45deg)' }} />
                    </IconButton>
                  </Stack>
                </Grid>
              </Stack>
            </Grid>
          )} */}
          <Grid item>
            <Button variant="text" color="primary" sx={{ ml: '-10px' }} onClick={() => handelFilter('reset', '')}>
              Reset all filters
            </Button>
          </Grid>
          <Grid item>
            <Divider sx={{ ml: '-8%', mr: '-8%' }} />
          </Grid>
        </Stack>
      )}
    </>
  );
}

ProductFilterView.propTypes = {
  filter: PropTypes.any,
  filterIsEqual: PropTypes.func,
  handelFilter: PropTypes.func,
  initialState: PropTypes.any
};
