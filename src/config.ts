export const DEPLOYMENT_CONFIG = {
  SUBDIRECTORY: "" as string,

  getBaseUrl: (): string => {
    const baseUrl = import.meta.env.BASE_URL || "/";
    return baseUrl;
  },

  getApiUrl: (): string => {
    const baseUrl = DEPLOYMENT_CONFIG.getBaseUrl();
    if (baseUrl === "/") {
      return "/api";
    }

    return `${baseUrl.replace(/\/$/, "")}/api`;
  },

  getAssetUrl: (): string => {
    return DEPLOYMENT_CONFIG.getBaseUrl();
  },
};

export const API_BASE_URL = "/api";
export const API_TIMEOUT = 30000;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const COMMENTS_PER_PAGE = 20;
export const ARTICLES_PER_PAGE = 10;
export const SEARCH_RESULTS_PER_PAGE = 15;

export const MAX_FILE_SIZE = 2 * 1024 * 1024;
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_FILE_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "jpg",
  "jpeg",
  "png",
];

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

export const COMMENT_POLL_INTERVAL = 5000;
export const MESSAGE_POLL_INTERVAL = 3000;
export const NOTIFICATION_POLL_INTERVAL = 10000;

export const TOAST_DURATION = 3000;
export const LOADING_TIMEOUT = 30000;
export const DEBOUNCE_DELAY = 300;
export const AUTOSAVE_DELAY = 2000;

export const MIN_PASSWORD_LENGTH = 8;
export const MIN_SEARCH_QUERY = 2;
export const MAX_ARTICLE_TITLE = 255;
export const MAX_COMMENT_LENGTH = 5000;
export const MAX_ARTICLE_SUMMARY = 500;

export const LS_KEYS = {
  THEME: "bt-theme",
  LANGUAGE: "bt-language",
  DRAFT_ARTICLE: "bt-draft-article",
  DRAFT_COMMENT: "bt-draft-comment",
  USER_PREFERENCES: "bt-preferences",
  SAVED_ARTICLES: "bt-saved",
  AUTH_TOKEN: "bt-auth",
} as const;

export const SESSION_TIMEOUT = 3600000;
export const SESSION_WARNING_TIME = 300000;

export const FEATURED_IMAGE_WIDTH = 800;
export const FEATURED_IMAGE_HEIGHT = 450;
export const THUMBNAIL_WIDTH = 200;
export const THUMBNAIL_HEIGHT = 150;

export const SEARCH_DEBOUNCE = 500;
export const WORDS_PER_MINUTE = 200;

export const FOCUS_OUTLINE_COLOR = "var(--color-bbcRed)";
export const SKIP_TO_CONTENT_ID = "main-content";

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

export const SUCCESS_MESSAGES = {
  ARTICLE_SAVED: "Article saved successfully.",
  COMMENT_POSTED: "Comment posted successfully.",
  PROFILE_UPDATED: "Profile updated successfully.",
  ARTICLE_DELETED: "Article deleted successfully.",
  COPIED_TO_CLIPBOARD: "Copied to clipboard.",
} as const;

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
