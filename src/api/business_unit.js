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
  business_units: '/business-units',
  create_business_unit: '/business-unit',
  update_business_unit: '/business-unit',
  modal: '/modal',
  insert: '/insert',
  update: '/update',
  delete_business_unit: '/business-unit'
};

export function useGetBusinessUnit() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data, isLoading, error, isValidating } = useSWR(`${endpoints.business_units}/${companyId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      BusinessUnits: data?.data || [],
      BusinessUnitsLoading: isLoading,
      BusinessUnitsError: error,
      BusinessUnitsValidating: isValidating,
      BusinessUnitsEmpty: !isLoading && !data?.BusinessUnits?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function createBusinessUnit(newBusinessUnit) {
  const { company_id } = newBusinessUnit;

  mutate(
    `${endpoints.business_units}/${company_id}`,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: [...current.data, { ...newBusinessUnit, id: Date.now() }]
      };
      return updated;
    },
    false
  );

  const createRes = await axios.post(endpoints.create_business_unit, newBusinessUnit);

  await mutate(`${endpoints.business_units}/${company_id}`);

  return createRes.data;
}

export async function updateBusinessUnit(BusinessUnitId, updatedBusinessUnit) {
  const { company_id } = updatedBusinessUnit;

  if (!company_id) throw new Error('Company ID is required');

  mutate(
    `${endpoints.business_units}/${company_id}`,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.map((item) => (item.business_unit_id === BusinessUnitId ? { ...item, ...updatedBusinessUnit } : item))
      };
      return updated;
    },
    false
  );

  const response = await axios.put(`${endpoints.update_business_unit}/${BusinessUnitId}`, {
    business_unit_id: BusinessUnitId,
    ...updatedBusinessUnit
  });

  await mutate(`${endpoints.roles}/${company_id}`);

  return response.data;
}

export async function deleteBusinessUnit(BusinessUnitData) {
  const endpoint = `${endpoints.business_units}/${BusinessUnitData.company_id}`;

  // Optimistic UI update
  mutate(
    endpoint,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.filter((item) => item.business_unit_id !== BusinessUnitData.business_unit_id)
      };
      return updated;
    },
    false
  );

  // Backend deletion
  const res = await axios.delete(`${endpoints.delete_business_unit}/${BusinessUnitData.business_unit_id}`, {
    business_unit_id: BusinessUnitData.business_unit_id
  });

  await mutate(endpoint);

  return res.data;
}
export function useGetBusinessUnitMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      BusinessUnitMaster: data,
      BusinessUnitMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerBusinessUnitDialog(modal) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.modal,
    (currentBusinessUnitmaster) => {
      return { ...currentBusinessUnitmaster, modal };
    },
    false
  );
}
