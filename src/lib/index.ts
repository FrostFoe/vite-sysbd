/**
 * Library Utilities Export Index
 * Centralized export for all utility functions
 */

export * from "./accessibility";
export * from "./api";
// API Integration
export { setupApiInterceptors } from "./apiInterceptors";
export * from "./constants";
export type {
  FormValidationResult,
  ValidationErrors,
  ValidationRule,
} from "./formValidation";
// Form Validation
export {
  CommonSchemas,
  useFormValidation,
  validateField,
  validateFieldsMatch,
  validateForm,
} from "./formValidation";
// Image Optimization
export {
  createImageSkeleton,
  generateImageSrcSet,
  getImageWithWebP,
  getOptimalImageSize,
  setupLazyLoading,
  useLazyLoad,
} from "./imageOptimization";
// Other Utilities
export * from "./translations";
export * from "./utils";
