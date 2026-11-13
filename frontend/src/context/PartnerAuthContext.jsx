import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { partnerApi, PARTNER_TOKEN_KEY } from '../lib/apiClient';

const PartnerAuthContext = createContext(null);

export const PartnerAuthProvider = ({ children }) => {
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    const token = localStorage.getItem(PARTNER_TOKEN_KEY);
    if (!token) {
      setPartner(null);
      setLoading(false);
      return Promise.resolve(null);
    }
    return partnerApi
      .get('/partner/me')
      .then((res) => {
        setPartner(res.data);
        return res.data;
      })
      .catch(() => {
        localStorage.removeItem(PARTNER_TOKEN_KEY);
        setPartner(null);
        return null;
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (identifier, password) => {
    const res = await partnerApi.post('/partners/login', { identifier, password });
    localStorage.setItem(PARTNER_TOKEN_KEY, res.data.token);
    return refresh();
  };

  const logout = () => {
    localStorage.removeItem(PARTNER_TOKEN_KEY);
    setPartner(null);
  };

  return (
    <PartnerAuthContext.Provider value={{ partner, loading, login, logout, refresh, isAuthenticated: !!partner }}>
      {children}
    </PartnerAuthContext.Provider>
  );
};

export const usePartnerAuth = () => useContext(PartnerAuthContext);
