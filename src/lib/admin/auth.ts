import { ADMIN_AUTH_KEY, ADMIN_PASSWORD, ADMIN_USERNAME } from '@/lib/admin/constants';

export function isAdminAuthed(): boolean {
  return typeof window !== 'undefined' && localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}

export function setAdminAuthed(): void {
  localStorage.setItem(ADMIN_AUTH_KEY, 'true');
}

export function clearAdminAuth(): void {
  localStorage.removeItem(ADMIN_AUTH_KEY);
}

export function validateAdminCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
