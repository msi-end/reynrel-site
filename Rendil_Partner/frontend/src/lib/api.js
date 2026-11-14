// Small fetch client. One instance per area (admin / partner) with its own token.
export class ApiError extends Error {
  constructor(status, data) {
    super(data?.error || `Request failed (${status})`);
    this.status = status;
    this.fields = data?.fields || null;
  }
}

function createClient(area) {
  const key = `rp_${area}_token`;
  const getToken = () => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const setToken = (t) => {
    try { t ? localStorage.setItem(key, t) : localStorage.removeItem(key); } catch { /* storage unavailable */ }
  };

  async function request(method, path, body) {
    const headers = {};
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    let payload;
    if (body instanceof FormData) payload = body;
    else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }
    const res = await fetch(`/api${path}`, { method, headers, body: payload });
    if (res.status === 204) return null;
    const isJson = (res.headers.get('content-type') || '').includes('application/json');
    const data = isJson ? await res.json().catch(() => ({})) : await res.blob();
    if (!res.ok) {
      if (res.status === 401 && token) {
        setToken(null);
        window.dispatchEvent(new CustomEvent('rp:logout', { detail: area }));
      }
      throw new ApiError(res.status, isJson ? data : null);
    }
    return data;
  }

  return {
    getToken, setToken,
    get: (p) => request('GET', p),
    post: (p, b) => request('POST', p, b ?? {}),
    put: (p, b) => request('PUT', p, b ?? {}),
    del: (p) => request('DELETE', p),
    blob: (p) => request('GET', p)
  };
}

export const adminApi = createClient('admin');
export const partnerApi = createClient('partner');
export const publicApi = createClient('public');

export const qs = (params) => {
  const s = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)).toString();
  return s ? `?${s}` : '';
};
