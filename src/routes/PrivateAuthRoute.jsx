import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router';
import useAuth from 'hooks/useAuth';
// import Loader from 'pages/widget/loader';
const PrivateAuthRoute = ({ roles, children }) => {
  const { user } = useAuth();
  const [isChecked, setIsChecked] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const serviceToken = window.localStorage.getItem('serviceToken');

      if (serviceToken) {
        setIsLogged(true);

     
        if (roles && roles.length > 0 && roles.includes(user.role)) {
          setIsAuthorized(true);
        }
      }
      setIsChecked(true);
    };
    checkAuth();
    const intervalId = setInterval(checkAuth, 1000);
    return () => clearInterval(intervalId);
  }, [roles]);

  if (!isChecked) {
    return (
      <div>
        {/* <Loader />   just for now */}
        Loading...
      </div>
    );
  }

  if (!isLogged) {
    // If not logged in or not authorized, redirect to login page
    return <Navigate to="/login" />;
  } else if (isLogged && !isAuthorized) {
    return <Navigate to="/maintenance/403" />;
  }

  return children;
};

export default PrivateAuthRoute;
