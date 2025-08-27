import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Slider from '@mui/material/Slider';
import Checkbox from '@mui/material/Checkbox';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

// project-imports
import Colors from './Colors';
import { useGetProductCategories } from 'api/product_category';
import { useGetLocation } from 'api/location';
import { useGetBusinessUnit } from 'api/business_unit';
import { useGetUnits } from 'api/unit';

// ==============================|| PRODUCT - LOCATION FILTER ||============================== //

function Location({ location, handelFilter }) {
  const { locationsLoading, locations } = useGetLocation();
  const [showAll, setShowAll] = useState(false);

  const handleShowAll = () => setShowAll((prev) => !prev);

  // Group top-level locations and nest their children
  const groupedLocations = useMemo(() => {
    if (!locations) return [];

    // Top-level locations (no parent)
    const parents = locations.filter((loc) => loc.parent_location_id == null);

    // Children mapped to their parents
    return parents.map((parent) => ({
      ...parent,
      children: locations.filter((child) => child.parent_location_id === parent.location_id)
    }));
  }, [locations]);

  const formatType = (type) => type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <Stack>
      {locationsLoading ? (
        <Grid item xs={12}>
          <Skeleton variant="rectangular" width="100%" height={96} />
        </Grid>
      ) : (
        <>
          <Typography variant="h5">Locations</Typography>
          <Box sx={{ pl: 0.5 }}>
            <Stack spacing={0.5}>
              <FormControlLabel
                control={<Checkbox checked={location.includes('all')} />}
                onChange={() => handelFilter('location_id', 'all')}
                label="All"
              />

              {(showAll ? groupedLocations : groupedLocations.slice(0, 5)).map((parent) => (
                <Box key={parent.location_id}>
                  {/* Parent Location */}
                  <FormControlLabel
                    control={<Checkbox checked={location.includes(parent.location_id)} />}
                    onChange={() => handelFilter('location_id', parent.location_id)}
                    label={`${parent.location_name} (${formatType(parent.location_type)})`}
                  />

                  {/* Nested Children */}
                  {parent.children.map((child) => (
                    <Box key={child.location_id} sx={{ pl: 4 }}>
                      <FormControlLabel
                        control={<Checkbox checked={location.includes(child.location_id)} />}
                        onChange={() => handelFilter('location_id', child.location_id)}
                        label={`${child.location_name} (${formatType(child.location_type)})`}
                      />
                    </Box>
                  ))}
                </Box>
              ))}

              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', mt: 1 }} onClick={handleShowAll}>
                {showAll ? 'Show Less' : 'Show All'}
              </Typography>
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}

function Categories({ category, handelFilter }) {
  const { productCategoriesLoading, productCategories } = useGetProductCategories();
  const [showAllCategories, setShowAllCategories] = useState(false);

  const handleShowAllCategories = () => {
    setShowAllCategories((prev) => !prev);
  };
  return (
    <Stack>
      {productCategoriesLoading ? (
        <Grid item xs={12}>
          <Skeleton variant="rectangular" width="100%" height={96} />
        </Grid>
      ) : (
        <>
          <Typography variant="h5">Categories</Typography>
          <Box sx={{ pl: 0.5 }}>
            <Stack>
              <FormControlLabel
                control={<Checkbox checked={category.includes('all')} />}
                onChange={() => handelFilter('category_id', 'all')}
                label="All"
              />

              {productCategories ? (
                (showAllCategories ? productCategories : productCategories.slice(0, 7)).map((categ) => (
                  <FormControlLabel
                    key={categ.category_id}
                    control={<Checkbox checked={category.includes(categ.category_id)} />}
                    onChange={() => handelFilter('category_id', categ.category_id)}
                    label={categ.category_name}
                  />
                ))
              ) : (
                <Typography color="text.secondary">There Is No Categories</Typography>
              )}
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', mt: 1 }} onClick={handleShowAllCategories}>
                {showAllCategories ? 'Show Less' : 'Show All'}
              </Typography>
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}

// ==============================|| PRODUCT - BUSINESS UNIT FILTER ||============================== //

function BusinessUnit({ business_unit, handelFilter }) {
  const { locationsLoading, BusinessUnits } = useGetBusinessUnit();
  const [showAll, setShowAll] = useState(false);

  const handleShowAll = () => {
    setShowAll((prev) => !prev);
  };
  return (
    <Stack>
      {locationsLoading ? (
        <Grid item xs={12}>
          <Skeleton variant="rectangular" width="100%" height={96} />
        </Grid>
      ) : (
        <>
          <Typography variant="h5">Business Units</Typography>
          <Box sx={{ pl: 0.5 }}>
            <Stack>
              <FormControlLabel
                control={<Checkbox checked={business_unit.some((item) => item === 'all')} />}
                onChange={() => handelFilter('business_unit_id', 'all')}
                label="All"
              />

              {BusinessUnits ? (
                (showAll ? BusinessUnits : BusinessUnits.slice(0, 7)).map((loc) => (
                  <FormControlLabel
                    key={loc.business_unit_id}
                    control={<Checkbox checked={business_unit.includes(loc.business_unit_id)} />}
                    onChange={() => handelFilter('business_unit_id', loc.business_unit_id)}
                    label={`${loc.unit_name}`}
                  />
                ))
              ) : (
                <Typography color="text.secondary">There is no Business Units (Departments)</Typography>
              )}
              <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', mt: 1 }} onClick={handleShowAll}>
                {showAll ? 'Show Less' : 'Show All'}
              </Typography>
            </Stack>
          </Box>
        </>
      )}
    </Stack>
  );
}
// ==============================|| PRODUCT GRID - FILTER ||============================== //

function Unit({ unit, handelFilter }) {
  const { unitsLoading, units } = useGetUnits();
  const [showAll, setShowAll] = useState(false);

  const handleShowAll = () => {
    setShowAll((prev) => !prev);
  };

  const displayedUnits = showAll ? units : units.slice(0, 7);

  return (
    <Stack>
      <Typography variant="h5">Units</Typography>
      <Box sx={{ pl: 0.5 }}>
        <Stack>
          <FormControlLabel
            control={<Checkbox checked={unit.includes('all')} />}
            onChange={() => handelFilter('product_unit', 'all')}
            label="All"
          />

          {displayedUnits.map((u) => (
            <FormControlLabel
              key={u.value}
              control={<Checkbox checked={unit.includes(u.value)} />}
              onChange={() => handelFilter('product_unit', u.value)}
              label={u.label}
            />
          ))}

          {units.length > 7 && (
            <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', mt: 1 }} onClick={handleShowAll}>
              {showAll ? 'Show Less' : 'Show All'}
            </Typography>
          )}
        </Stack>
      </Box>
    </Stack>
  );
}
const ProductFilter = ({ filter, handelFilter }) => (
  <Grid container direction="column" rowSpacing={3}>
    <Grid item>
      <Location location={filter.location_id} handelFilter={handelFilter} />
    </Grid>
    <Grid item>
      <BusinessUnit business_unit={filter.business_unit_id} handelFilter={handelFilter} />
    </Grid>
    <Grid item>
      <Categories category={filter.category_id} handelFilter={handelFilter} />
    </Grid>
    <Grid item>
      <Unit unit={filter.product_unit} handelFilter={handelFilter} />
    </Grid>
  </Grid>
);

export default ProductFilter;

Location.propTypes = { locations: PropTypes.array, handelFilter: PropTypes.func };

Categories.propTypes = { categories: PropTypes.array, handelFilter: PropTypes.func };

Location.propTypes = { location: PropTypes.array, handelFilter: PropTypes.func };

Unit.propTypes = { unit: PropTypes.array, handelFilter: PropTypes.func };

ProductFilter.propTypes = { filter: PropTypes.any, handelFilter: PropTypes.func };
