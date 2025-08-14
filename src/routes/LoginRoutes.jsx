import { lazy } from 'react';

// project-imports
import AuthLayout from 'layout/Auth';
import Loadable from 'components/Loadable';
import { Navigate } from 'react-router';

// render - login
const AuthLogin = Loadable(lazy(() => import('pages/auth/auth1/login')));
const AuthRegister = Loadable(lazy(() => import('pages/auth/auth1/register')));
const AuthForgotPassword = Loadable(lazy(() => import('pages/auth/auth1/forgot-password')));
const AuthCheckMail = Loadable(lazy(() => import('pages/auth/auth1/check-mail')));
const AuthResetPassword = Loadable(lazy(() => import('pages/auth/auth1/reset-password')));
const AuthCodeVerification = Loadable(lazy(() => import('pages/auth/auth1/code-verification')));
const Setup = Loadable(lazy(() => import('pages/apps/setup/setup')));

// ==============================|| AUTH ROUTES ||============================== //

const LoginRoutes = {
  path: '/',
  element: <AuthLayout />,
  children: [
    {
      children: [
        {
          path: '/login',
          element: <AuthLogin />
        },
        {
          path: 'setup',
          element: <Setup />
        },
        {
          path: 'register',
          element: <AuthRegister />
        },
        {
          path: 'forgot-password',
          element: <AuthForgotPassword />
        },
        {
          path: 'check-mail',
          element: <AuthCheckMail />
        },
        {
          path: 'reset-password',
          element: <AuthResetPassword />
        },
        {
          path: 'code-verification',
          element: <AuthCodeVerification />
        }
      ]
    }
  ]
};

export default LoginRoutes;
