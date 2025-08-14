import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';

// utils
import { fetcher } from 'utils/axios';
import useAuth from 'hooks/useAuth';
import axios from 'utils/axios';

export const endpoints = {
  roles: '/access-control/roles',
  create_role: '/access-control/create-role',
  permissions: '/access-control/permissions',
  delete_role: '/access-control/role',
  update_role: '/access-control/role'
};

export function useGetRoles() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data, isLoading, error, isValidating } = useSWR(`${endpoints.roles}/${companyId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  const memoizedValue = useMemo(
    () => ({
      roles: data?.roles || [],
      rolesLoading: isLoading,
      rolesError: error,
      rolesValidating: isValidating,
      rolesEmpty: !isLoading && (!data?.data || data?.data.length === 0)
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetPermissions() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.permissions, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      permissions: data?.permissions || [],
      permissionsLoading: isLoading,
      permissionsError: error,
      permissionsValidating: isValidating,
      permissionsEmpty: !isLoading && (!data?.data || data?.data.length === 0)
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function createNewRole(newRoleData) {
  const { company_id } = newRoleData;

  mutate(
    `${endpoints.roles}/${company_id}`,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: [...current.data, { ...newRoleData, id: Date.now() }]
      };
      return updated;
    },
    false
  );

  const createRes = await axios.post(endpoints.create_role, newRoleData);

  await mutate(`${endpoints.roles}/${company_id}`);

  return createRes.data;
}


export async function updateRole(roleId, updateRoleData) {
  const { company_id } = updateRoleData;

  if (!company_id) throw new Error('Company ID is required');

  mutate(
    `${endpoints.roles}/${company_id}`,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.map((item) => (item.role_id === roleId ? { ...item, ...updateRoleData } : item))
      };
      return updated;
    },
    false
  );

  const response = await axios.put(endpoints.update_role, {
    role_id: roleId,
    ...updateRoleData
  });

  await mutate(`${endpoints.roles}/${company_id}`);

  return response.data;
}

export async function deleteRole(roleData) {
  const endpoint = `${endpoints.roles}/${roleData.company_id}`;

  // Optimistic UI update
  mutate(
    endpoint,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.filter((item) => item.role_id !== roleData.role_id)
      };
      return updated;
    },
    false // skip revalidation for now
  );

  // Backend deletion
  const res = await axios.delete(`${endpoints.delete_role}/${roleData.role_id}`, {
    role_id: roleData.role_id
  });

  await mutate(endpoint);

  return res.data;
}
