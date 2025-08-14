import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher } from 'utils/axios';

const initialState = {
  modal: false
};

export const endpoints = {
  list: '/plans'
};

export function useGetPlans() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.list, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  const memoizedValue = useMemo(
    () => ({
      plans: data || [],
      plansLoading: isLoading,
      plansError: error,
      plansValidating: isValidating,
      plansEmpty: !isLoading && !data?.plans?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}




