/**
 * Deployment Configuration
 * Handles different deployment scenarios (localhost, subdirectory, root domain, etc.)
 */

// Detect deployment environment
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
    return baseUrl.replace(/\/$/, "") + "/api";
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
