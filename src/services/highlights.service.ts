import { apiClient } from './api';
import type {
  Highlight,
  Story,
} from '../types';

export const highlightsApi = {
  create: (data: { title: string; coverUrl?: string; storyIds: string[] }) => 
    apiClient.post<Highlight>('highlights', data),
    
  getUserHighlights: (userId: string) => 
    apiClient.get<Highlight[]>(`highlights/user/${userId}`),
    
  getHighlight: (id: string) => 
    apiClient.get<Highlight & { stories: { story: Story }[] }>(`highlights/${id}`),
    
  delete: (id: string) => 
    apiClient.delete(`highlights/${id}`),
};
