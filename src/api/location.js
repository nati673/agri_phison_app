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
  key: 'api/location',
  locations: '/location',
  modal: '/modal',
  create_location: '/location',
  update_location: '/location',
  delete_location: '/location'
};

export function useGetLocation() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data, isLoading, error, isValidating } = useSWR(`${endpoints.locations}/${companyId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      locations: data?.data || [],
      locationsLoading: isLoading,
      locationsError: error,
      locationsValidating: isValidating,
      locationsEmpty: !isLoading && !data?.locations?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function createLocation(newLocation) {
  const { company_id } = newLocation;

  mutate(
    `${endpoints.locations}/${company_id}`,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: [...current.data, { ...newLocation, id: Date.now() }]
      };
      return updated;
    },
    false
  );

  const createRes = await axios.post(endpoints.create_location, newLocation);

  await mutate(`${endpoints.locations}/${company_id}`);

  return createRes.data;
}

export async function updateLocation(LocationId, updatedLocation) {
  const { company_id } = updatedLocation;

  if (!company_id) throw new Error('Company ID is required');

  mutate(
    `${endpoints.locations}/${company_id}`,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.map((item) => (item.location_id === LocationId ? { ...item, ...updatedLocation } : item))
      };
      return updated;
    },
    false
  );

  const response = await axios.put(`${endpoints.update_location}/${LocationId}`, {
    location_id: LocationId,
    ...updatedLocation
  });

  await mutate(`${endpoints.roles}/${company_id}`);

  return response.data;
}

export async function deleteLocation(LocationData) {
  const endpoint = `${endpoints.locations}/${LocationData.company_id}`;

  mutate(
    endpoint,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.filter((item) => item.location_id !== LocationData.location_id)
      };
      return updated;
    },
    false
  );

  const res = await axios.delete(`${endpoints.delete_location}/${LocationData.location_id}`, {
    location_id: LocationData.location_id
  });

  await mutate(endpoint);

  return res.data;
}

export function useGetLocationMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      locationMaster: data,
      locationMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerLocationDialog(modal) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.modal,
    (currentLocationmaster) => {
      return { ...currentLocationmaster, modal };
    },
    false
  );
}
