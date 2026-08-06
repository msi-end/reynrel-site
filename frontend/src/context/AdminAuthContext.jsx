import React, { createContext, useContext, useEffect, useState } from 'react';
import { adminApi, ADMIN_TOKEN_KEY } from '../lib/apiClient';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    adminApi
      .get('/admin/me')
      .then((res) => setAdmin(res.data))
      .catch(() => localStorage.removeItem(ADMIN_TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const res = await adminApi.post('/admin/login', { username, password });
    localStorage.setItem(ADMIN_TOKEN_KEY, res.data.token);
    setAdmin(res.data.admin);
    return res.data.admin;
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
