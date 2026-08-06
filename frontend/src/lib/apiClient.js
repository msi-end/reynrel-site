import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const ADMIN_TOKEN_KEY = 'reynrel_admin_token';
export const CLIENT_TOKEN_KEY = 'reynrel_client_token';

export const publicApi = axios.create({ baseURL: BASE_URL });

function createAuthedApi(tokenKey, loginPath) {
  const instance = axios.create({ baseURL: BASE_URL });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem(tokenKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response?.status === 401) {
        localStorage.removeItem(tokenKey);
        if (window.location.pathname !== loginPath) {
          window.location.href = loginPath;
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

export const adminApi = createAuthedApi(ADMIN_TOKEN_KEY, '/admin/login');
export const clientApi = createAuthedApi(CLIENT_TOKEN_KEY, '/client/login');
