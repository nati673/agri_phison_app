import { useEffect, useMemo, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';

// project-imports
import FormCategoryAdd from './FormCategory';
import MainCard from 'components/MainCard';
import SimpleBar from 'components/third-party/SimpleBar';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { handlerProductCategoriesDialog, useGetProductCategories, useGetProductCategoriesMaster } from 'api/product_category';

// ==============================|| Category - ADD / EDIT ||============================== //

export default function AddCategory() {
  const { ProductCategoriesMasterLoading, ProductCategoriesMaster } = useGetProductCategoriesMaster();
  const { productCategoriesLoading: loading, productCategories } = useGetProductCategories();
  const isModal = ProductCategoriesMaster?.modal;

  const [list, setList] = useState(null);

  useEffect(() => {
    if (ProductCategoriesMaster?.modal && typeof ProductCategoriesMaster.modal === 'number') {
      const newList = productCategories.filter((info) => info.id === isModal && info)[0];
      setList(newList);
    } else {
      setList(null);
    }
  }, [ProductCategoriesMaster]);

  const closeModal = () => handlerProductCategoriesDialog(false);

  // eslint-disable-next-line
  const CategoryForm = useMemo(
    () => !loading && !ProductCategoriesMasterLoading && <FormCategoryAdd Category={list} closeModal={closeModal} />,
    [list, loading, ProductCategoriesMasterLoading]
  );

  return (
    <>
      {isModal && (
        <Modal
          open={true}
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
            <SimpleBar
              sx={{
                maxHeight: `calc(100vh - 48px)`,
                '& .simplebar-content': { display: 'flex', flexDirection: 'column' }
              }}
            >
              {loading && ProductCategoriesMasterLoading ? (
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
