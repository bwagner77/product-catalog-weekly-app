import { getAuthToken, triggerAuthRefresh } from '../context/AuthContext';

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401 || res.status === 403) {
    try {
      localStorage.removeItem('shoply_admin_token');
      // ensure same-window state refresh without relying on events timing
      triggerAuthRefresh();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:changed'));
        window.location.hash = '#login';
      }
    } catch (_err) {
      void 0;
    }
  }
  return res;
}
