// action - state management
import { REGISTER, LOGIN, LOGOUT } from './actions';

// initial state
export const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  company: null
};

// ==============================|| AUTH REDUCER ||============================== //

const auth = (state = initialState, action) => {
  switch (action.type) {
    case REGISTER: {
      const { user } = action.payload;
      return {
        ...state,
        user,
        company
      };
    }
    case LOGIN: {
      const { user, company } = action.payload;
      return {
        ...state,
        isLoggedIn: true,
        isInitialized: true,
        user,
        company
      };
    }
    case LOGOUT: {
      return {
        ...state,
        isInitialized: true,
        isLoggedIn: false,
        user: null,
        company: null
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default auth;
