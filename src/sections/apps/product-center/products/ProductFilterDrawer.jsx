import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Stack from '@mui/material/Stack';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

// project-imports
import ProductFilterView from './ProductFilterView';
import ProductFilter from './ProductFilter';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';

import { ThemeMode } from 'config';
import { HEADER_HEIGHT } from 'config';
import useConfig from 'hooks/useConfig';
import { CloseCircle, CloseSquare } from 'iconsax-react';

export default function ProductFilterDrawer({ filter, initialState, handleDrawerOpen, openFilterDrawer, setFilter, setLoading }) {
  const theme = useTheme();
  const { mode, container } = useConfig();

  const matchDownLG = useMediaQuery(theme.breakpoints.down('lg'));
  const matchLG = useMediaQuery(theme.breakpoints.only('lg'));
  const drawerBG = mode === ThemeMode.DARK ? 'dark.main' : 'white';

  const filterIsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const handelFilter = (type, params) => {
    setLoading(true);
    switch (type) {
      case 'company_id':
      case 'category_id':
      case 'business_unit_id':
      case 'location_id':
      case 'product_unit':
        if (filter[type].includes(params)) {
          setFilter({ ...filter, [type]: filter[type].filter((item) => item !== params) });
        } else {
          setFilter({ ...filter, [type]: [...filter[type], params] });
        }
        break;
      case 'price':
      case 'search':
        setFilter({ ...filter, [type]: params });
        break;
      case 'reset':
        setFilter(initialState);
        break;
      default:
        break;
    }
  };

  const drawerWidth = container && matchLG ? 320 : 300;

  return (
    <Drawer
      variant={matchDownLG ? 'temporary' : 'persistent'}
      open={openFilterDrawer}
      onClose={handleDrawerOpen}
      anchor="left"
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: drawerWidth,
          bgcolor: drawerBG,
          borderRadius: 0,
          boxShadow: matchDownLG ? 24 : 'none',
          top: 0,
          height: '100vh'
        }
      }}
    >
      <MainCard
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box component="span" sx={{ fontWeight: 'bold', fontSize: 18 }}>
              Filter
            </Box>
            <IconButton onClick={handleDrawerOpen} sx={{ ml: 1 }}>
              <CloseSquare color="red" />
            </IconButton>
          </Box>
        }
        border={!matchDownLG}
        content={false}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <SimpleBar style={{ flexGrow: 1, padding: 16 }}>
          <Stack spacing={1}>
            <ProductFilterView filter={filter} filterIsEqual={filterIsEqual} handelFilter={handelFilter} initialState={initialState} />
            <ProductFilter filter={filter} handelFilter={handelFilter} />
          </Stack>
        </SimpleBar>
      </MainCard>
    </Drawer>
  );
}

ProductFilterDrawer.propTypes = {
  filter: PropTypes.object.isRequired,
  initialState: PropTypes.object.isRequired,
  handleDrawerOpen: PropTypes.func.isRequired,
  openFilterDrawer: PropTypes.bool.isRequired,
  setFilter: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired
};
