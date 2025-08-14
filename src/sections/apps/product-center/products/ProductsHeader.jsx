import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

// project-imports
import SortOptions from 'sections/apps/product-center/products/SortOptions';
import MainCard from 'components/MainCard';

// assets
import { Add, ArrowDown2, FilterSearch, SearchNormal1 } from 'iconsax-react';
import { useNavigate } from 'react-router';

// ==============================|| PRODUCT - HEADER ||============================== //

export default function ProductsHeader({ filter, handleDrawerOpen, setFilter, addTitle, handleAdd, SerachLable }) {
  const theme = useTheme();
  const matchDownSM = useMediaQuery(theme.breakpoints.down('sm'));

  // sort options
  const [anchorEl, setAnchorEl] = useState(null);
  const openSort = Boolean(anchorEl);
  const handleClickListItem = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // search filter
  const handleSearch = async (event) => {
    const newString = event?.target.value;
    setFilter({ ...filter, search: newString });
  };

  // sort filter
  const handleMenuItemClick = (event, index) => {
    setFilter({ ...filter, sort: index });
    setAnchorEl(null);
  };

  const history = useNavigate();

  const sortLabel = SortOptions.filter((items) => items.value === filter.sort);

  return (
    <MainCard content={false}>
      <Stack
        direction={matchDownSM ? 'column' : 'row'}
        alignItems={matchDownSM ? 'space-between' : 'center'}
        justifyContent={matchDownSM ? 'center' : 'space-between'}
        sx={{ p: 2 }}
        spacing={2}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={0.5}>
          <Button onClick={handleDrawerOpen} color="secondary" startIcon={<FilterSearch style={{ color: 'secondary.200' }} />} size="large">
            Filter
          </Button>

          <TextField
            sx={{ '& .MuiOutlinedInput-input': { pl: 0 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={18} />
                </InputAdornment>
              )
            }}
            value={filter.search}
            placeholder={SerachLable}
            size="medium"
            onChange={handleSearch}
          />
        </Stack>

        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ padding: 3 }}>
          {/* <DebouncedInput
                  value={globalFilter ?? ''}
                  onFilterChange={(value) => setGlobalFilter(String(value))}
                  placeholder={`Search ${data.length} records...`}
                />
         */}
          <Stack direction="row" alignItems="center" spacing={2}>
            {/* <SelectColumnSorting {...{ getState: table.getState, getAllColumns: table.getAllColumns, setSorting }} /> */}
            <Button variant="contained" startIcon={<Add />} size="large" onClick={handleAdd}>
              {addTitle}
            </Button>
          </Stack>
        </Stack>
        {/* <Button
          id="demo-positioned-button"
          aria-controls="demo-positioned-menu"
          aria-haspopup="true"
          aria-expanded={openSort ? 'true' : undefined}
          onClick={handleClickListItem}
          variant="outlined"
          size="large"
          color="secondary"
          endIcon={<ArrowDown2 style={{ fontSize: 'small' }} />}
          sx={{ color: 'text.primary' }}
        >
          {sortLabel.length > 0 && sortLabel[0].label}
        </Button>
        <Menu
          id="demo-positioned-menu"
          aria-labelledby="demo-positioned-button"
          anchorEl={anchorEl}
          open={openSort}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: matchDownSM ? 'center' : 'right' }}
          transformOrigin={{
            vertical: 'top',
            horizontal: matchDownSM ? 'center' : 'right'
          }}
        >
          {SortOptions.map((option, index) => (
            <MenuItem
              sx={{ p: 1.5 }}
              key={index}
              selected={option.value === filter.sort}
              onClick={(event) => handleMenuItemClick(event, option.value)}
            >
              {option.label}
            </MenuItem>
          ))}
        </Menu> */}
      </Stack>
    </MainCard>
  );
}

ProductsHeader.propTypes = { filter: PropTypes.any, handleDrawerOpen: PropTypes.func, setFilter: PropTypes.func };
