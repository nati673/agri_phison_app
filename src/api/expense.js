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
  key: 'api/expense',
  expenses: '/expenses',
  modal: '/modal',
  create_expense: '/expense',
  update_expense: '/expense',
  delete_expense: '/expense'
};

export function useGetExpenses() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data, isLoading, error, isValidating } = useSWR(`${endpoints.expenses}/${companyId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      expenses: data?.data || [],
      expensesLoading: isLoading,
      expensesError: error,
      expensesValidating: isValidating,
      expensesEmpty: !isLoading && !data?.data?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function createExpenses(newExpense) {
  const { company_id } = newExpense;

  // mutate(
  //   `${endpoints.expenses}/${company_id}`,
  //   (current) => {
  //     if (!current) return;
  //     const updated = {
  //       ...current,
  //       data: [...current.data, { ...newExpense, id: Date.now() }]
  //     };
  //     return updated;
  //   },
  //   false
  // );

  const { data } = await axios.post(endpoints.create_expense, newExpense);

  // await mutate(`${endpoints.expenses}/${company_id}`);

  return data;
}

export async function updateExpense(expenseId, updatedExpense) {
  const { company_id } = updatedExpense;

  if (!company_id) throw new Error('Company ID is required');

  mutate(
    `${endpoints.expenses}/${company_id}`,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.map((item) => (item.expense_id === expenseId ? { ...item, ...updatedExpense } : item))
      };
      return updated;
    },
    false
  );

  const response = await axios.put(`${endpoints.update_expense}/${expenseId}`, {
    ...updatedExpense
  });

  await mutate(`${endpoints.expenses}/${company_id}`);

  return response.data;
}

export async function deleteExpense(id, company_id) {
  const endpoint = `${endpoints.expenses}/${company_id}`;

  mutate(
    endpoint,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.filter((item) => Number(item.expense_id) !== id)
      };
      return updated;
    },
    false
  );

  const res = await axios.delete(`/expense/${id}`);

  await mutate(endpoint);

  return res.data;
}

export function useGetExpenseMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      expenseMaster: data,
      expenseMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerExpenseDialog(modal) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.modal,
    (currentExpensemaster) => {
      return { ...currentExpensemaster, modal };
    },
    false
  );
}
