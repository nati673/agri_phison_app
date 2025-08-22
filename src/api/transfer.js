import useAuth from 'hooks/useAuth';
import { useMemo } from 'react';
import useSWR from 'swr';
import axios, { fetcher } from 'utils/axios';

export async function loader() {
  return [];
}

export async function AddNewTransfer(formattedPayload) {
  try {
    const { data } = await axios.post('/transfer/add-new-transfer', formattedPayload);
    return data;
  } catch (error) {
    console.error('AddNewTransfer API error:', error);
    throw error;
  }
}

export async function filterTransfer(companyId, filter) {
  try {
    const { data } = await axios.post(`/transfer/filter/${companyId}`, filter);
    return data.data;
  } catch (error) {
    console.error('Failed to filter transfer:', error);
    return [];
  }
}

export async function UpdateTransfer(transfer_id, formattedPayload) {
  const { data } = await axios.put(`/transfer/${transfer_id}`, formattedPayload);

  return data;
}
export async function deleteTransfer(id, company_id) {
  const { data } = await axios.delete(`/transfer/${id}`);

  return data;
}

export const updateTransferStatus = async (transfer_id, status) => {
  const { data } = await axios.patch('/transfer/status', {
    transfer_id,
    status
  });

  return data;
};
export function useGetStockTransferDetail(accessId) {
  const { user } = useAuth();
  const companyId = user?.company_id;

  if (!companyId || !accessId) {
    return {
      transferDetail: null,
      transferDetailLoading: false,
      transferDetailError: new Error('Company ID and Access ID are required'),
      transferDetailValidating: false,
      transferDetailEmpty: true
    };
  }
  const { data, isLoading, error, isValidating } = useSWR(`/transfer/detail/${accessId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      transferDetail: data?.data || [],
      transferDetailLoading: isLoading,
      transferDetailError: error,
      transferDetailValidating: isValidating,
      transferDetailEmpty: !isLoading && !data?.data?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
