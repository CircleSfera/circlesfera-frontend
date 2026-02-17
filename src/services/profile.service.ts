import { apiClient } from './api';
import type {
  Profile,
  UpdateProfileDto,
  ProfileWithUser,
} from '../types';

const handleError = (error: unknown) => {
  return Promise.reject(error);
};

export const profileApi = {
  getMyProfile: () =>
    apiClient.get<ProfileWithUser>('/api/v1/profiles/me').catch(handleError),
  
  getProfile: (username: string) =>
    apiClient.get<ProfileWithUser>(`/api/v1/profiles/${username}`).catch(handleError),
  
  checkUsername: (username: string) =>
    apiClient.get<{ available: boolean; message: string }>(`/api/v1/profiles/check-username/${username}`),
  
  updateProfile: (data: UpdateProfileDto) =>
    apiClient.put<Profile>('/api/v1/profiles/me', data),

  deactivateAccount: () =>
    apiClient.post('/api/v1/profiles/me/deactivate'),

  deleteAccount: () =>
    apiClient.delete('/api/v1/profiles/me'),
};
