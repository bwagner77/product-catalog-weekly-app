import { getAuthToken } from '../context/AuthContext';

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = getAuthToken();
  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401 || res.status === 403) {
    try {
      const txt = await res.clone().text();
      let body: any = null;
      try { body = txt ? JSON.parse(txt) : null; } catch {}
      const code = body?.error;
      if (code === 'admin_auth_required' || code === 'token_expired' || code === 'forbidden_admin_role') {
        localStorage.removeItem('shoply_admin_token');
        // Attempt soft redirect to login view
        if (typeof window !== 'undefined') {
          // simplistic: rely on App internal state via location hash
          window.location.hash = '#login';
        }
      }
    } catch {
      // ignore
    }
  }
  return res;
}
