import React from 'react';
import { Navigate } from 'react-router-dom';
import { useClientAuth } from '../../context/ClientAuthContext';

const ClientProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useClientAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-[var(--color-muted-foreground)]">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/client/login" replace />;
  }

  return children;
};

export default ClientProtectedRoute;
