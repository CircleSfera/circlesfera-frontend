import { apiClient } from './api';
import type {
  Profile,
} from '../types';

export const followsApi = {
  toggle: (username: string) =>
    apiClient.post<{ following: boolean; status: string }>(`/api/v1/users/${username}/follow/toggle`),
  
  check: (username: string) =>
    apiClient.get<{ following: boolean; status: string }>(`/api/v1/users/${username}/follow/check`),
  
  getFollowers: (username: string) =>
    apiClient.get(`/api/v1/users/${username}/follow/followers`),
  
  getFollowing: (username: string) =>
    apiClient.get(`/api/v1/users/${username}/follow/following`),
    
  block: (username: string) =>
    apiClient.post(`/api/v1/users/${username}/follow/block`),

  unblock: (username: string) =>
    apiClient.post(`/api/v1/users/${username}/follow/unblock`),

  getBlocked: () =>
    apiClient.get<{ id: string; profile?: Profile }[]>('/api/v1/users/me/follow/blocked'),

  // Pending follow requests
  getPending: () =>
    apiClient.get<{ id: string; profile?: Profile }[]>('/api/v1/users/me/follow/pending'),
  
  acceptRequest: (username: string) =>
    apiClient.post<{ success: boolean }>(`/api/v1/users/${username}/follow/accept`),
  
  rejectRequest: (username: string) =>
    apiClient.post<{ success: boolean }>(`/api/v1/users/${username}/follow/reject`),
};
