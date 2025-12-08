import type { AxiosInstance, AxiosError, AxiosResponse } from "axios";

/**
 * Setup request/response interceptors for API client
 * Handles error handling
 */
export function setupApiInterceptors(api: AxiosInstance): void {
  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      // Handle specific error codes
      if (error.response?.status === 401) {
        // Could trigger logout here
      }

      if (error.response?.status === 403) {
        // Handle forbidden access
      }

      if (error.response?.status === 429) {
        // Handle rate limiting
      }

      return Promise.reject(error);
    },
  );
}
