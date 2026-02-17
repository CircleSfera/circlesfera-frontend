import { apiClient } from './api';
import type {
  Collection,
} from '../types';

export const collectionsApi = {
  create: (name: string) => 
    apiClient.post<Collection>('/api/v1/collections', { name }),

  getAll: () => 
    apiClient.get<Collection[]>('/api/v1/collections'),

  getById: (id: string) => 
    apiClient.get<Collection>(`/api/v1/collections/${id}`),

  update: (id: string, name: string) => 
    apiClient.patch<Collection>(`/api/v1/collections/${id}`, { name }),

  delete: (id: string) => 
    apiClient.delete(`/api/v1/collections/${id}`),
};
