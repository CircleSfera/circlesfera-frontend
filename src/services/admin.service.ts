import { apiClient } from './api';
import type { User, Post, PaginatedResponse } from '../types';

export interface AdminStats {
  users: number;
  posts: number;
  stories: number;
  pendingReports: number;
}

export const adminApi = {
  getStats: () => 
    apiClient.get<AdminStats>('/api/v1/admin/stats'),
  
  getUsers: (page = 1, limit = 10, search?: string) =>
    apiClient.get<PaginatedResponse<User>>('/api/v1/admin/users', {
      params: { page, limit, search },
    }),
  
  getPosts: (page = 1, limit = 10, search?: string) =>
    apiClient.get<PaginatedResponse<Post>>('/api/v1/admin/posts', {
      params: { page, limit, search },
    }),
};
