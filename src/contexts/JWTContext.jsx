import { createContext, useEffect, useReducer } from 'react';

// third-party
import { Chance } from 'chance';
import { jwtDecode } from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project-imports
import Loader from 'components/Loader';
import axios from 'utils/axios';
import { useNavigate } from 'react-router';

const chance = new Chance();

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  company: null
};

const verifyToken = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded = jwtDecode(serviceToken);

  /**
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');
        if (serviceToken && verifyToken(serviceToken)) {
          // get company data

          setSession(serviceToken);
          const decoded = jwtDecode(serviceToken);
          const user = decoded;
          const companyData = await getCompanyInfo(user.company_id);

          // if (companyData?.setup_status?.status === 'incomplete') {
          //     window.location.href = '/price'; // ✅ correct
          //   }

          // ✅ Set the page title
          if (companyData?.company_info?.company_name) {
            document.title = companyData?.company_info?.company_name;
          }

          dispatch({
            type: LOGIN,
            payload: {
              isLoggedIn: true,
              user,
              company: companyData
            }
          });
        } else {
          dispatch({
            type: LOGOUT
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: LOGOUT
        });
      }
    };

    init();
  }, []);

  const login = async (email, password, subdomain) => {
    const LoginData = { email, password, subdomain };
    const response = await axios.post('/login', LoginData);
    if (response.data.status === 'success') {
      localStorage.setItem('user_email', response.data.data.user_email);
      window.location.href = '/auth/code-verification';
    } else {
      return response.data;
    }
  };
  const verifyOtp = async (otp) => {
    const UserEmail = localStorage.getItem('user_email');
    const OTPData = { otp: otp, email: UserEmail };
    const response = await axios.post('/code-verification', OTPData);
    if (response.data.status === 'success') {
      const { access_token } = response.data.data;
      setSession(access_token);
      const user = jwtDecode(access_token);

      dispatch({
        type: LOGIN,
        payload: {
          isLoggedIn: true,
          user
        }
      });
      return { SUBDOMAIN: user.subdomain, COMPANY_ID: user.company_id };
    }
  };
  // /check-subdomain
  const getTenantSubdomain = async (params) => {
    try {
      const { data } = await axios.get(`/tenant-subdomain`, { params });

      if (data?.status) {
        return data;
      } else {
        return data;
      }
    } catch (error) {
      return error;
    }
  };

  const getTenantBySubdomain = async (params) => {
    try {
      const { data } = await axios.get(`/check-subdomain/${params}`);
      return data;
    } catch (error) {
      console.error('Error checking subdomain:', error?.response?.data || error.message);
      return {
        status: false,
        message: error?.response?.data?.message || 'Server error while checking subdomain'
      };
    }
  };

  const getCompanyInfo = async (companyId) => {
    try {
      const { data } = await axios.get(`/company-info/${companyId}`);

      if (data?.status === 'success') {
        return data.data;
      } else {
        throw new Error(data?.message || 'Failed to fetch company info');
      }
    } catch (error) {
      console.error('Error fetching company info:', error.message);
      return null;
    }
  };

  const resendOtp = async () => {
    const UserEmail = localStorage.getItem('user_email');
    const Data = { email: UserEmail };
    const response = await axios.post('/resend-code', Data);
    return response.data;
  };

  const resetPasswordReq = async (email, subdomain) => {
    const PasswordResetData = { email: email, subdomain: subdomain };
    const response = await axios.post('/request-password-reset', PasswordResetData);
    return response;
  };
  const resetPassword = async (token, pass) => {
    const UserEmail = localStorage.getItem('user_email');
    const newPasswordData = { token: token, newPassword: pass };
    const response = await axios.post('/reset-password', newPasswordData);

    return response;
  };

  const changePassword = async (currentPassword, newPassword, userId) => {
    const newPasswordData = { currentPassword: currentPassword, newPassword: newPassword };
    const { data } = await axios.post(`/employee/change-password/${userId}`, newPasswordData);

    return data;
  };

  const register = async (email, password, firstName, lastName, company, phone_number) => {
    try {
      const response = await axios.post('/register', {
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        company_name: company,
        phone_number
      });

      return response.data;
    } catch (error) {
      const message = error.error || 'Registration failed';
      console.error('Registration failed:', message);
      throw new Error(message);
    }
  };
  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
  };

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext.Provider
      value={{
        ...state,
        login,
        getTenantSubdomain,
        getTenantBySubdomain,
        getCompanyInfo,
        logout,
        verifyOtp,
        resendOtp,
        register,
        resetPassword,
        resetPasswordReq,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </JWTContext.Provider>
  );
};

export default JWTContext;
