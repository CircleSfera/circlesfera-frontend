import { apiClient } from './api';
import type {
  Post,
  PaginatedResponse,
  CreatePostDto,
} from '../types';

export const postsApi = {
  create: (data: CreatePostDto) =>
    apiClient.post<Post>('/api/v1/posts', data),
  
  getAll: (page = 1, limit = 10, sort: 'latest' | 'trending' = 'latest') =>
    apiClient.get<PaginatedResponse<Post>>('/api/v1/posts', {
      params: { page, limit, sort },
    }),
  
  getFeed: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<Post>>('/api/v1/posts/feed', {
      params: { page, limit },
    }),

  getFrames: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<Post>>('/api/v1/posts/frames', {
      params: { page, limit },
    }),
  
  getByUser: (username: string, page = 1, limit = 10, type?: string) =>
    apiClient.get<PaginatedResponse<Post>>(`/api/v1/posts/user/${username}`, {
      params: { page, limit, type },
    }),

  getTagged: (username: string, page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<Post>>(`/api/v1/posts/user/${username}/tagged`, {
      params: { page, limit },
    }),
  
  getById: (id: string) =>
    apiClient.get<Post>(`/api/v1/posts/${id}`),
  
  update: (id: string, caption: string) =>
    apiClient.put<Post>(`/api/v1/posts/${id}`, { caption }),
  
  delete: (id: string) =>
    apiClient.delete(`/api/v1/posts/${id}`),

  adminDelete: (id: string) =>
    apiClient.delete(`/api/v1/posts/${id}/admin`),

  getByTag: (tag: string, page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<Post>>(`/api/v1/posts/tags/${tag}`, {
      params: { page, limit },
    }),
};
