import { apiClient as api } from './api';

export const paymentsApi = {
  createCheckoutSession: async (targetType: string, targetId: string) => {
    const response = await api.post('/payments/checkout', { targetType, targetId });
    return response.data;
  },
  
  createConnectAccount: async () => {
    const response = await api.post('/payments/connect-onboarding');
    return response.data;
  },

  getCreatorAnalytics: async () => {
    const response = await api.get('/payments/analytics/creator');
    return response.data;
  }
};

