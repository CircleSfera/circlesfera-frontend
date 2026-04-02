import { apiClient } from './api';
import type {
  Profile,
  Post,
  SearchResult,
  SearchHistoryItem,
} from '../types';

export const searchApi = {
  search: (query: string) =>
    apiClient.get<SearchResult>(`search?q=${query}`),
  
  searchUsers: (query: string) =>
    apiClient.get<Profile[]>(`search/users?q=${query}`),
  
  getHistory: () =>
    apiClient.get<SearchHistoryItem[]>('search/history'),
  
  clearHistory: () =>
    apiClient.delete('search/history'),

  semanticSearch: (query: string) =>
    apiClient.get<Post[]>(`search/semantic?q=${query}`),
};
