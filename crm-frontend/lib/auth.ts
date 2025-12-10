// lib/auth.ts
export const TOKEN_KEY = 'token';
export const EXPIRES_KEY = 'expires_at';

export function loginClient(token: string, expiresInSeconds = 15 * 60) {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_KEY, String(expiresAt));

  // schedule auto logout
  scheduleAutoLogout();
}

export function logoutClient() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
  // redirect to login
  if (typeof window !== 'undefined') window.location.href = '/login';
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem(TOKEN_KEY);
  const exp = Number(localStorage.getItem(EXPIRES_KEY) || '0');
  if (!token) return false;
  if (Date.now() > exp) {
    logoutClient();
    return false;
  }
  return true;
}

let logoutTimer: number | null = null;
export function scheduleAutoLogout() {
  if (typeof window === 'undefined') return;
  if (logoutTimer) window.clearTimeout(logoutTimer);

  const exp = Number(localStorage.getItem(EXPIRES_KEY) || '0');
  const remaining = exp - Date.now();
  if (remaining <= 0) {
    logoutClient();
    return;
  }
  logoutTimer = window.setTimeout(() => {
    alert('Session expired. You have been logged out.');
    logoutClient();
  }, remaining);
}

