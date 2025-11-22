import React from 'react';
import { useAuth } from '../context/AuthContext';
import AccessDenied from './AccessDenied';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authenticated } = useAuth();
  if (!authenticated) {
    return <AccessDenied />;
  }
  return <>{children}</>;
};

export default PrivateRoute;
