import PropTypes from 'prop-types';
import { List, ListItem, Typography, Divider, Stack, Box } from '@mui/material';
import MainCard from 'components/MainCard';

const InfoRow = ({ title, value }) => (
  <Box display="flex" gap={1} flexWrap="wrap">
    <Typography variant="body2" fontWeight="bold" color="text.primary">
      {title}:
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {value || 'N/A'}
    </Typography>
  </Box>
);

InfoRow.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string
};

const LocationOnlyView = ({ data }) => {
  const locations = data?.locations ?? [];

  return (
    <MainCard title="Assigned Locations">
      <List disablePadding>
        {locations.length > 0 ? (
          locations.map(
            (loc, index) =>
              loc?.location_id && (
                <div key={loc.location_id}>
                  <ListItem alignItems="flex-start">
                    <Stack spacing={1}>
                      <InfoRow title="Name" value={loc.location_name} />
                      <InfoRow title="Type" value={loc.location_type} />
                      <InfoRow title="Phone" value={loc.phone_number} />
                      <InfoRow title="Address" value={loc.address} />
                    </Stack>
                  </ListItem>
                  {index < locations.length - 1 && <Divider />}
                </div>
              )
          )
        ) : (
          <ListItem>
            <Typography color="text.secondary">No locations assigned</Typography>
          </ListItem>
        )}
      </List>
    </MainCard>
  );
};

LocationOnlyView.propTypes = {
  data: PropTypes.shape({
    locations: PropTypes.arrayOf(
      PropTypes.shape({
        location_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        location_name: PropTypes.string.isRequired,
        location_type: PropTypes.string,
        phone_number: PropTypes.string,
        address: PropTypes.string
      })
    )
  }).isRequired
};

export default LocationOnlyView;
