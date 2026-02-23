import { apiClient } from './api';
import type {
  Profile,
  Post,
  SearchResult,
  SearchHistoryItem,
} from '../types';

export const searchApi = {
  search: (query: string) =>
    apiClient.get<SearchResult>(`/api/v1/search?q=${query}`),
  
  searchUsers: (query: string) =>
    apiClient.get<Profile[]>(`/api/v1/search/users?q=${query}`),
  
  getHistory: () =>
    apiClient.get<SearchHistoryItem[]>('/api/v1/search/history'),
  
  clearHistory: () =>
    apiClient.delete('/api/v1/search/history'),

  semanticSearch: (query: string) =>
    apiClient.get<Post[]>(`/api/v1/search/semantic?q=${query}`),
};
