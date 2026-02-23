import { AxiosError } from 'axios';
import { logger } from './logger';

export function handleApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    const serverMessage = error.response?.data?.message;
    const message = Array.isArray(serverMessage) 
      ? serverMessage[0] 
      : serverMessage || error.message || 'An unexpected error occurred';
      
    logger.error('API Error:', {
      status: error.response?.status,
      message,
      path: error.config?.url,
    });

    const customError = new Error(message) as Error & { status?: number; data?: unknown };
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    throw customError;
  }

  if (error instanceof Error) {
    logger.error('General Error:', error.message);
    throw error;
  }

  logger.error('Unknown Error:', error);
  throw new Error('An unexpected error occurred');
}
