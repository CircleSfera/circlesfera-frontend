import { apiClient } from './api';
import type {
  UserWithProfile,
} from '../types';

export const closeFriendsApi = {
  getCloseFriends: () =>
    apiClient.get<UserWithProfile[]>('/api/v1/close-friends'),
  
  toggleCloseFriend: (friendId: string) =>
    apiClient.post<{ isCloseFriend: boolean }>(`/api/v1/close-friends/${friendId}`),
};
