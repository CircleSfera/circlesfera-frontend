import { apiClient } from './api';
import type {
  AuthResponse,
  RegisterDto,
  LoginDto,
} from '../types';

export const authApi = {
  register: (data: RegisterDto) =>
    apiClient.post<AuthResponse>('/api/v1/auth/register', data),
  
  login: (data: LoginDto) =>
    apiClient.post<AuthResponse>('/api/v1/auth/login', data),
  
  logout: (refreshToken: string) =>
    apiClient.post('/api/v1/auth/logout', { refreshToken }),

  verifyEmail: (token: string) =>
    apiClient.post('/api/v1/auth/verify-email', { token }),

  requestReset: (email: string) =>
    apiClient.post('/api/v1/auth/request-reset', { email }),

  resetPassword: (data: { token: string; newPassword: string }) =>
    apiClient.post('/api/v1/auth/reset-password', data),
};
