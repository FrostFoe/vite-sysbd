import React from "react";
import type { FC, InputHTMLAttributes } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | string[];
  touched?: boolean;
  helperText?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Form Input Component with validation support
 */
export const FormInput: FC<FormInputProps> = ({
  label,
  error,
  touched,
  helperText,
  success,
  leftIcon,
  rightIcon,
  className,
  ...props
}) => {
  const errorMessage = Array.isArray(error) ? error[0] : error;
  const showError = touched && errorMessage;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-card-text mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text">
            {leftIcon}
          </div>
        )}

        <input
          {...props}
          className={`
            w-full px-4 py-2 rounded-lg border transition-colors
            ${leftIcon ? "pl-10" : ""}
            ${rightIcon ? "pr-10" : ""}
            ${
              showError
                ? "border-red-500 focus:ring-red-500 focus:border-transparent"
                : success
                  ? "border-green-500 focus:ring-green-500 focus:border-transparent"
                  : "border-border bg-card text-card-text focus:border-primary focus:ring-2 focus:ring-primary/20"
            }
            ${className}
          `}
        />

        {rightIcon && !showError && !success && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text">
            {rightIcon}
          </div>
        )}

        {showError && (
          <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
        )}

        {!showError && success && (
          <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
        )}
      </div>

      {showError && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </p>
      )}

      {helperText && !showError && (
        <p className="text-sm text-muted-text mt-1">{helperText}</p>
      )}
    </div>
  );
};

interface FormTextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | string[];
  touched?: boolean;
  helperText?: string;
  rows?: number;
}

/**
 * Form TextArea Component with validation support
 */
export const FormTextArea: FC<FormTextAreaProps> = ({
  label,
  error,
  touched,
  helperText,
  className,
  rows = 4,
  ...props
}) => {
  const errorMessage = Array.isArray(error) ? error[0] : error;
  const showError = touched && errorMessage;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-card-text mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        rows={rows}
        {...(props as any)}
        className={`
          w-full px-4 py-2 rounded-lg border transition-colors
          bg-card text-card-text
          ${
            showError
              ? "border-red-500 focus:ring-red-500"
              : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
          }
          ${className}
        `}
      />

      {showError && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </p>
      )}

      {helperText && !showError && (
        <p className="text-sm text-muted-text mt-1">{helperText}</p>
      )}
    </div>
  );
};

interface FormSelectProps extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | string[];
  touched?: boolean;
  helperText?: string;
  options: Array<{ value: string | number; label: string }>;
}

/**
 * Form Select Component with validation support
 */
export const FormSelect: FC<FormSelectProps> = ({
  label,
  error,
  touched,
  helperText,
  options,
  className,
  ...props
}) => {
  const errorMessage = Array.isArray(error) ? error[0] : error;
  const showError = touched && errorMessage;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-card-text mb-2">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <select
        {...(props as any)}
        className={`
          w-full px-4 py-2 rounded-lg border transition-colors
          bg-card text-card-text
          ${
            showError
              ? "border-red-500 focus:ring-red-500"
              : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
          }
          ${className}
        `}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {showError && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </p>
      )}

      {helperText && !showError && (
        <p className="text-sm text-muted-text mt-1">{helperText}</p>
      )}
    </div>
  );
};

interface FormCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | string[];
}

/**
 * Form Checkbox Component
 */
export const FormCheckbox: FC<FormCheckboxProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  const errorMessage = Array.isArray(error) ? error[0] : error;

  return (
    <div className="w-full">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          {...props}
          className={`
            w-4 h-4 rounded border-border bg-card text-primary
            focus:ring-2 focus:ring-primary/20
            ${className}
          `}
        />
        <span className="text-sm text-card-text">{label}</span>
      </label>

      {errorMessage && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </p>
      )}
    </div>
  );
};
