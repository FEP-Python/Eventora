import { User } from '@/type';

// Client-side authentication utilities (to be used in client components)
export const clientAuthUtils = {
  // Check if user is authenticated (client-side only)
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Get current user (client-side only)
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userString = localStorage.getItem('user');
    try {
      return userString ? JSON.parse(userString) : null;
    } catch {
      return null;
    }
  },

  // Get auth token (client-side only)
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  // Clear authentication data
  clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Set authentication data
  setAuth(token: string, user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};
