/**
 * CPANEL DEPLOYMENT GUIDE
 * 
 * Problem: Images and videos not loading after hosting /dist in cPanel
 * 
 * ROOT CAUSE:
 * ============
 * When you upload the /dist folder to cPanel, the asset paths are incorrect because:
 * 1. Absolute paths like /assets/uploads/... don't work from the dist folder
 * 2. API calls to /api/... can't find the backend PHP files
 * 3. The BASE_URL needs to match your deployment structure
 * 
 * SOLUTION:
 * ==========
 * 
 * SCENARIO 1: Root Domain Deployment (example.com)
 * ─────────────────────────────────────────────────
 * 
 * Directory Structure:
 * /public_html/
 *   ├── dist/                 (React app from npm run build)
 *   ├── public/               (Backend - api, assets, config, lib)
 *   └── index.php             (optional - for routing)
 * 
 * Steps:
 * 1. Build the app:
 *    npm run build
 * 2. Upload contents of dist/ to /public_html/
 * 3. Upload public/ folder to /public_html/public/
 * 4. No vite.config.ts changes needed (base: "./" is correct)
 * 
 * Vite Config:
 * base: "./"
 * 
 * 
 * SCENARIO 2: Subdirectory Deployment (example.com/my-app)
 * ─────────────────────────────────────────────────────────
 * 
 * Directory Structure:
 * /public_html/
 *   └── my-app/
 *       ├── dist/             (React app)
 *       └── public/           (Backend - api, assets, config, lib)
 * 
 * Steps:
 * 1. Build the app:
 *    npm run build
 * 2. Create folder: /public_html/my-app/
 * 3. Upload contents of dist/ to /public_html/my-app/
 * 4. Upload public/ folder to /public_html/my-app/public/
 * 5. Update vite.config.ts:
 * 
 * vite.config.ts:
 * ──────────────
 * if (command === "build") {
 *   return {
 *     ...config,
 *     base: "/my-app/",    // <- CHANGE THIS to your subdirectory
 *   };
 * }
 * 
 * 6. Rebuild:
 *    npm run build
 * 7. Re-upload the new dist/ folder
 * 
 * 
 * SCENARIO 3: API Backend in Different Location
 * ───────────────────────────────────────────────
 * 
 * If backend is at: example.com/api/
 * And frontend at: example.com/app/
 * 
 * You need to:
 * 1. Update vite.config.ts server proxy (for development):
 * 
 * server: {
 *   proxy: {
 *     "/api": {
 *       target: "http://localhost:8000",  // Your backend URL
 *       changeOrigin: true,
 *     },
 *   },
 * }
 * 
 * 2. Update src/lib/api.ts:
 * 
 * const API_BASE_URL = "https://example.com/api";  // Direct backend URL
 * 
 * OR adjust based on deployment:
 * 
 * const API_BASE_URL = import.meta.env.PROD 
 *   ? "https://example.com/api" 
 *   : "/api";
 * 
 * 
 * TROUBLESHOOTING CHECKLIST:
 * ============================
 * 
 * □ Images not loading?
 *   - Check if /assets/uploads/... folder exists in cPanel
 *   - Verify file permissions (should be 644 for files, 755 for folders)
 *   - Test path directly in browser: example.com/assets/uploads/...
 * 
 * □ Videos not loading?
 *   - Same as images above
 *   - Check MIME type: video/mp4 should be allowed
 *   - Verify crossOrigin="anonymous" attribute is set
 * 
 * □ API calls failing?
 *   - Check if /api/check_auth.php exists and is accessible
 *   - Verify API_BASE_URL matches your deployment
 *   - Check browser console for 404 or CORS errors
 * 
 * □ Page shows errors about /api?
 *   - API calls can't find backend files
 *   - Make sure public/ folder is accessible from dist/
 *   - May need to adjust vite.config.ts base URL
 * 
 * 
 * VERIFYING DEPLOYMENT:
 * ======================
 * 
 * 1. Open browser DevTools (F12)
 * 2. Go to Network tab
 * 3. Reload page and check:
 *    - CSS/JS files: should be 200 OK
 *    - /api calls: should be 200 OK (not 404)
 *    - /assets/uploads/...: should be 200 OK
 * 4. If you see 404 errors:
 *    - Check the URL in the request
 *    - Verify the file path matches your folder structure
 *    - Adjust base URL in vite.config.ts
 * 
 * 
 * COMMON MISTAKES:
 * =================
 * 
 * ❌ Not updating vite.config.ts base URL for subdirectory
 *    → Images/videos load via wrong path
 * 
 * ❌ Uploading only dist/ without public/ folder
 *    → API calls fail (PHP files not found)
 * 
 * ❌ dist/ and public/ in different locations
 *    → /assets/uploads/ paths don't match
 * 
 * ❌ Not rebuilding after changing vite.config.ts
 *    → Old base URL still in use
 * 
 * ❌ Wrong file permissions
 *    → Files exist but can't be read by web server
 * 
 * 
 * FINAL CHECKLIST BEFORE DEPLOYING:
 * ===================================
 * 
 * 1. □ Know your deployment URL (root or subdirectory)
 * 2. □ Update vite.config.ts with correct base URL
 * 3. □ Run: npm run build
 * 4. □ Upload dist/ folder contents
 * 5. □ Upload public/ folder to same level as dist/
 * 6. □ Set file permissions: 644 for files, 755 for folders
 * 7. □ Test in browser: check Network tab for errors
 * 8. □ If still failing: check browser console for error messages
 * 
 */

export const CPANEL_GUIDE = {
  scenarios: {
    root: "example.com (base: './')",
    subdirectory: "example.com/my-app (base: '/my-app/')",
    separated: "Frontend: example.com/app, Backend: example.com/api",
  },
  testUrls: {
    imageTest: "/assets/uploads/images/test.jpg",
    videoTest: "/assets/uploads/media/videos/test.mp4",
    apiTest: "/api/check_auth.php",
  },
};
