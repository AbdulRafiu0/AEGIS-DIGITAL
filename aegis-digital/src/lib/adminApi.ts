// Shared fetch helper for admin-only endpoints.
// Attaches the signed session token (from /api/admin/login) to every request
// and forces a re-login if the server ever responds 401 (expired/invalid
// token, or ADMIN_SESSION_SECRET rotated). Centralizing this means the
// Authorization header can't be forgotten on some new admin fetch call later.

export const API_BASE = 'https://aegis-api.rafiuraza474.workers.dev';

const TOKEN_KEY = 'aegis_admin_token';

export function getAdminToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem('aegis_admin_session');
  sessionStorage.removeItem('aegis_admin_user');
}

/**
 * Wraps fetch() for admin API calls. Prepends API_BASE if given a relative
 * path, attaches `Authorization: Bearer <token>`, and — on a 401 — clears
 * the session and reloads the page so the user lands back on the login gate.
 */
export async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    clearAdminSession();
    window.location.reload();
  }

  return response;
}