import { apiClient } from './api';
import type {
  Post,
  PaginatedResponse,
} from '../types';

export const bookmarksApi = {
  toggle: (postId: string, collectionId?: string) =>
    apiClient.post<{ bookmarked: boolean; collectionId?: string }>(`/api/v1/bookmarks/${postId}/toggle`, { collectionId }),
  
  updateCollection: (postId: string, collectionId: string | null) =>
    apiClient.post<{ bookmarked: boolean; collectionId?: string | null }>(`/api/v1/bookmarks/${postId}/collection`, { collectionId }),

  check: (postId: string) =>
    apiClient.get<{ bookmarked: boolean }>(`/api/v1/bookmarks/${postId}/check`),
  
  getAll: (page = 1, limit = 10, collectionId?: string) =>
    apiClient.get<PaginatedResponse<Post>>('/api/v1/bookmarks', {
      params: { page, limit, collectionId },
    }),
};
