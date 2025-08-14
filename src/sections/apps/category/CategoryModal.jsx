import PropTypes from 'prop-types';
import { useMemo } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Modal from '@mui/material/Modal';

// project imports
import FormCategoryAdd from './FormCategory';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { useGetProductCategories } from 'api/product_category';

// ==============================|| Category ADD / EDIT ||============================== //

export default function CategoryModal({ open, modalToggler, Category }) {
  const { productCategoriesLoading: loading } = useGetProductCategories();

  const closeModal = () => modalToggler(false);

  const CategoryForm = useMemo(
    () => !loading && <FormCategoryAdd Category={Category || null} closeModal={closeModal} />,
    // eslint-disable-next-line
    [Category, loading]
  );

  return (
    <>
      {open && (
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-Category-add-label"
          aria-describedby="modal-Category-add-description"
          sx={{ '& .MuiPaper-root:focus': { outline: 'none' } }}
        >
          <MainCard
            sx={{ width: `calc(100% - 48px)`, minWidth: 340, maxWidth: 880, height: 'auto', maxHeight: 'calc(100vh - 48px)' }}
            modal
            content={false}
          >
            <SimpleBar sx={{ maxHeight: `calc(100vh - 48px)`, '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
              {loading ? (
                <Box sx={{ p: 5 }}>
                  <Stack direction="row" justifyContent="center">
                    <CircularWithPath />
                  </Stack>
                </Box>
              ) : (
                CategoryForm
              )}
            </SimpleBar>
          </MainCard>
        </Modal>
      )}
    </>
  );
}

CategoryModal.propTypes = { open: PropTypes.bool, modalToggler: PropTypes.func, Category: PropTypes.any };
