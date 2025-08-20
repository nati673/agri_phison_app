import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// project-import
import axios, { fetcher } from 'utils/axios';


export const endpoints = {
  list: '/invoices',
  update: '/invoice'
};

export function useGetInvoice() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.list, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      invoice: data?.data || [],
      invoiceLoading: isLoading,
      invoiceError: error,
      invoiceValidating: isValidating,
      invoiceEmpty: !isLoading && !data?.invoice?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function updateInvoice(invoiceId, updatedInvoice) {
  mutate(
    endpoints.list,
    (currentInvoice) => {
      const newInvoice = currentInvoice.invoice.map((invoice) =>
        invoice.invoice_id === invoiceId ? { ...invoice, ...updatedInvoice } : invoice
      );

      return {
        ...currentInvoice,
        invoice: newInvoice
      };
    },
    false
  );

  const response = await axios.put(`${endpoints.update}/${invoiceId}`, {
    ...updatedInvoice
  });

  await mutate(`${endpoints.list}`);

  return response.data;
}
