import API from './axios'
import { Entrepreneur, Investor, User, UserRole } from '../types/index'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string
  password: string
  role: UserRole
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface AuthResponse {
  token: string
  user: User
}

// ─── Health ───────────────────────────────────────────────────────────────────

export const healthCheck = () => API.get('/health')

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

  sendOTP: () => API.post('/auth/send-otp'),

  verifyOTP: (otp: string) =>
    API.post<{ message: string; verified: boolean }>('/auth/verify-otp', {
      otp
    }),

  logout: () => {
    localStorage.removeItem('nexus_token')
    localStorage.removeItem('nexus_user')
  }
}

// ─── Users / Profile ──────────────────────────────────────────────────────────
export const userApi = {
  getProfile: (userId: string) =>
    API.get<{ user: Entrepreneur | Investor }>(`/users/${userId}/profile`),

  updateProfile: (
    userId: string,
    updates: Partial<Entrepreneur> | Partial<Investor>
  ) =>
    API.put<{ user: Entrepreneur | Investor }>(
      `/users/${userId}/profile`,
      updates
    ),

  getAllUsers: () => API.get<{ users: User[] }>('/users')
}

// ─── Meeting Types ────────────────────────────────────────
export interface Meeting {
  _id: string
  title: string
  scheduledBy: {
    _id: string
    id?: string // ← add this
    name: string
    email: string
    avatarUrl: string
    role: string
  }
  scheduledWith: {
    _id: string
    id?: string // ← add this
    name: string
    email: string
    avatarUrl: string
    role: string
  }
  date: string
  duration: number
  message: string
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  meetingLink: string
  createdAt: string
}

export interface ScheduleMeetingPayload {
  title: string
  scheduledWith: string // user ID
  date: string
  duration: number
  message: string
}

// ─── Meeting API ──────────────────────────────────────────
export const meetingApi = {
  getMeetings: () => API.get<{ meetings: Meeting[] }>('/meetings'),

  scheduleMeeting: (payload: ScheduleMeetingPayload) =>
    API.post<{ meeting: Meeting }>('/meetings', payload),

  updateStatus: (
    meetingId: string,
    status: 'accepted' | 'rejected' | 'cancelled'
  ) =>
    API.patch<{ meeting: Meeting }>(`/meetings/${meetingId}/status`, {
      status
    }),

  deleteMeeting: (meetingId: string) => API.delete(`/meetings/${meetingId}`)
}

// ─── Document API types and functions ───────────────────────────────────────
// ─── Types  ───────────────────────────────
export interface Document {
  _id: string
  name: string
  url: string
  type: string
  size: string
  status: string
  version: number
  signatureUrl: string
  signedBy: { name: string; email: string } | null
  signedAt: string | null
  uploadedBy: { name: string; email: string; avatarUrl: string }
  createdAt: string
}
// ─── Document API ──────────────────────────────────────────
export const documentApi = {
  getDocuments: () => API.get<{ documents: Document[] }>('/documents'),

  uploadDocument: (formData: FormData) =>
    API.post<{ document: Document }>('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  deleteDocument: (id: string) => API.delete(`/documents/${id}`),

  attachSignature: (id: string, signatureUrl: string) =>
    API.post<{ document: Document }>(`/documents/${id}/signature`, {
      signatureUrl
    })
}

// payment API types and functions
// ── Types ─────────────────────────────────────
export interface Wallet {
  _id: string
  userId: string
  balance: number
  currency: string
}

export interface Transaction {
  _id: string
  type: 'deposit' | 'withdraw' | 'transfer'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  description: string
  fromUser?: { name: string; email: string }
  toUser?: { name: string; email: string }
  createdAt: string
}

// ── Payment API ───────────────────────────────
export const paymentApi = {
  getWallet: () => API.get<{ wallet: Wallet }>('/payments/wallet'),

  getTransactions: () =>
    API.get<{ transactions: Transaction[] }>('/payments/transactions'),

  deposit: (amount: number) =>
    API.post<{ clientSecret: string; transaction: Transaction }>(
      '/payments/deposit',
      { amount }
    ),

  confirmDeposit: (paymentIntentId: string) =>
    API.post<{ transaction: Transaction; wallet: Wallet }>(
      '/payments/deposit/confirm',
      { paymentIntentId }
    ),

  withdraw: (amount: number) =>
    API.post<{ transaction: Transaction; wallet: Wallet }>(
      '/payments/withdraw',
      { amount }
    ),

  transfer: (amount: number, toUserId: string) =>
    API.post<{ transaction: Transaction; wallet: Wallet }>(
      '/payments/transfer',
      { amount, toUserId }
    )
}
