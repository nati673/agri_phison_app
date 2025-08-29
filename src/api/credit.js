import useAuth from 'hooks/useAuth';
import { useMemo } from 'react';
import useSWR from 'swr';
import axios, { fetcher } from 'utils/axios';

export async function loader() {
  return [];
}

export async function filterCredit(companyId, filter) {
  try {
    const { data } = await axios.post(`/credit/filter/${companyId}`, filter);
    return data.data;
  } catch (error) {
    console.error('Failed to filter credit:', error);
    return [];
  }
}

export async function updateCredit(adjustment_id, formattedPayload) {
  const { data } = await axios.put(`/credit/${adjustment_id}`, formattedPayload);

  return data;
}

export async function payCredits(credit_id, amount) {
  const { data } = await axios.post(`/credit/pay/${credit_id}`, { amount: amount, credit_id: credit_id });

  return data;
}
export async function deleteCreditPayment(payment_id) {
  const { data } = await axios.delete(`/credit/payment/${payment_id}`);

  return data;
}

export const updateCreditStatus = async (sale_id, status) => {
  const { data } = await axios.patch('/credit/status', {
    sale_id,
    status
  });

  return data;
};
