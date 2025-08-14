import axios from 'axios';

const axiosServices = axios.create({ baseURL: import.meta.env.VITE_APP_API_URL });

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['x-access-token'] = `${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosServices.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      return Promise.reject('Network or Server Error');
    }

    const { status, data } = response;

    const currentPath = window.location.pathname;

    // Optional: Avoid infinite redirects
    const redirectTo = (path) => {
      if (currentPath !== path) window.location.pathname = path;
    };

    if (status === 401 && !currentPath.includes('/login')) {
      redirectTo('/maintenance/500');
    }

    if (status === 403) {
      switch (data.code) {
        case 'TENANT_MISMATCH':
          redirectTo('/maintenance/no-workspace');
          break;
        case 'USER_INACTIVE':
          redirectTo('/maintenance/inactive-user');
          break;
        case 'COMPANY_INACTIVE':
          redirectTo('/maintenance/inactive-company');
          break;
        case 'NO_ACTIVE_SUBSCRIPTION':
          redirectTo('/subscription/expired');
          break;
        default:
          redirectTo('/maintenance/403');
      }
    }

    return Promise.reject(data || 'Unexpected Error');
  }
);

export default axiosServices;

export const fetcher = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
};

export const fetcherPost = async (args) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.post(url, { ...config });

  return res.data;
};
