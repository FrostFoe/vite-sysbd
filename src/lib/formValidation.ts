/**
 * Form Validation Utilities
 * Provides comprehensive form validation with error messages
 */

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
import { useCallback, useState } from "react";

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
