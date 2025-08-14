import useAuth from 'hooks/useAuth';
import { useMemo } from 'react';
import useSWR from 'swr';
import axios, { fetcher } from 'utils/axios';

export async function loader() {
  return [];
}

export async function filterProducts(companyId, filter) {
  try {
    const { data } = await axios.post(`/products/filter/${companyId}`, filter);

    return data.data;
  } catch (error) {
    console.error('Failed to filter products:', error);
    return [];
  }
}
export function useGetProducts() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data, isLoading, error, isValidating } = useSWR(`/products/${companyId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      products: data?.data || [],
      productsLoading: isLoading,
      productsError: error,
      productsValidating: isValidating,
      productsEmpty: !isLoading && !data?.products?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetProductSuggestions({ search = '' }) {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const shouldFetch = Boolean(companyId);

  const params = new URLSearchParams({
    company_id: companyId,
    ...(search && { search })
  });

  const { data, isLoading, error, isValidating } = useSWR(shouldFetch ? `/products/suggest?${params}` : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  const memoizedValue = useMemo(
    () => ({
      suggestions: data?.suggestions || [],
      suggestionsLoading: isLoading,
      suggestionsError: error,
      suggestionsValidating: isValidating,
      suggestionsEmpty: !isLoading && (!data?.suggestions || data.suggestions.length === 0)
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
export async function createProduct(companyId, formattedPayload) {
  const { data } = await axios.post(`/product/create-product/${companyId}`, formattedPayload);

  return data;
}
export async function checkSKU(companyId, sku) {
  const { data } = await axios.get(`/products/check-sku/${companyId}`, {
    params: { sku }
  });
  console.log(data);
  return data;
}

export async function productLoader({ params }) {
  return undefined;
}

export async function getRelatedProducts(id) {
  return [];
}
export async function updateProduct(companyId, formattedPayload) {
  const { data } = await axios.put(`/product/${companyId}`, formattedPayload);

  // await filterProducts(companyId, filters);

  return data;
}
export async function deleteProduct(productId) {
  const { data } = await axios.delete(`/product/${productId}`);

  return data;
}
