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
  key: 'api/user',
  users: '/employees',
  create_user: '/create-employee',
  delete_user: '/employee',
  update: '/employee',
  user_info: '/employee/profile',
  update_profile: '/employee/profile',
  user_filter: '/employee/filter',

  getActivities: '/activity/employee',
  session: '/employee/session',
  getSessions: '/session/employee',
  goal: '/employee/goal',
  getGoals: '/goal/employee',
  updateGoal: '/goal',
  report: '/employee/report',
  getReports: '/report/employee'
};

export function useGetUsers() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data, isLoading, error, isValidating } = useSWR(`${endpoints.users}/${companyId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      users: data?.data || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.users?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetUserInfo() {
  const { user } = useAuth();
  const userId = user?.user_id;
  const { data, isLoading, error, isValidating } = useSWR(`${endpoints.user_info}/${userId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  const memoizedValue = useMemo(
    () => ({
      userInfo: data?.data || [],
      userInfoLoading: isLoading,
      userInfoError: error,
      userInfoValidating: isValidating,
      userInfoEmpty: !isLoading && !data?.userInfo?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}
export function useGetUserPermissions() {
  const { user } = useAuth();
  const userId = user?.user_id;
  const { data, isLoading, error, isValidating } = useSWR(`/employee/permissions/${userId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  const memoizedValue = useMemo(
    () => ({
      perm: data?.data || null,
      permLoading: isLoading,
      permError: error,
      permValidating: isValidating,
      permEmpty: !isLoading && !data?.data?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetUserByFilter(businessUnitId, locationId) {
  const { user } = useAuth();
  const companyID = user?.company_id;

  const shouldFetch = companyID && businessUnitId && locationId;
  const endpoint = shouldFetch
    ? `${endpoints.user_filter}?company_id=${companyID}&business_unit_id=${businessUnitId}&location_id=${locationId}`
    : null;

  const { data, isLoading, error, isValidating } = useSWR(endpoint, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  const memoizedValue = useMemo(
    () => ({
      userInfo: data ?? null,
      userInfoLoading: isLoading,
      userInfoError: error,
      userInfoValidating: isValidating,
      userInfoEmpty: !isLoading && !data
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function createNewUser(company_id, newUserData) {
  mutate(
    `${endpoints.users}/${company_id}`,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: [...current.data, { ...newUserData, id: Date.now() }]
      };
      return updated;
    },
    false
  );

  const createRes = await axios.post(endpoints.create_user, newUserData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  await mutate(`${endpoints.users}/${company_id}`);

  return createRes.data;
}

export async function deleteUser(userData) {
  const endpoint = `${endpoints.users}/${userData.company_id}`;

  mutate(
    endpoint,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.filter((item) => item.user_id !== userData.user_id)
      };
      return updated;
    },
    false
  );

  const res = await axios.delete(`${endpoints.delete_user}/${userData.user_id}`, {
    role_id: userData.role_id
  });

  await mutate(endpoint);

  return res.data;
}

export async function updateUser(user_id, company_id, updatedData) {
  const companyUsersKey = `${endpoints.users}/${company_id}`;

  mutate(
    companyUsersKey,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.map((item) => (item.user_id === user_id ? { ...item, ...updatedData } : item))
      };
      return updated;
    },
    false
  );

  const res = await axios.put(`${endpoints.update}/${user_id}`, updatedData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  await mutate(companyUsersKey);

  return res.data;
}

export async function updateUserProfile(user_id, updatedData) {
  const companyUsersKey = `${endpoints.user_info}/${user_id}`;

  mutate(
    companyUsersKey,
    (current) => {
      if (!current) return;
      const updated = {
        ...current,
        data: current.data.map((item) => (item.user_id === user_id ? { ...item, ...updatedData } : item))
      };
      return updated;
    },
    false
  );

  const res = await axios.put(`${endpoints.update_profile}/${user_id}`, updatedData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  await mutate(companyUsersKey);

  return res.data;
}

export function useGetUserMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      userMaster: data,
      userMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerUserDialog(modal) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.modal,
    (currentUsermaster) => {
      return { ...currentUsermaster, modal };
    },
    false
  );
}

export function useGetActivitiesByUser(user_id) {
  const { data, isLoading, error } = useSWR(`${endpoints.getActivities}/${user_id}`, fetcher);
  return useMemo(
    () => ({
      activities: data?.data || [],
      activitiesLoading: isLoading,
      activitiesError: error
    }),
    [data, isLoading, error]
  );
}

// Session
export async function createSession(sessionData) {
  const res = await axios.post(endpoints.session, sessionData);
  await mutate(`${endpoints.getSessions}/${sessionData.user_id}`);
  return res.data;
}

export function useGetSessionsByUser(user_id) {
  const { data, isLoading, error } = useSWR(`${endpoints.getSessions}/${user_id}`, fetcher);
  return useMemo(
    () => ({
      sessions: data?.data || [],
      sessionsLoading: isLoading,
      sessionsError: error
    }),
    [data, isLoading, error]
  );
}

// Goals
export async function createGoal(goalData) {
  const res = await axios.post(endpoints.goal, goalData);
  await mutate(`${endpoints.getGoals}/${goalData.user_id}`);
  return res.data;
}

export function useGetGoalsByUser(user_id) {
  const { data, isLoading, error } = useSWR(`${endpoints.getGoals}/${user_id}`, fetcher);
  return useMemo(
    () => ({
      goals: data?.data || [],
      goalsLoading: isLoading,
      goalsError: error
    }),
    [data, isLoading, error]
  );
}

export async function updateGoalAchievement(goal_id, achieved_value, user_id) {
  const res = await axios.put(`${endpoints.updateGoal}/${goal_id}/achieve`, { achieved_value });
  await mutate(`${endpoints.getGoals}/${user_id}`);
  return res.data;
}

// Report
export async function createReport(reportData) {
  const res = await axios.post(endpoints.report, reportData);
  await mutate(`${endpoints.getReports}/${reportData.target_user_id}`);
  return res.data;
}

export function useGetReportsByUser(user_id) {
  const { data, isLoading, error } = useSWR(`${endpoints.getReports}/${user_id}`, fetcher);
  return useMemo(
    () => ({
      reports: data?.data || [],
      reportsLoading: isLoading,
      reportsError: error
    }),
    [data, isLoading, error]
  );
}
