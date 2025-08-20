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
export async function deleteTransfer(adjustmentId) {
  const { data } = await axios.delete(`/transfer/${adjustmentId}`);

  return data;
}

export const updateTransferStatus = async (sale_id, status) => {
  const { data } = await axios.patch('/transfer/status', {
    sale_id,
    status
  });

  return data;
};
