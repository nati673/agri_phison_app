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

export async function fetchProductBatches(productId, businessUnitId = null, locationId = null) {
  if (!productId) {
    return { data: [], error: 'No productId provided' };
  }

  try {
    const query = new URLSearchParams();
    query.append('product_id', productId);
    if (businessUnitId != null) query.append('business_unit_id', businessUnitId);
    if (locationId != null) query.append('location_id', locationId);

    const url = `/product/batches?${query.toString()}`;

    console.log('Fetching batches from:', url);

    const response = await fetcher(url);

    return {
      data: response?.success ? response.data || [] : [],
      error: response?.success ? null : response?.message || null
    };
  } catch (error) {
    return { data: [], error: error.message || String(error) };
  }
}

export function useGetProductStock(productId) {
  const { user } = useAuth();
  const companyId = user?.company_id;

  // Only fetch if companyId is set
  const endpoint = companyId ? `/products/stock/${productId}` : null;

  const { data, isLoading, error, isValidating } = useSWR(endpoint, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      productStock: data?.data || [],
      productStockLoading: isLoading,
      productStockError: error,
      productStockValidating: isValidating,
      productStockEmpty: !isLoading && !(data?.data && data.data.length)
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
export function useGetSmallQuantityProducts() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data, isLoading, error, isValidating } = useSWR(companyId ? `/products/small-stock/${companyId}` : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      smallQtyProducts: data?.data || [],
      smallQtyLoading: isLoading,
      smallQtyError: error,
      smallQtyValidating: isValidating,
      smallQtyEmpty: !isLoading && !(data?.data && data.data.length)
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
export function useGetOverStockedProducts() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data, isLoading, error, isValidating } = useSWR(companyId ? `/products/overstocked/${companyId}` : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      overstockedProducts: data?.data || [],
      overstockedLoading: isLoading,
      overstockedError: error,
      overstockedValidating: isValidating,
      overstockedEmpty: !isLoading && !(data?.data && data.data.length)
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetExpiredProducts({ horizon = '3m', include = 'expired,soon_expire' } = {}) {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data, isLoading, error, isValidating } = useSWR(
    companyId ? `/products/expired/${companyId}?horizon=${encodeURIComponent(horizon)}&include=${encodeURIComponent(include)}` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const memoized = useMemo(
    () => ({
      expiredProducts: data?.data || [],
      expiredLoading: isLoading,
      expiredError: error,
      expiredValidating: isValidating,
      expiredEmpty: !isLoading && !(data?.data && data.data.length)
    }),
    [data, isLoading, error, isValidating]
  );

  return memoized;
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
