/**
 * Unified Utilities, Validation, and Performance
 * Consolidated from: utils, formValidation, imageOptimization, performance, useDataFetch
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "./components/common/Toast";
import { useLayout } from "./context/LayoutContext";
import { t } from "./translations";

/* ============================================================================
   COMMON UTILITIES
   ============================================================================ */

declare global {
  interface Window {
    lucide?: {
      createIcons: () => void;
    };
  }
}

export const PLACEHOLDER_IMAGE =
  "https://placehold.co/600x400/1a1a1a/FFF?text=BreachTimes";

export function formatTimestamp(
  timestampString: string | null | undefined,
  lang: "en" | "bn"
): string {
  if (!timestampString) return "";
  let date = new Date(timestampString);
  if (Number.isNaN(date.getTime())) {
    const parts = timestampString.match(
      /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/
    );
    if (parts)
      date = new Date(
        parseInt(parts[1], 10),
        parseInt(parts[2], 10) - 1,
        parseInt(parts[3], 10),
        parseInt(parts[4], 10),
        parseInt(parts[5], 10),
        parseInt(parts[6], 10)
      );
    else return timestampString;
  }

  const now = new Date();
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  if (secondsPast < 60) return t("just_now", lang);
  if (secondsPast < 3600) {
    const m = Math.floor(secondsPast / 60);
    return `${m} ${t(m === 1 ? "minute" : "minutes", lang)}`;
  }
  if (secondsPast < 86400) {
    const h = Math.floor(secondsPast / 3600);
    return `${h} ${t(h === 1 ? "hour" : "hours", lang)}`;
  }
  if (secondsPast < 2592000) {
    const d = Math.floor(secondsPast / 86400);
    return `${d} ${t(d === 1 ? "day" : "days", lang)}`;
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: lang === "bn" ? "long" : "short",
    day: "numeric",
  };
  const locale = lang === "bn" ? "bn-BD" : "en-US";
  return date.toLocaleDateString(locale, options);
}

export function showToastMsg(
  msg: string,
  type: "success" | "error" = "success"
) {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const icon = type === "error" ? "alert-circle" : "check-circle";
  const color = type === "error" ? "text-danger" : "text-success";

  toast.className =
    "animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 dark:bg-white/90 backdrop-blur text-white dark:text-black px-6 py-3 rounded-full shadow-lg font-bold flex items-center gap-2 mb-2 text-sm w-auto";
  toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 ${color}"></i> ${msg}`;
  container.appendChild(toast);
  if (
    typeof window !== "undefined" &&
    window.lucide &&
    typeof window.lucide.createIcons === "function"
  ) {
    window.lucide.createIcons();
  }
  setTimeout(() => toast.remove(), 3000);
}

/**
 * Navigate to detail page on mobile, set active item on desktop
 * @param isMobile - Is current screen mobile
 * @param navigate - React Router navigate function
 * @param detailPath - Path to navigate to on mobile (e.g., `/admin/users/${id}`)
 * @param onDesktop - Callback to execute on desktop (e.g., setActiveItem)
 */
export function handleItemSelect(
  isMobile: boolean,
  navigate: (path: string) => void,
  detailPath: string,
  onDesktop?: () => void
) {
  if (isMobile) {
    navigate(detailPath);
  } else {
    onDesktop?.();
  }
}

/**
 * Normalize media URLs to ensure they work from both editor and article detail pages
 * Handles relative paths returned from upload APIs
 * @param url - The media URL from API response
 * @returns Normalized URL accessible from frontend
 */
export function normalizeMediaUrl(url: string | null | undefined): string {
  if (!url) return "";

  // If URL is already absolute (starts with http/https), return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // If URL is root-relative (starts with /), it already maps to domain root (dist/)
  // so return as-is
  if (url.startsWith("/")) {
    return url;
  }

  // Return other URLs as-is
  return url;
}

export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(" ");
}

/* ============================================================================
   FORM VALIDATION
   ============================================================================ */

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean | string;
  email?: boolean;
  url?: boolean;
  min?: number;
  max?: number;
  match?: string; // Field name to match
}

export interface ValidationErrors {
  [fieldName: string]: string[];
}

export interface FormValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

/**
 * Validate a single field
 */
