import useAuth from 'hooks/useAuth';
import { useMemo } from 'react';
import useSWR from 'swr';
import axios, { fetcher } from 'utils/axios';

export async function loader() {
  return [];
}

export async function AddNewSales(formattedPayload) {
  try {
    const { data } = await axios.post('/sales/add-new-sales', formattedPayload);
    return data;
  } catch (error) {
    console.error('AddNewSales API error:', error);
    throw error;
  }
}

export async function filterSales(companyId, filter) {
  try {
    const { data } = await axios.post(`/sales/filter/${companyId}`, filter);
    return data.data;
  } catch (error) {
    console.error('Failed to filter sales:', error);
    return [];
  }
}

export async function updateSales(sale_id, formattedPayload) {
  const { data } = await axios.put(`/sales/${sale_id}`, formattedPayload);

  return data;
}
export async function deleteSales(adjustmentId) {
  const { data } = await axios.delete(`/sales/${adjustmentId}`);

  return data;
}

export const updateSalesStatus = async (sale_id, status) => {
  const { data } = await axios.patch('/sales/status', {
    sale_id,
    status
  });

  return data;
};
