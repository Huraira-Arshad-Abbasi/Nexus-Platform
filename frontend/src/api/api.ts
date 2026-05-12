import API from './axios';
import { Entrepreneur, Investor, User, UserRole } from '../types/index';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthCheck = () =>
  API.get('/health');

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: (payload: LoginPayload) =>
    API.post<AuthResponse>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    API.post<AuthResponse>('/auth/register', payload),

  forgotPassword: (email: string) =>
    API.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    API.post('/auth/reset-password', { token, newPassword }),

  logout: () => {
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
  },
};

// ─── Users / Profile ──────────────────────────────────────────────────────────



export const userApi = {
  getProfile: (userId: string) =>
    API.get<{ user: Entrepreneur | Investor }>(`/users/${userId}/profile`),

  updateProfile: (userId: string, updates: Partial<Entrepreneur> | Partial<Investor>) =>
    API.put<{ user: Entrepreneur | Investor }>(`/users/${userId}/profile`, updates),
};

// ─── Placeholder sections (fill in Week 2 & 3) ───────────────────────────────

// export const meetingApi = { ... }
// export const documentApi = { ... }
// export const paymentApi = { ... }

