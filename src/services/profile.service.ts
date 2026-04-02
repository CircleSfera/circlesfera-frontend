import { apiClient } from './api';
import type {
  Profile,
  UpdateProfileDto,
  ProfileWithUser,
} from '../types';

export const profileApi = {
  getMyProfile: () =>
    apiClient.get<ProfileWithUser>('profiles/me'),
  
  getProfile: (username: string) =>
    apiClient.get<ProfileWithUser>(`/profiles/${username}`),
  
  checkUsername: (username: string) =>
    apiClient.get<{ available: boolean; message: string }>(`/profiles/check-username/${username}`),
  
  updateProfile: (data: UpdateProfileDto) =>
    apiClient.put<Profile>('/profiles/me', data),

  deactivateAccount: () =>
    apiClient.post('/profiles/me/deactivate'),

  deleteAccount: () =>
    apiClient.delete('/profiles/me'),
};
