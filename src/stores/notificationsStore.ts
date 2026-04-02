import { create } from 'zustand';
import type { Notification } from '../types';

interface NotificationsState {
  unreadCount: number;
  liveNotifications: Notification[];
  addNotification: (notification: Notification) => void;
  clearUnread: () => void;
  setUnreadCount: (count: number) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  unreadCount: 0,
  liveNotifications: [],

  addNotification: (notification) => {
      set((state) => ({
          liveNotifications: [notification, ...state.liveNotifications],
          unreadCount: state.unreadCount + 1,
      }));
  },

  clearUnread: () => {
      set({ unreadCount: 0 });
  },

  setUnreadCount: (count: number) => {
      set({ unreadCount: count });
  }
}));
