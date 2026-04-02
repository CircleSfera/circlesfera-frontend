import { apiClient } from './api';
import type {
  UserWithProfile,
} from '../types';

export const closeFriendsApi = {
  getCloseFriends: () =>
    apiClient.get<UserWithProfile[]>('close-friends'),
  
  toggleCloseFriend: (friendId: string) =>
    apiClient.post<{ isCloseFriend: boolean }>(`close-friends/${friendId}`),
};
