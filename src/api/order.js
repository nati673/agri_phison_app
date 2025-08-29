import useAuth from 'hooks/useAuth';
import { useMemo } from 'react';
import useSWR from 'swr';
import axios, { fetcher } from 'utils/axios';

// Loader (empty for now, can preload something later)
export async function loader() {
  return [];
}

// Filter & get orders
export async function filterOrders(companyId, filter) {
  try {
    const { data } = await axios.post(`/order/orders/filter/${companyId}`, filter);
    return data.data;
  } catch (error) {
    console.error('Failed to filter orders:', error);
    return [];
  }
}

// React hook to get orders via SWR
export function useGetOrders() {
  const { user } = useAuth();
  const companyId = user?.company_id;

  const { data, isLoading, error, isValidating } = useSWR(companyId ? `/order/orders/filter/${companyId}` : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      orders: data?.data || [],
      ordersLoading: isLoading,
      ordersError: error,
      ordersValidating: isValidating,
      ordersEmpty: !isLoading && !data?.data?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
export function useGetOrderInfoForSales(ORDER_UUID) {
  const { data, isLoading, error, isValidating } = useSWR(ORDER_UUID && `/order/info/${ORDER_UUID}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      orderInfo: data?.data || null,
      orderInfoLoading: isLoading,
      orderInfoError: error,
      orderInfoValidating: isValidating,
      orderInfoEmpty: !isLoading && !data?.data?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
// Add a new order
export async function addOrder(payload) {
  const { data } = await axios.post(`/order/add-new-order`, payload);
  return data;
}

// Update order
export async function updateOrder(order_id, payload) {
  const { data } = await axios.put(`/order/${order_id}`, payload);
  return data;
}

// Update order status
export async function updateOrderStatus(order_id, status) {
  const { data } = await axios.patch(`/order/status`, {
    order_id,
    status
  });
  return data;
}

// Delete order
export async function deleteOrder(order_id) {
  const { data } = await axios.delete(`/order/${order_id}`);
  return data;
}
