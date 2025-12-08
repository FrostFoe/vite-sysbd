import type { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { logger } from "./logging";

/**
 * Setup request/response interceptors for API client
 * Includes logging, error handling, and performance monitoring
 */
export function setupApiInterceptors(api: AxiosInstance): void {
  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      const startTime = performance.now();

      // Store start time for performance monitoring
      (config as any).startTime = startTime;

      // Log request
      logger.debug("API Request", {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: config.headers,
      });

      return config;
    },
    (error: AxiosError) => {
      logger.error("API Request Error", {
        message: error.message,
        config: error.config,
      });
      return Promise.reject(error);
    },
  );

  // Response interceptor
  api.interceptors.response.use(
    (response: AxiosResponse) => {
      const config = response.config as any;
      const duration = performance.now() - (config.startTime || 0);

      // Log response with performance metrics
      logger.debug("API Response", {
        method: response.config.method?.toUpperCase(),
        url: response.config.url,
        status: response.status,
        duration: `${duration.toFixed(2)}ms`,
      });

      // Log slow requests (> 1000ms)
      if (duration > 1000) {
        logger.warn("Slow API Request Detected", {
          url: response.config.url,
          method: response.config.method,
          duration: `${duration.toFixed(2)}ms`,
        });
      }

      return response;
    },
    (error: AxiosError) => {
      const config = error.config as any;
      const duration = performance.now() - (config?.startTime || 0);

      // Log error response
      logger.error("API Response Error", {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        duration: `${duration.toFixed(2)}ms`,
        errorData: error.response?.data,
      });

      // Handle specific error codes
      if (error.response?.status === 401) {
        logger.warn("Unauthorized Access", {
          url: error.config?.url,
        });
        // Could trigger logout here
      }

      if (error.response?.status === 403) {
        logger.warn("Forbidden Access", {
          url: error.config?.url,
        });
      }

      if (error.response?.status === 429) {
        logger.warn("Rate Limited", {
          url: error.config?.url,
          retryAfter: error.response.headers["retry-after"],
        });
      }

      return Promise.reject(error);
    },
  );
}
