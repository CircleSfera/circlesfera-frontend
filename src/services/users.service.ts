import { apiClient } from './api';
import type {
  SuggestedUser,
} from '../types';

export const usersApi = {
  getSuggestions: (limit = 10) =>
    apiClient.get<SuggestedUser[]>('/users/suggestions', {
      params: { limit },
    }),

  ban: (id: string) =>
    apiClient.patch(`/users/${id}/ban`),

  unban: (id: string) =>
    apiClient.patch(`/users/${id}/unban`),
};
