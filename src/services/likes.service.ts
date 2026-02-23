import { apiClient } from './api';

export const likesApi = {
  toggle: (postId: string) =>
    apiClient.post<{ liked: boolean }>(`/api/v1/posts/${postId}/likes/toggle`),
  
  check: (postId: string) =>
    apiClient.get<{ liked: boolean }>(`/api/v1/posts/${postId}/likes/check`),
};
