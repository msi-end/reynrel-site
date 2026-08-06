import React, { createContext, useContext, useEffect, useState } from 'react';
import { clientApi, CLIENT_TOKEN_KEY } from '../lib/apiClient';

const ClientAuthContext = createContext(null);

export const ClientAuthProvider = ({ children }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    const token = localStorage.getItem(CLIENT_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return Promise.resolve(null);
    }
    return clientApi
      .get('/client/me')
      .then((res) => {
        setClient(res.data);
        return res.data;
      })
      .catch(() => {
        localStorage.removeItem(CLIENT_TOKEN_KEY);
        return null;
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (identifier, password) => {
    const res = await clientApi.post('/client/login', { identifier, password });
    localStorage.setItem(CLIENT_TOKEN_KEY, res.data.token);
    await refresh();
    return res.data.client;
  };

  const signup = async (name, email, mobile, password) => {
    const res = await clientApi.post('/client/signup', { name, email, mobile, password });
    localStorage.setItem(CLIENT_TOKEN_KEY, res.data.token);
    await refresh();
    return res.data.client;
  };

  const logout = () => {
    localStorage.removeItem(CLIENT_TOKEN_KEY);
    setClient(null);
  };

  return (
    <ClientAuthContext.Provider
      value={{ client, loading, login, signup, logout, refresh, isAuthenticated: !!client }}
    >
      {children}
    </ClientAuthContext.Provider>
  );
};

export const useClientAuth = () => useContext(ClientAuthContext);
