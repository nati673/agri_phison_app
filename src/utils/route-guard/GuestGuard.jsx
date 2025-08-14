import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import useAuth from 'hooks/useAuth';
import { getSubdomain, hasSubdomain } from 'utils/redirectToSubdomain';
import { APP_DEFAULT_PATH } from 'config';

export default function AuthGuard({ children }) {
  const { isLoggedIn, getTenantBySubdomain } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isTenant = hasSubdomain();

  useEffect(() => {
    const subdomain = getSubdomain();

    (async () => {
      if (isTenant) {
        const tenant = await getTenantBySubdomain(subdomain);

        if (!tenant?.isFound) {
          navigate('/maintenance/no-workspace', { replace: true });
          return;
        }
      }

      // if (isLoggedIn) {
      //   navigate(location?.state?.from ? location?.state?.from : APP_DEFAULT_PATH, {
      //     state: { from: '' },
      //     replace: true
      //   });
      // }
    })();
  }, [isLoggedIn]);

  return children;
}

AuthGuard.propTypes = { children: PropTypes.any };
