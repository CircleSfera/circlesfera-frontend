import { apiClient } from './api';
import type {
  Audio,
} from '../types';

export const audioApi = {
  search: (query: string) =>
    apiClient.get<Audio[]>(`/api/v1/audio/search?q=${query}`),
  
  getTrending: () =>
    apiClient.get<Audio[]>('/api/v1/audio/trending'),
  
  getById: (id: string) =>
    apiClient.get<Audio>(`/api/v1/audio/${id}`),
};
