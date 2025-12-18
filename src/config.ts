/**
 * Global Configuration & Constants
 * Centralized all config and constants from src/config and src/lib/constants
 */

/* ============================================================================
   DEPLOYMENT CONFIGURATION
   ============================================================================ */

/**
 * Deployment Configuration
 * Handles different deployment scenarios (localhost, subdirectory, root domain, etc.)
 */
export const DEPLOYMENT_CONFIG = {
  // Set to true for cPanel subdirectory deployments
  // Example: example.com/my-app/dist → set to "my-app"
  SUBDIRECTORY: "" as string,

  // Or auto-detect from vite base URL
  getBaseUrl: (): string => {
    const baseUrl = import.meta.env.BASE_URL || "/";
    return baseUrl;
  },

  // Get API base URL
  getApiUrl: (): string => {
    const baseUrl = DEPLOYMENT_CONFIG.getBaseUrl();
    if (baseUrl === "/") {
      return "/api";
    }
    // Remove trailing slash and append /api
    return `${baseUrl.replace(/\/$/, "")}/api`;
  },

  // Get asset base URL
  getAssetUrl: (): string => {
    return DEPLOYMENT_CONFIG.getBaseUrl();
  },
};

/**
 * CPANEL DEPLOYMENT INSTRUCTIONS:
 *
 * 1. If hosting at root (example.com):
 *    - No changes needed, leave everything as default
 *    - base in vite.config.ts should be "./"
 *
 * 2. If hosting in subdirectory (example.com/my-app):
 *    - Update vite.config.ts base to: base: "/my-app/"
 *    - Or set DEPLOYMENT_CONFIG.SUBDIRECTORY = "my-app"
 *    - The files are served from /public_html/my-app/dist
 *
 * 3. Ensure:
 *    - /public folder with /api/* files is accessible
 *    - Backend PHP files are at the same level as dist folder
 *    - Or adjust the API proxy accordingly
 */

/* ============================================================================
   API CONFIGURATION
   ============================================================================ */

export const API_BASE_URL = "/api";
export const API_TIMEOUT = 30000; // 30 seconds

/* ============================================================================
   PAGINATION
   ============================================================================ */

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const COMMENTS_PER_PAGE = 20;
export const ARTICLES_PER_PAGE = 10;
export const SEARCH_RESULTS_PER_PAGE = 15;

/* ============================================================================
   FILE UPLOAD
   ============================================================================ */

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

// Dangerous file extensions that should be blocked
export const DANGEROUS_FILE_EXTENSIONS = [
  "php",
  "phtml",
  "php3",
  "php4",
  "php5",
  "php7",
  "php8",
  "phps",
  "pht",
  "phar",
  "html",
  "htm",
  "js",
  "jsp",
  "jspx",
  "pl",
  "py",
  "rb",
  "sh",
  "sql",
  "htaccess",
  "htpasswd",
  "exe",
  "com",
  "bat",
  "cmd",
  "pif",
  "scr",
  "vbs",
  "vbe",
  "jar",
  "shtml",
  "shtm",
  "stm",
  "asa",
  "asax",
  "ascx",
  "ashx",
  "asmx",
  "axd",
  "c",
  "cpp",
  "csharp",
  "vb",
  "asp",
  "aspx",
  "asmx",
  "swf",
  "cgi",
  "dll",
  "sys",
  "ps1",
  "psm1",
  "psd1",
  "reg",
  "msi",
  "msp",
  "lnk",
  "inf",
  "application",
  "gadget",
  "hta",
  "cpl",
  "msc",
  "ws",
  "wsf",
  "wsh",
  "jse",
];

/* ============================================================================
   POLLING INTERVALS (milliseconds)
   ============================================================================ */

export const COMMENT_POLL_INTERVAL = 5000; // 5 seconds
export const MESSAGE_POLL_INTERVAL = 3000; // 3 seconds
export const NOTIFICATION_POLL_INTERVAL = 10000; // 10 seconds

/* ============================================================================
   UI TIMEOUTS
   ============================================================================ */

export const TOAST_DURATION = 3000; // 3 seconds
export const LOADING_TIMEOUT = 30000; // 30 seconds
export const DEBOUNCE_DELAY = 300; // 300ms for search
export const AUTOSAVE_DELAY = 2000; // 2 seconds for autosave

/* ============================================================================
   VALIDATION RULES
   ============================================================================ */

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_SEARCH_QUERY = 2; // Minimum characters to search
export const MAX_ARTICLE_TITLE = 255;
export const MAX_COMMENT_LENGTH = 5000;
export const MAX_ARTICLE_SUMMARY = 500;

/* ============================================================================
   LOCAL STORAGE KEYS
   ============================================================================ */

export const LS_KEYS = {
  THEME: "bt-theme",
  LANGUAGE: "bt-language",
  DRAFT_ARTICLE: "bt-draft-article",
  DRAFT_COMMENT: "bt-draft-comment",
  USER_PREFERENCES: "bt-preferences",
  SAVED_ARTICLES: "bt-saved",
  AUTH_TOKEN: "bt-auth",
} as const;

/* ============================================================================
   SESSION MANAGEMENT
   ============================================================================ */

export const SESSION_TIMEOUT = 3600000; // 1 hour in milliseconds
export const SESSION_WARNING_TIME = 300000; // 5 minutes before timeout

/* ============================================================================
   IMAGE DIMENSIONS
   ============================================================================ */

export const FEATURED_IMAGE_WIDTH = 800;
export const FEATURED_IMAGE_HEIGHT = 450;
export const THUMBNAIL_WIDTH = 200;
export const THUMBNAIL_HEIGHT = 150;

/* ============================================================================
   SEARCH & PERFORMANCE
   ============================================================================ */

export const SEARCH_DEBOUNCE = 500; // 500ms
export const WORDS_PER_MINUTE = 200; // Read time calculation

/* ============================================================================
   ACCESSIBILITY
   ============================================================================ */

export const FOCUS_OUTLINE_COLOR = "var(--color-bbcRed)";
export const SKIP_TO_CONTENT_ID = "main-content";

/* ============================================================================
   ERROR MESSAGES
   ============================================================================ */

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

/* ============================================================================
   SUCCESS MESSAGES
   ============================================================================ */

export const SUCCESS_MESSAGES = {
  ARTICLE_SAVED: "Article saved successfully.",
  COMMENT_POSTED: "Comment posted successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
  ARTICLE_DELETED: "Article deleted successfully.",
  COPIED_TO_CLIPBOARD: "Copied to clipboard.",
} as const;

/* ============================================================================
   LANGUAGE & CONTENT CODES
   ============================================================================ */

export const LANGUAGES = {
  EN: "en",
  BN: "bn",
} as const;

export const ARTICLE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  MODERATOR: "moderator",
} as const;

export const SORT_OPTIONS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  MOST_HELPFUL: "helpful",
  MOST_DISCUSSED: "discussed",
} as const;
