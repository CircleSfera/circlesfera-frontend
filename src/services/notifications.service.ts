import { apiClient } from './api';
import type {
  Notification,
  PaginatedResponse,
} from '../types';

export const notificationsApi = {
  getAll: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<Notification>>('/api/v1/notifications', {
      params: { page, limit },
    }),
  
  getUnreadCount: () =>
    apiClient.get<{ count: number }>('/api/v1/notifications/unread-count'),
  
  markAsRead: (id: string) =>
    apiClient.put(`/api/v1/notifications/${id}/read`),
  
  markAllAsRead: () =>
    apiClient.put('/api/v1/notifications/read-all'),
};
