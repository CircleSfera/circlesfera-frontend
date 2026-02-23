import { apiClient } from './api';
import type {
  Profile,
  UpdateProfileDto,
  ProfileWithUser,
} from '../types';

export const profileApi = {
  getMyProfile: () =>
    apiClient.get<ProfileWithUser>('/api/v1/profiles/me'),
  
  getProfile: (username: string) =>
    apiClient.get<ProfileWithUser>(`/api/v1/profiles/${username}`),
  
  checkUsername: (username: string) =>
    apiClient.get<{ available: boolean; message: string }>(`/api/v1/profiles/check-username/${username}`),
  
  updateProfile: (data: UpdateProfileDto) =>
    apiClient.put<Profile>('/api/v1/profiles/me', data),

  deactivateAccount: () =>
    apiClient.post('/api/v1/profiles/me/deactivate'),

  deleteAccount: () =>
    apiClient.delete('/api/v1/profiles/me'),
};
