import React from 'react';
import { useAuth } from '../context/AuthContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authenticated } = useAuth();
  if (!authenticated) {
    return <p role="alert" className="text-sm text-red-600">Access denied – please log in.</p>;
  }
  return <>{children}</>;
};

export default PrivateRoute;
