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
