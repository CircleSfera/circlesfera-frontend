import { apiClient } from './api';
import type {
  Highlight,
  Story,
} from '../types';

export const highlightsApi = {
  create: (data: { title: string; coverUrl?: string; storyIds: string[] }) => 
    apiClient.post<Highlight>('/api/v1/highlights', data),
    
  getUserHighlights: (userId: string) => 
    apiClient.get<Highlight[]>(`/api/v1/highlights/user/${userId}`),
    
  getHighlight: (id: string) => 
    apiClient.get<Highlight & { stories: { story: Story }[] }>(`/api/v1/highlights/${id}`),
    
  delete: (id: string) => 
    apiClient.delete(`/api/v1/highlights/${id}`),
};
