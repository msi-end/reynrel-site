import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// One provider per area. The current user is a cached query, so pages read it without re-fetching
// and the app shows a splash only on the very first load (no login-page flash).
export function createAuth(area, api, mePath) {
  const Ctx = createContext(null);

  function Provider({ children }) {
    const qc = useQueryClient();
    const [token, setTokenState] = useState(() => api.getToken());
    const me = useQuery({ queryKey: [area, 'me'], queryFn: () => api.get(mePath), enabled: !!token, staleTime: 60_000, placeholderData: undefined });

    const logout = useCallback(() => {
      api.setToken(null);
      setTokenState(null);
      qc.removeQueries({ queryKey: [area] });
    }, [qc]);

    useEffect(() => {
      const onLogout = (e) => e.detail === area && logout();
      window.addEventListener('rp:logout', onLogout);
      return () => window.removeEventListener('rp:logout', onLogout);
    }, [logout]);

    const signIn = useCallback(async (newToken) => {
      api.setToken(newToken);
      qc.removeQueries({ queryKey: [area] });
      setTokenState(newToken);
      await qc.fetchQuery({ queryKey: [area, 'me'], queryFn: () => api.get(mePath) });
    }, [qc]);

    const value = useMemo(() => ({
      user: token ? me.data || null : null,
      ready: !token || me.isFetched,
      signIn,
      logout,
      refresh: () => qc.invalidateQueries({ queryKey: [area, 'me'] })
    }), [token, me.data, me.isFetched, signIn, logout, qc]);

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
  }

  const useAuth = () => useContext(Ctx);
  return { Provider, useAuth };
}