function validateFieldInternal(
  value: unknown,
  rules: ValidationRule,
  fieldName: string
): string[] {
  const errors: string[] = [];

  if (rules.required && !value) {
    errors.push(`${fieldName} is required`);
    return errors;
  }

  if (!value) return errors;

  const stringValue = String(value).trim();

  // Min length validation
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(
      `${fieldName} must be at least ${rules.minLength} characters long`
    );
  }

  // Max length validation
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`${fieldName} must not exceed ${rules.maxLength} characters`);
  }

  // Email validation
  if (rules.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(stringValue)) {
      errors.push(`${fieldName} must be a valid email address`);
    }
  }

  // URL validation
  if (rules.url) {
    try {
      new URL(stringValue);
    } catch {
      errors.push(`${fieldName} must be a valid URL`);
    }
  }

  // Pattern validation
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push(`${fieldName} format is invalid`);
  }

  // Numeric range validation
  if (typeof value === "number") {
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`${fieldName} must be at least ${rules.min}`);
    }

    if (rules.max !== undefined && value > rules.max) {
      errors.push(`${fieldName} must not exceed ${rules.max}`);
    }
  }

  // Custom validation
  if (rules.custom) {
    const result = rules.custom(value);
    if (result !== true) {
      errors.push(
        typeof result === "string" ? result : `${fieldName} validation failed`
      );
    }
  }

  return errors;
}

export function validateField(
  value: unknown,
  rules: ValidationRule,
  fieldName: string = "Field"
): string[] {
  return validateFieldInternal(value, rules, fieldName);
}

/**
 * Validate entire form
 */
export function validateForm(
  formData: Record<string, unknown>,
  schema: Record<string, ValidationRule>,
  fieldLabels: Record<string, string> = {}
): FormValidationResult {
  const errors: ValidationErrors = {};

  Object.entries(schema).forEach(([fieldName, rules]) => {
    const label = fieldLabels[fieldName] || fieldName;
    const fieldErrors = validateFieldInternal(
      formData[fieldName],
      rules,
      label
    );

    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate matching fields
 */
export function validateFieldsMatch(
  formData: Record<string, unknown>,
  field1: string,
  field2: string
): boolean {
  return formData[field1] === formData[field2];
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  email: { required: true, email: true } as ValidationRule,

  password: {
    required: true,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    custom: (value: unknown) => {
      if (
        typeof value === "string" &&
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)
      ) {
        return true;
      }
      return "Password must contain uppercase, lowercase, and numbers";
    },
  } as ValidationRule,

  strongPassword: {
    required: true,
    minLength: 12,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
    custom: (value: unknown) => {
      if (
        typeof value === "string" &&
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)
      ) {
        return true;
      }
      return "Password must contain uppercase, lowercase, numbers, and special characters";
    },
  } as ValidationRule,

  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_-]+$/,
  } as ValidationRule,

  url: {
    required: false,
    url: true,
  } as ValidationRule,

  phone: {
    required: false,
    pattern: /^[\d\s-()+]+$/,
  } as ValidationRule,
};

/**
 * React Hook for form validation
 */
export function useFormValidation(schema: Record<string, ValidationRule>) {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const validate = useCallback(
    (formData: Record<string, unknown>) => {
      const result = validateForm(formData, schema);
      setErrors(result.errors);
      return result.isValid;
    },
    [schema]
  );

  const validateFieldFn = useCallback(
    (fieldName: string, value: unknown) => {
      const rule = schema[fieldName];
      if (!rule) return;

      const fieldErrors = validateFieldInternal(
        value,
        rule,
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      );

      setErrors(
        (prev): ValidationErrors => ({
          ...prev,
          [fieldName]: fieldErrors,
        })
      );

      setTouched((prev) => new Set([...prev, fieldName]));
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
    setTouched(new Set());
  }, []);

  return {
    validate,
    validateField: validateFieldFn,
    clearErrors,
    errors,
    touched,
    hasErrors: Object.keys(errors).length > 0,
  };
}

/* ============================================================================
   IMAGE OPTIMIZATION
   ============================================================================ */

/**
 * Generate responsive image srcset with WebP format support
 * Supports multiple responsive breakpoints for optimal image loading
 */
export function generateImageSrcSet(
  basePath: string,
  widths: number[] = [400, 800, 1200, 1600]
): { srcSet: string; sizes: string } {
  const srcSet = widths
    .map((width) => `${basePath}?w=${width}&q=85&fmt=webp ${width}w`)
    .join(", ");

  const sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw";

  return { srcSet, sizes };
}

