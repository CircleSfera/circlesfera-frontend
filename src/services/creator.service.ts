import { apiClient } from './api';
import type { PaginatedResponse } from '../types';

// ─── Types ───────────────────────────────────────────────────────

export interface CreatorStats {
  postCount: number;
  frameCount: number;
  storyCount: number;
  followerCount: number;
  followingCount: number;
  totalLikes: number;
  totalComments: number;
  totalBookmarks: number;
  activePromotions: number;
  engagementRate: number;
}

export interface CreatorChartDay {
  date: string;
  likes: number;
  comments: number;
  views: number;
  followers: number;
}

export interface CreatorPost {
  id: string;
  caption: string | null;
  type: string;
  createdAt: string;
  media?: { url: string; type?: string }[];
  _count: { likes: number; comments: number; bookmarks: number };
}

export interface CreatorStory {
  id: string;
  mediaUrl: string;
  mediaType: string;
  expiresAt: string;
  createdAt: string;
  _count: { views: number; reactions: number };
}

export interface CreatorPromotion {
  id: string;
  targetType: string;
  targetId: string;
  budget: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  reach: number;
  createdAt: string;
  target?: {
    caption?: string | null;
    thumbnail?: string | null;
    type?: string;
  } | null;
}

// ─── API ─────────────────────────────────────────────────────────

export const creatorApi = {
  getStats: () =>
    apiClient.get<CreatorStats>('creator/stats'),

  getActivityChart: () =>
    apiClient.get<CreatorChartDay[]>('creator/activity-chart'),

  getPosts: (page = 1, limit = 10, type?: string) =>
    apiClient.get<PaginatedResponse<CreatorPost>>('creator/posts', {
      params: { page, limit, type },
    }),

  getStories: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<CreatorStory>>('creator/stories', {
      params: { page, limit },
    }),

  getPromotions: (page = 1, limit = 10) =>
    apiClient.get<PaginatedResponse<CreatorPromotion>>('creator/promotions', {
      params: { page, limit },
    }),

  createPromotion: (data: {
    targetType: string;
    targetId: string;
    budget: number;
    durationDays: number;
    currency?: string;
  }) => apiClient.post<CreatorPromotion>('creator/promotions', data),

  cancelPromotion: (id: string) =>
    apiClient.delete(`creator/promotions/${id}`),
};
