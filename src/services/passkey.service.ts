import { apiClient } from './api';
import type {
  AuthResponse,
} from '../types';

export const passkeyApi = {
  getRegistrationOptions: () =>
    apiClient.post('/api/v1/auth/passkey/register-options'),

  verifyRegistration: (registrationResponse: Record<string, unknown>) =>
    apiClient.post<{ verified: boolean }>('/api/v1/auth/passkey/register-verify', {
      registrationResponse,
    }),

  getLoginOptions: (email: string) =>
    apiClient.post('/api/v1/auth/passkey/login-options', { email }),

  verifyLogin: (email: string, authenticationResponse: Record<string, unknown>) =>
    apiClient.post<AuthResponse>('/api/v1/auth/passkey/login-verify', {
      email,
      authenticationResponse,
    }),
};
