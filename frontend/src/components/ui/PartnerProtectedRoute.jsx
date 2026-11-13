import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePartnerAuth } from '../../context/PartnerAuthContext';

const PartnerProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = usePartnerAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="w-10 h-10 border-4 border-[var(--color-muted)] border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/partners/login" replace />;
  return children;
};

export default PartnerProtectedRoute;
