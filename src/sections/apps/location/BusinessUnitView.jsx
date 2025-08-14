import PropTypes from 'prop-types';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography, TableContainer, Paper } from '@mui/material';
import MainCard from 'components/MainCard';

const LocationOnlyView = ({ data, id }) => {
  const locations = data || [];

  const currentLocation = locations.find((loc) => loc.location_id === id);

  const branch =
    currentLocation?.location_type === 'branch'
      ? currentLocation
      : locations.find((loc) => loc.location_id === currentLocation?.parent_location_id);

  const childLocations = locations.filter((loc) => loc.parent_location_id === branch?.location_id && loc.location_id !== id);

  const showBranch = branch && branch.location_id !== id;

  const displayedLocations = [...(showBranch ? [branch] : []), ...childLocations];

  return (
    <>
      {displayedLocations.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Name</strong>
                </TableCell>
                <TableCell>
                  <strong>Type</strong>
                </TableCell>
                <TableCell>
                  <strong>Phone</strong>
                </TableCell>
                <TableCell>
                  <strong>Address</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedLocations.map((loc) => (
                <TableRow key={loc.location_id}>
                  <TableCell>{loc.location_name}</TableCell>
                  <TableCell>{loc.location_type}</TableCell>
                  <TableCell>{loc.phone_number || 'N/A'}</TableCell>
                  <TableCell>{loc.address || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography color="text.secondary" sx={{ p: 2 }}>
          No other assigned locations.
        </Typography>
      )}
    </>
  );
};

LocationOnlyView.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      location_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      location_name: PropTypes.string.isRequired,
      location_type: PropTypes.string,
      phone_number: PropTypes.string,
      address: PropTypes.string,
      parent_location_id: PropTypes.number
    })
  ).isRequired,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default LocationOnlyView;
