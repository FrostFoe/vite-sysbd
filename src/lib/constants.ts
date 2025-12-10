/**
 * Application Constants
 * Centralized configuration for magic numbers and settings
 */

// API Configuration
export const API_BASE_URL = "/api";
export const API_TIMEOUT = 30000; // 30 seconds

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const COMMENTS_PER_PAGE = 20;
export const ARTICLES_PER_PAGE = 10;
export const SEARCH_RESULTS_PER_PAGE = 15;

// File Upload
export const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "jpg",
  "jpeg",
  "png",
];

// Polling Intervals (in milliseconds)
export const COMMENT_POLL_INTERVAL = 5000; // 5 seconds
export const MESSAGE_POLL_INTERVAL = 3000; // 3 seconds
export const NOTIFICATION_POLL_INTERVAL = 10000; // 10 seconds

// UI Timeouts
export const TOAST_DURATION = 3000; // 3 seconds
export const LOADING_TIMEOUT = 30000; // 30 seconds
export const DEBOUNCE_DELAY = 300; // 300ms for search
export const AUTOSAVE_DELAY = 2000; // 2 seconds for autosave

// Validation Rules
export const MIN_PASSWORD_LENGTH = 8;
export const MIN_SEARCH_QUERY = 2; // Minimum characters to search
export const MAX_ARTICLE_TITLE = 255;
export const MAX_COMMENT_LENGTH = 5000;
export const MAX_ARTICLE_SUMMARY = 500;

// Local Storage Keys
export const LS_KEYS = {
  THEME: "bt-theme",
  LANGUAGE: "bt-language",
  DRAFT_ARTICLE: "bt-draft-article",
  DRAFT_COMMENT: "bt-draft-comment",
  USER_PREFERENCES: "bt-preferences",
  SAVED_ARTICLES: "bt-saved",
  AUTH_TOKEN: "bt-auth",
} as const;

// Session Duration
export const SESSION_TIMEOUT = 3600000; // 1 hour in milliseconds
export const SESSION_WARNING_TIME = 300000; // 5 minutes before timeout

// Image Dimensions
export const FEATURED_IMAGE_WIDTH = 800;
export const FEATURED_IMAGE_HEIGHT = 450;
export const THUMBNAIL_WIDTH = 200;
export const THUMBNAIL_HEIGHT = 150;

// Search Debounce
export const SEARCH_DEBOUNCE = 500; // 500ms

// Read Time Calculation
export const WORDS_PER_MINUTE = 200;

// Accessibility
export const FOCUS_OUTLINE_COLOR = "#b80000";
export const SKIP_TO_CONTENT_ID = "main-content";

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  TIMEOUT: "Request timed out. Please try again.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  SERVER_ERROR: "Server error. Please try again later.",
  INVALID_INPUT: "Invalid input. Please check your data.",
  FILE_TOO_LARGE: "File is too large. Maximum size is 2MB.",
  UNSUPPORTED_FILE_TYPE: "This file type is not supported.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ARTICLE_SAVED: "Article saved successfully.",
  COMMENT_POSTED: "Comment posted successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
  ARTICLE_DELETED: "Article deleted successfully.",
  COPIED_TO_CLIPBOARD: "Copied to clipboard.",
} as const;

// Language Codes
export const LANGUAGES = {
  EN: "en",
  BN: "bn",
} as const;

// Article Status
export const ARTICLE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
} as const;

// Sort Options
export const SORT_OPTIONS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  MOST_HELPFUL: "helpful",
  MOST_DISCUSSED: "discussed",
} as const;
