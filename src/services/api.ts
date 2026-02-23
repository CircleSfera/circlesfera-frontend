import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { handleApiError } from '../utils/apiUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Centralized API client with cookie-based authentication.
 *
 * Auth tokens are stored as HTTP-only cookies by the backend (not accessible
 * via JavaScript). The browser sends them automatically with `withCredentials: true`.
 *
 * The response interceptor handles automatic token refresh on 401 errors.
 */
class ApiClient {
  private client: AxiosInstance;
  private csrfToken: string | null = null;
  private csrfTokenPromise: Promise<string | null> | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    // Handle CSRF Token fetching with race condition protection
    const getCSRFToken = async () => {
      if (this.csrfTokenPromise) return this.csrfTokenPromise;

      this.csrfTokenPromise = (async () => {
        try {
          const { data } = await axios.get(`${API_URL}/csrf-token`, { withCredentials: true });
          this.csrfToken = data.csrfToken;
          return data.csrfToken;
        } catch (error) {
          console.error('Failed to fetch CSRF token:', error);
          return null;
        } finally {
          this.csrfTokenPromise = null;
        }
      })();

      return this.csrfTokenPromise;
    };

    // Request interceptor to inject CSRF token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Only skip CSRF for GET/HEAD/OPTIONS
        const method = config.method?.toUpperCase();
        if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
          if (!this.csrfToken) {
            await getCSRFToken();
          }
          if (this.csrfToken) {
            config.headers['x-csrf-token'] = this.csrfToken;
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor for token refresh and CSRF retry
    this.client.interceptors.response.use(
      (response) => {
        // If login/register/refresh succeeded, our session changed.
        // Clear the current CSRF token so it's re-fetched for the next request.
        const url = response.config.url || '';
        if (
          url.includes('/auth/login') ||
          url.includes('/auth/register') ||
          url.includes('/auth/refresh')
        ) {
          this.csrfToken = null; 
        }
        return response;
      },
      async (error: { response?: { status: number }; config: InternalAxiosRequestConfig & { _csrfRetry?: boolean; _retry?: boolean } }) => {
        const originalRequest = error.config;
        const isAuthRequest =
          originalRequest.url?.includes('/api/v1/auth/login') ||
          originalRequest.url?.includes('/api/v1/auth/register') ||
          originalRequest.url?.includes('/api/v1/auth/refresh');

        // Handle CSRF failure (403 Forbidden)
        if (error.response?.status === 403 && !originalRequest._csrfRetry) {
          originalRequest._csrfRetry = true;
          this.csrfToken = null; // Clear old token
          const newToken = await getCSRFToken();
          if (newToken) {
            originalRequest.headers['x-csrf-token'] = newToken;
            return this.client(originalRequest);
          }
        }

        // Handle Auth failure (401 Unauthorized)
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isAuthRequest
        ) {
          originalRequest._retry = true;

          try {
            await axios.post(
              `${API_URL}/api/v1/auth/refresh`,
              {},
              { withCredentials: true },
            );
            // Refresh CSRF after token rotation
            this.csrfToken = null;
            await getCSRFToken();
            return this.client(originalRequest);
          } catch (refreshError) {
            // ONLY redirect if we aren't already on the login/register page
            // and if this wasn't an auth request to begin with.
            if (!isAuthRequest && !window.location.pathname.includes('/accounts/')) {
              window.location.href = '/accounts/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return handleApiError(error);
      },
    );
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient().getClient();
