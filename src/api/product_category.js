import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher } from 'utils/axios';
import useAuth from 'hooks/useAuth';
import axios from 'utils/axios';

const initialState = {
  modal: false
};

export const endpoints = {
  product_categories: '/product-categories',
  create_product_category: '/product-category',
  update_product_category: '/product-category',
  modal: '/modal',
  delete_product_category: '/product-category'
};

export function useGetProductCategories() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data, isLoading, error, isValidating } = useSWR(`${endpoints.product_categories}/${companyId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      productCategories: data?.data || [],
      productCategoriesLoading: isLoading,
      productCategoriesError: error,
      productCategoriesValidating: isValidating,
      productCategoriesEmpty: !isLoading && !data?.productCategories?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function createProductCategories(newProductCategories) {
  const { company_id } = newProductCategories;

  mutate(
    `${endpoints.product_categories}/${company_id}`,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: [...current.data, { ...newProductCategories, id: Date.now() }]
      };
      return updated;
    },
    false
  );

  const createRes = await axios.post(endpoints.create_product_category, newProductCategories);

  await mutate(`${endpoints.product_categories}/${company_id}`);

  return createRes.data;
}

export async function updateProductCategories(ProductCategoriesId, updatedProductCategories) {
  const { company_id } = updatedProductCategories;

  if (!company_id) throw new Error('Company ID is required');

  mutate(
    `${endpoints.product_categories}/${company_id}`,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.map((item) => (item.category_id === ProductCategoriesId ? { ...item, ...updatedProductCategories } : item))
      };
      return updated;
    },
    false
  );

  const response = await axios.put(`${endpoints.update_product_category}/${ProductCategoriesId}`, {
    category_id: ProductCategoriesId,
    ...updatedProductCategories
  });

  await mutate(`${endpoints.roles}/${company_id}`);

  return response.data;
}

export async function deleteProductCategories(ProductCategoriesData) {
  const endpoint = `${endpoints.product_categories}/${ProductCategoriesData.company_id}`;

  // Optimistic UI update
  mutate(
    endpoint,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.filter((item) => item.category_id !== ProductCategoriesData.category_id)
      };
      return updated;
    },
    false
  );

  // Backend deletion
  const res = await axios.delete(`${endpoints.delete_product_category}/${ProductCategoriesData.category_id}`, {
    category_id: ProductCategoriesData.category_id
  });

  await mutate(endpoint);

  return res.data;
}
export function useGetProductCategoriesMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      ProductCategoriesMaster: data,
      ProductCategoriesMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerProductCategoriesDialog(modal) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.modal,
    (currentProductCategoriesmaster) => {
      return { ...currentProductCategoriesmaster, modal };
    },
    false
  );
}
