/**
 * Accessibility Utilities
 * Helpers for improving app accessibility and WCAG compliance
 */

/**
 * Generate ARIA labels for common patterns
 */
export const ARIA_LABELS = {
  // Navigation
  MAIN_MENU: "Main navigation menu",
  MOBILE_MENU: "Mobile navigation menu",
  BREADCRUMB: "Breadcrumb navigation",
  PAGINATION: "Pagination controls",

  // Forms
  SEARCH_FORM: "Search for articles",
  LOGIN_FORM: "Login form",
  COMMENT_FORM: "Post a comment",
  FILTER_OPTIONS: "Filter options",

  // Alerts
  SUCCESS: "Success message",
  ERROR: "Error message",
  WARNING: "Warning message",
  INFO: "Information message",

  // Interactive
  LIKE_BUTTON: "Like this article",
  SHARE_BUTTON: "Share this article",
  CLOSE_BUTTON: "Close dialog",
  EXPAND_BUTTON: "Expand section",
} as const;

/**
 * Check if element has sufficient color contrast
 * Returns contrast ratio (should be >= 4.5 for normal text, >= 3 for large text)
 */
export function getContrastRatio(
  foreground: string,
  background: string
): number {
  const rgb1 = hexToRgb(foreground);
  const rgb2 = hexToRgb(background);

  const l1 = calculateLuminance(rgb1);
  const l2 = calculateLuminance(rgb2);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Calculate relative luminance
 */
function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : ((val + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Generate skip to main content link element
 */
export function createSkipLink(): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = "#main-content";
  link.className =
    "sr-only focus:not-sr-only focus:fixed focus:top-0 focus:left-0 focus:z-50 focus:p-3 focus:bg-bbcRed focus:text-page-text";
  link.textContent = "Skip to main content";
  return link;
}

/**
 * Keyboard shortcut handler
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  ctrlKey?: boolean,
  shiftKey?: boolean
) {
  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        (!ctrlKey || event.ctrlKey) &&
        (!shiftKey || event.shiftKey)
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [key, callback, ctrlKey, shiftKey]);
}

/**
 * Focus trap for modals
 */
export function useFocusTrap(ref: React.RefObject<HTMLDivElement>) {
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const focusableElements = element.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => element.removeEventListener("keydown", handleKeyDown);
  }, [ref]);
}

/**
 * Announce message to screen readers
 */
export function announceToScreenReaders(message: string, assertive = false) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", assertive ? "assertive" : "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Import React for hooks
import React from "react";