/**
 * Get WebP image source with multiple format fallbacks
 * Returns optimized srcset with WebP and JPEG formats
 */
export function getImageWithWebP(
  path: string,
  alt: string = "Image"
): {
  src: string;
  srcSet: string;
  webpSrcSet: string;
  sizes: string;
  alt: string;
} {
  const jpegSrcSet = [400, 800, 1200]
    .map((w) => `${path}?w=${w}&q=85 ${w}w`)
    .join(", ");
  const webpSrcSet = [400, 800, 1200]
    .map((w) => `${path}?w=${w}&q=85&fmt=webp ${w}w`)
    .join(", ");
  const sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw";

  return {
    src: path,
    srcSet: jpegSrcSet,
    webpSrcSet,
    sizes,
    alt,
  };
}

/**
 * Intersection Observer setup for lazy loading
 */
export function setupLazyLoading(selector: string = "img[data-lazy]") {
  if ("IntersectionObserver" in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll(selector).forEach((img) => {
      imageObserver.observe(img);
    });
  }
}

/**
 * React hook for lazy loading images
 */
export function useLazyLoad() {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && imgRef.current) {
          const src = imgRef.current.dataset.src;
          if (src) {
            imgRef.current.src = src;
            imgRef.current.classList.add("loaded");
          }
          observer.unobserve(entry.target);
        }
      });
    });

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return imgRef;
}

/**
 * Calculate optimal image dimensions for responsive design
 */
export function getOptimalImageSize(containerWidth: number): {
  width: number;
  height: number;
} {
  const ratio = 16 / 9; // 16:9 aspect ratio
  return {
    width: containerWidth,
    height: Math.round(containerWidth / ratio),
  };
}

/**
 * Create image loading skeleton placeholder element
 */
export function createImageSkeleton(): HTMLDivElement {
  const skeleton = document.createElement("div");
  skeleton.className = "animate-pulse bg-muted-bg rounded-lg";
  skeleton.style.aspectRatio = "16/9";
  return skeleton;
}

/* ============================================================================
   PERFORMANCE UTILITIES
   ============================================================================ */

// Hook to prefetch resources when browser is idle
export const useIdleCallback = (callback: () => void) => {
  useEffect(() => {
    const handle = requestIdleCallback(() => {
      callback();
    });

    return () => cancelIdleCallback(handle);
  }, [callback]);
};

// Prefetch a resource when idle
export const usePrefetchResource = (resource: string) => {
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "prefetch";
    link.href = resource;
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [resource]);
};

// Component to prefetch resources
export const ResourcePrefetcher = ({ resources }: { resources: string[] }) => {
  useEffect(() => {
    resources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = resource;
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup would require tracking the specific links
    };
  }, [resources]);

  return null;
};

/* ============================================================================
   DATA FETCHING
   ============================================================================ */

interface UseDataFetchOptions {
  onSuccess?: (data: ApiResponse) => void;
  onError?: (error: string) => void;
  autoFetch?: boolean;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

interface UseDataFetchReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface ApiResponse {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

export const useDataFetch = <T>(
  fetchFn: () => Promise<ApiResponse>,
  options: UseDataFetchOptions = {}
): UseDataFetchReturn<T> => {
  const {
    onSuccess,
    onError,
    autoFetch = true,
    showErrorToast = true,
    showSuccessToast = false,
    successMessage,
  } = options;

  const { language } = useLayout();
  const { success: showSuccessMsg, error: showErrorMsg } = useToast();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchFn();

      if (response.success) {
        setData(response as T);
        onSuccess?.(response);

        if (showSuccessToast && successMessage) {
          showSuccessMsg(successMessage);
        }
      } else {
        const errorMsg = response.error || t("something_went_wrong", language);
        setError(errorMsg);
        onError?.(errorMsg);

        if (showErrorToast) {
          showErrorMsg(errorMsg);
        }
      }
    } catch (_err) {
      const errorMsg = t("server_error", language);
      setError(errorMsg);
      onError?.(errorMsg);

      if (showErrorToast) {
        showErrorMsg(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    fetchFn,
    language,
    onSuccess,
    onError,
    showErrorToast,
    showSuccessToast,
    successMessage,
    showSuccessMsg,
    showErrorMsg,
  ]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
