/**
 * Library Utilities Export Index
 * Centralized export for all utility functions
 */

// API Integration
export { setupApiInterceptors } from "./apiInterceptors";
export * from "./api";

// Form Validation
export { validateField, validateForm, validateFieldsMatch, CommonSchemas, useFormValidation } from "./formValidation";
export type { ValidationRule, ValidationErrors, FormValidationResult } from "./formValidation";

// Image Optimization
export {
  generateImageSrcSet,
  getImageWithWebP,
  setupLazyLoading,
  useLazyLoad,
  getOptimalImageSize,
  createImageSkeleton,
} from "./imageOptimization";

// Logging
export { default as LoggingService, logger } from "./logging";

// Performance Monitoring
export { performanceMonitor, usePerformanceMonitor, monitorWebVitals } from "./performanceMonitoring";
export type { PerformanceMetrics } from "./performanceMonitoring";

// Other Utilities
export * from "./translations";
export * from "./utils";
export * from "./accessibility";
export * from "./constants";
