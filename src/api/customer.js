import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher } from 'utils/axios';
import useAuth from 'hooks/useAuth';
import axios from 'utils/axios';

const initialState = {
  modal: false
};

export const endpoints = {
  key: 'api/customer',
  customers: '/customers',
  modal: '/modal',
  create_customer: '/customer',
  update_customer: '/customer',
  delete_customer: '/customer'
};

export function useGetCustomer() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data, isLoading, error, isValidating } = useSWR(`${endpoints.customers}/${companyId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      customers: data?.data || [],
      customersLoading: isLoading,
      customersError: error,
      customersValidating: isValidating,
      customersEmpty: !isLoading && !data?.customers?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function createCustomers(newCustomer) {
  const { company_id } = newCustomer;

  mutate(
    `${endpoints.customers}/${company_id}`,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: [...current.data, { ...newCustomer, id: Date.now() }]
      };
      return updated;
    },
    false
  );

  const createRes = await axios.post(endpoints.create_customer, newCustomer);

  await mutate(`${endpoints.customers}/${company_id}`);

  return createRes.data;
}

export async function updateCustomer(customerId, updatedCustomer) {
  const { company_id } = updatedCustomer;

  if (!company_id) throw new Error('Company ID is required');

  mutate(
    `${endpoints.customers}/${company_id}`,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.map((item) => (item.customer_id === customerId ? { ...item, ...updatedCustomer } : item))
      };
      return updated;
    },
    false
  );

  const response = await axios.put(`${endpoints.update_customer}/${customerId}`, {
    ...updatedCustomer
  });



  await mutate(`${endpoints.customers}/${company_id}`);

  return response.data;
}

export async function deleteCustomer(customerData) {
  const endpoint = `${endpoints.customers}/${customerData.company_id}`;

  mutate(
    endpoint,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.filter((item) => item.customer_id !== customerData.customer_id)
      };
      return updated;
    },
    false
  );

  const res = await axios.delete(`${endpoints.delete_customer}/${customerData.customer_id}`, {
    customer_id: customerData.customer_id
  });

  await mutate(endpoint);

  return res.data;
}

export function useGetCustomerMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      customerMaster: data,
      customerMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerCustomerDialog(modal) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.modal,
    (currentCustomermaster) => {
      return { ...currentCustomermaster, modal };
    },
    false
  );
}
