import { apiClient } from './api';
import type {
  Conversation,
  Message,
} from '../types';

export const chatApi = {
  getConversations: () => apiClient.get<Conversation[]>('/chat/conversations'),
  
  getMessages: (conversationId: string) =>
    apiClient.get<Message[]>(`/chat/conversations/${conversationId}/messages`),
    
  sendMessage: (data: { 
    recipientId?: string; 
    content: string; 
    mediaUrl?: string; 
    mediaType?: string; 
    conversationId?: string;
    tempId?: string;
    postId?: string;
  }) =>
    apiClient.post<Message>('/chat/messages', data),
    
  markAsRead: (conversationId: string) =>
    apiClient.put(`/chat/conversations/${conversationId}/read`),

  createGroup: (data: { participantIds: string[]; name?: string }) =>
    apiClient.post<Conversation>('/chat/conversations', data),

  deleteConversation: (id: string) =>
    apiClient.delete(`/chat/conversations/${id}`),
};
