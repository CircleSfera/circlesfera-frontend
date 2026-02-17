import { useEffect } from 'react';
import { apiClient } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export default function CsrfInitializer() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        // Fetch CSRF token from backend
        // Note: The backend sets the secret in a cookie, and returns the token in the body.
        // We must include credentials to ensure any existing session is respected,
        // although for CSRF init, we just need the token.
        const response = await apiClient.get('/csrf-token');
        const token = response.data.csrfToken;
        
        if (token) {
          apiClient.defaults.headers.common['x-csrf-token'] = token;
          console.log('CSRF token initialized');
        }
      } catch (error) {
        console.error('Failed to initialize CSRF token', error);
      }
    };

    fetchCsrfToken();
  }, [isAuthenticated]);

  return null;
}
