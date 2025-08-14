import useAuth from 'hooks/useAuth';
import { useMemo } from 'react';
import useSWR from 'swr';
import axios, { fetcher } from 'utils/axios';

export async function loader() {
  return [];
}

export async function filterPurchases(companyId, filter) {
  try {
    const { data } = await axios.post(`/purchases/filter/${companyId}`, filter);

    return data.data;
  } catch (error) {
    console.error('Failed to filter purchases:', error);
    return [];
  }
}
export function useGetPurchases() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data, isLoading, error, isValidating } = useSWR(`/purchases/${companyId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      purchases: data?.data || [],
      purchasesLoading: isLoading,
      purchasesError: error,
      purchasesValidating: isValidating,
      purchasesEmpty: !isLoading && !data?.purchases?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetPurchaseSuggestions({ search = '' }) {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const shouldFetch = Boolean(companyId);

  const params = new URLSearchParams({
    company_id: companyId,
    ...(search && { search })
  });

  const { data, isLoading, error, isValidating } = useSWR(shouldFetch ? `/purchases/suggest?${params}` : null, fetcher, {
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
export async function addPurchase(formattedPayload) {
  const { data } = await axios.post(`/purchase/add-new-purchase`, formattedPayload);

  return data;
}

export async function checkSKU(companyId, sku) {
  const { data } = await axios.get(`/purchases/check-sku/${companyId}`, {
    params: { sku }
  });
  console.log(data);
  return data;
}

export async function purchaseLoader({ params }) {
  return undefined;
}

export async function getRelatedPurchases(id) {
  return [];
}
export async function updatePurchase(purchase_id, formattedPayload) {
  const { data } = await axios.put(`/purchase/${purchase_id}`, formattedPayload);

  // await filterPurchases(companyId, filters);

  return data;
}
export async function deletePurchase(purchaseId) {
  const { data } = await axios.delete(`/purchase/${purchaseId}`);

  return data;
}
