import { apiClient } from './index';
import type { Highlight, Story } from '../types';
// types/index.ts should be updated to include Highlight type, but I'll define it here or import later.
// For now let's assume we maintain types in a central file, but I'll use any or interface locally if needed to avoid circular deps for now.

export const highlightsApi = {
  createHighlight: (data: { title: string; coverUrl?: string; storyIds: string[] }) => {
    return apiClient.post<Highlight>('/highlights', data);
  },

  getUserHighlights: (userId: string) => {
    return apiClient.get<Highlight[]>(`/highlights/user/${userId}`);
  },

  getHighlight: (id: string) => {
    return apiClient.get<Highlight & { stories: { story: Story }[] }>(`/highlights/${id}`);
  },

  deleteHighlight: (id: string) => {
    return apiClient.delete(`/highlights/${id}`);
  },
};
