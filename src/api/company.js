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
  key: 'api/Company',
  list: '/list', // server URL
  logo: '/company-logo', // server URL
  modal: '/modal', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete', // server URL
  update_company_info: '/company-info',
  company_info: '/company-info'
};

export function useGetCompanyInfo() {
  const { user } = useAuth();
  const companyId = user?.company_id;
  const { data, isLoading, error, isValidating } = useSWR(`${endpoints.company_info}/${companyId}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      companyInfo: data?.data || [],
      companyInfoLoading: isLoading,
      companyInfoError: error,
      companyInfoValidating: isValidating,
      companyInfoEmpty: !isLoading && !data?.companyInfo?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetCompanyLogo(subdomain) {
  const { data, isLoading, error, isValidating } = useSWR(`${endpoints.logo}/${subdomain}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      companyLogo: data?.logo,
      companyLoading: isLoading,
      companyError: error,
      companyValidating: isValidating,
      companyEmpty: !isLoading && !data?.company?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function insertCompany(newCompany) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentCompany) => {
      newCompany.id = currentCompany.Companys.length + 1;
      const addedCompany = [...currentCompany.Companys, newCompany];

      return {
        ...currentCompany,
        Companys: addedCompany
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { newCompany };
  //   await axios.post(endpoints.key + endpoints.insert, data);
}

export async function updateCompanyInfo(company_id, updatedData) {
  const res = await axios.put(`${endpoints.update_company_info}/${company_id}`, updatedData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return res.data;
}

export async function deleteCompany(CompanyId) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentCompany) => {
      const nonDeletedCompany = currentCompany.Companys.filter((Company) => Company.id !== CompanyId);

      return {
        ...currentCompany,
        Companys: nonDeletedCompany
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { CompanyId };
  //   await axios.post(endpoints.key + endpoints.delete, data);
}
