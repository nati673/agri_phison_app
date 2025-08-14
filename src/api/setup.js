import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
import axios from 'utils/axios';

// utils
import { fetcher } from 'utils/axios'; // make sure this is a default export or use `{ fetcher }`

// initial modal state if needed elsewhere
export const initialState = {
  modal: false
};

// API endpoints
export const endpoints = {
  setup: '/setups', // base endpoint,
  setup_company: '/setup' // endpoint for setup data
};

// Fetch setup data by user ID
export function useGetSetup(userId) {
  const { data, isLoading, error, isValidating } = useSWR(userId ? `${endpoints.setup}/${userId}` : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      setup: data || [],
      setupLoading: isLoading,
      setupError: error,
      setupValidating: isValidating,
      setupEmpty: !isLoading && !data?.locations?.length && !data?.business_units?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function setupCompany(data) {
  try {
    const res = await axios.post(endpoints.setup_company, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error setting up company:', error);
    return { Error: error.error };
  }
}
