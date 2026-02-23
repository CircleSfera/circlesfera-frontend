import { apiClient } from './api';
import type {
  Story,
  CreateStoryDto,
  UserWithProfile,
} from '../types';

export const storiesApi = {
  create: (data: CreateStoryDto) =>
    apiClient.post<Story>('/api/v1/stories', data),
  
  getAll: () =>
    apiClient.get('/api/v1/stories'),
  
  getByUser: (username: string) =>
    apiClient.get<Story[]>(`/api/v1/stories/user/${username}`),

  markViewed: (id: string) => apiClient.post(`/api/v1/stories/${id}/view`),
  
  getViews: (id: string) => apiClient.get<UserWithProfile[]>(`/api/v1/stories/${id}/views`),

  addReaction: (id: string, reaction: string) => 
    apiClient.post(`/api/v1/stories/${id}/react`, { reaction }),

  getReactions: (id: string) => 
    apiClient.get<{ reaction: string; userId: string; user: UserWithProfile }[]>(`/api/v1/stories/${id}/reactions`),

  delete: (id: string) => apiClient.delete(`/api/v1/stories/${id}`),
};
