# cPanel Deployment Guide - Hosting dist/ at Domain Root

## ✅ Setup Completed

Your web app is now configured to work correctly when hosted at `public_html/news.breachtimes.com/dist/` as the document root.

### Configuration Summary

**File Changes Made:**
- ✅ API base URL: Fixed to `/api` (absolute path from domain root)
- ✅ Media URL normalization: Simplified to work with domain-root structure
- ✅ Vite build: Configured with `base: "./"` for relative asset paths
- ✅ Build output: Fresh production build created

## 🚀 Deployment Steps

### 1. Upload Files to cPanel

**Option A: Using FTP/SFTP**

```bash
# From your local machine:
sftp your-cpanel-username@your-server.com

# Connect to the correct directory:
cd public_html/news.breachtimes.com/dist/

# Upload all files from local dist folder:
put -r dist/* ./
```

**Option B: Using cPanel File Manager**

1. Log in to cPanel
2. Go to File Manager
3. Navigate to `public_html/news.breachtimes.com/dist/`
4. Upload the contents of your local `dist/` folder
5. Include these subdirectories:
   - `assets/` (with uploaded images/videos in `uploads/`)
   - `api/`
   - `config/`
   - `database/`
   - `lib/`
   - `index.html` and other frontend files

**Option C: Using Git (if enabled on server)**

```bash
# On your server:
cd ~/public_html/news.breachtimes.com/dist/
git clone <your-repo> .
npm install
npm run build
```

### 2. Verify File Structure

After upload, your directory structure should look like:

```
public_html/news.breachtimes.com/dist/
├── .htaccess           # URL rewriting rules
├── index.html          # Main React app entry point
├── api/                # PHP API endpoints
│   ├── check_auth.php
│   ├── login.php
│   ├── upload_image.php
│   ├── upload_video.php
│   └── ... (other API files)
├── assets/
│   ├── uploads/        # User uploaded files
│   │   ├── images/
│   │   ├── videos/
│   │   └── media/
│   └── ... (built frontend assets)
├── config/             # Database and upload config
│   ├── db.php
│   └── uploads.php
├── database/           # Database setup/seed files
├── lib/                # Shared PHP libraries
│   ├── FileUploader.php
│   ├── security.php
│   └── ...
└── ... (JS/CSS bundles in assets/)
```

### 3. Set File Permissions

```bash
# On server via SSH:
cd ~/public_html/news.breachtimes.com/dist/

# Set directory permissions (755 = read/write/execute for owner, read/execute for others)
find . -type d -exec chmod 755 {} \;

# Set file permissions (644 = read/write for owner, read for others)
find . -type f -exec chmod 644 {} \;

# Extra permissions for specific directories that need write access:
chmod 755 assets/uploads/
chmod 755 assets/uploads/images/
chmod 755 assets/uploads/videos/
chmod 755 assets/uploads/media/
```

### 4. Test the Deployment

**Test Homepage:**
```
https://news.breachtimes.com/
```
Should display your React app interface.

**Test API Endpoints:**
```
https://news.breachtimes.com/api/check_auth.php
```
Should return JSON response (with authentication check).

**Test Image Upload:**
1. Go to Admin Dashboard
2. Create an article
3. Upload an image in the editor
4. Verify image appears immediately

**Test Video Upload:**
1. Go to Admin Dashboard
2. Create an article
3. Upload a video in the editor
4. Verify video plays correctly

**Test Media Loading:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Check that these URLs load without 404:
   - `/api/*` (API endpoints)
   - `/assets/uploads/images/*` (images)
   - `/assets/uploads/videos/*` (videos)
   - `/assets/main-*.js` (built JS)
   - `/assets/index-*.css` (built CSS)

## 🔍 Troubleshooting

### Images/Videos Not Loading

**Problem:** Images or videos show 404 errors in browser Network tab

**Solution 1: Check .htaccess**
Ensure `.htaccess` exists in `dist/` folder:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  
  # Allow direct access to assets
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  
  # Route everything else to index.html for React Router
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

**Solution 2: Check File Paths**
In browser DevTools Network tab, check exact request URL. Should be:
- `/api/upload_image.php` (not `/dist/api/`)
- `/assets/uploads/images/filename.jpg` (not `/dist/assets/`)

**Solution 3: Check Directory Permissions**
```bash
# Verify directories are writable:
ls -la ~/public_html/news.breachtimes.com/dist/assets/uploads/
# Should show: drwxr-xr-x (755)
```

### API Requests Failing

**Problem:** "Cannot POST /api/upload_image.php" or similar errors

**Solution:**
1. Verify `api/` directory exists in `dist/`
2. Check PHP files are present (ls -la dist/api/)
3. Verify file permissions: `chmod 644 dist/api/*.php`
4. Check PHP version on server supports requirements

### Page Refresh Issues

**Problem:** Page refreshes when uploading media

**Solution:** 
Already fixed in this version. If still occurring, clear browser cache:
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### CORS Errors in Console

**Problem:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Solution:** Add to `.htaccess` in `dist/` folder:
```apache
<IfModule mod_headers.c>
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
  Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>
```

## 📋 Checklist Before Going Live

- [ ] All files uploaded to `public_html/news.breachtimes.com/dist/`
- [ ] File permissions set (755 for dirs, 644 for files)
- [ ] `.htaccess` file exists in dist/
- [ ] Database is set up (run `database/seed.php` if needed)
- [ ] Test homepage loads
- [ ] Test API endpoint responds
- [ ] Test image upload works
- [ ] Test video upload works
- [ ] Test images load in article detail page
- [ ] Test videos play in article detail page
- [ ] Check browser console for errors (F12)
- [ ] Test on different browsers

## 🔗 Important File Locations

| Component | Path |
|-----------|------|
| React App | `dist/index.html` |
| API | `dist/api/*.php` |
| Config | `dist/config/db.php` |
| Uploads | `dist/assets/uploads/` |
| Database | `dist/database/seed.php` |
| Security | `dist/lib/security.php` |

## 🔐 Security Notes

1. **Database Credentials:** Update `dist/config/db.php` with production database details
2. **Session Security:** Ensure PHP `session.secure = 1` and `session.httponly = 1` in php.ini
3. **Upload Limits:** Check PHP `upload_max_filesize` and `post_max_size` in php.ini
4. **HTTPS:** Use SSL certificate (typically free with cPanel)

## ✅ Done!

Your application is configured and ready to deploy at `public_html/news.breachtimes.com/dist/`. All paths are correctly set to work from the domain root with this folder structure.
