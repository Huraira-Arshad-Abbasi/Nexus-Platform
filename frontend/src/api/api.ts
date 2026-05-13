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

  getAllUsers: () =>
  API.get<{ users: User[] }>('/users'),
};

// ─── Meeting Types ────────────────────────────────────────
export interface Meeting {
  _id: string;
  title: string;
  scheduledBy: { _id: string; name: string; email: string; avatarUrl: string; role: string };
  scheduledWith: { _id: string; name: string; email: string; avatarUrl: string; role: string };
  date: string;
  duration: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  meetingLink: string;
  createdAt: string;
}

export interface ScheduleMeetingPayload {
  title: string;
  scheduledWith: string; // user ID
  date: string;
  duration: number;
  message: string;
}

// ─── Meeting API ──────────────────────────────────────────
export const meetingApi = {
  getMeetings: () =>
    API.get<{ meetings: Meeting[] }>('/meetings'),

  scheduleMeeting: (payload: ScheduleMeetingPayload) =>
    API.post<{ meeting: Meeting }>('/meetings', payload),

  updateStatus: (meetingId: string, status: 'accepted' | 'rejected' | 'cancelled') =>
    API.patch<{ meeting: Meeting }>(`/meetings/${meetingId}/status`, { status }),

  deleteMeeting: (meetingId: string) =>
    API.delete(`/meetings/${meetingId}`),
};



// ─── Remaining sections  ───────────────────────────────


// export const documentApi = { ... }
// export const paymentApi = { ... }

