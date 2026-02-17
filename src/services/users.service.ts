import { apiClient } from './api';
import type {
  SuggestedUser,
} from '../types';

export const usersApi = {
  getSuggestions: (limit = 10) =>
    apiClient.get<SuggestedUser[]>('/api/v1/users/suggestions', {
      params: { limit },
    }),

  ban: (id: string) =>
    apiClient.patch(`/api/v1/users/${id}/ban`),

  unban: (id: string) =>
    apiClient.patch(`/api/v1/users/${id}/unban`),
};
