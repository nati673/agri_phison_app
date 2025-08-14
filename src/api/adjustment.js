import useAuth from 'hooks/useAuth';
import { useMemo } from 'react';
import useSWR from 'swr';
import axios, { fetcher } from 'utils/axios';

export async function loader() {
  return [];
}

export async function filterAdjustments(companyId, filter) {
  try {
    const { data } = await axios.post(`/adjustment/adjustments/filter/${companyId}`, filter);
    return data.data;
  } catch (error) {
    console.error('Failed to filter adjustments:', error);
    return [];
  }
}
export function useGetAdjustments() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data, isLoading, error, isValidating } = useSWR(`/adjustment/adjustments/${companyId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      adjustments: data?.data || [],
      adjustmentsLoading: isLoading,
      adjustmentsError: error,
      adjustmentsValidating: isValidating,
      adjustmentsEmpty: !isLoading && !data?.adjustments?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetAdjustmentSuggestions({ search = '' }) {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const shouldFetch = Boolean(companyId);

  const params = new URLSearchParams({
    company_id: companyId,
    ...(search && { search })
  });

  const { data, isLoading, error, isValidating } = useSWR(shouldFetch ? `/adjustments/suggest?${params}` : null, fetcher, {
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
export async function addInventoryAdjustment(formattedPayload) {
  const { data } = await axios.post(`/adjustment/add-new-adjustment`, formattedPayload);

  return data;
}

export async function checkSKU(companyId, sku) {
  const { data } = await axios.get(`/adjustments/check-sku/${companyId}`, {
    params: { sku }
  });
  console.log(data);
  return data;
}

export async function adjustmentLoader({ params }) {
  return undefined;
}

export async function getRelatedAdjustments(id) {
  return [];
}
export async function updateAdjustment(adjustment_id, formattedPayload) {
  const { data } = await axios.put(`/adjustment/${adjustment_id}`, formattedPayload);

  // await filterAdjustments(companyId, filters);

  return data;
}
export async function deleteAdjustment(adjustmentId) {
  const { data } = await axios.delete(`/adjustment/${adjustmentId}`);

  return data;
}

export const updateInventoryAdjustmentStatus = async (header_id, status) => {
  const { data } = await axios.patch('/adjustment/status', {
    header_id,
    status
  });

  return data;
};
