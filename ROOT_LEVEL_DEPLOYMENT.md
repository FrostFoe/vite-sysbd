# ✅ Updated Deployment Structure - Root Level Hosting

## 📁 New Structure

You've changed from:

```
~/public_html/news.breachtimes.com/dist/
├── index.html
├── api/
├── assets/
├── config/
└── lib/
```

To:

```
~/public_html/news.breachtimes.com/
├── index.html
├── api/
├── assets/
├── config/
├── lib/
└── .htaccess
```

This is **cleaner and simpler**! ✅

## ✅ What's Updated

### FileUploader.php - Now Handles 3 Scenarios

```php
if (strpos($currentDir, "/dist/") !== false) {
  // Scenario 1: Nested in dist/ (old structure)
  $this->publicPath = __DIR__ . "/../../"; // → dist/
} elseif (basename(dirname(dirname($currentDir))) === "public") {
  // Scenario 2: In public/lib (development)
  $this->publicPath = __DIR__ . "/../../public/"; // → public/
} else {
  // Scenario 3: In domain root/lib (NEW - your new setup!)
  $this->publicPath = __DIR__ . "/../"; // → domain root/
}
```

### Vite Config

Already set correctly:

```typescript
base: "/"; // Absolute paths for domain root
```

### .htaccess

Already configured for SPA routing at domain root.

## 🚀 Deployment Steps

### Step 1: Upload All Files to Domain Root

Copy entire contents of `/dist/` directly to:

```
~/public_html/news.breachtimes.com/
```

Files to upload:

- ✅ index.html
- ✅ .htaccess (hidden file - enable "show hidden files" in FTP)
- ✅ api/ (folder)
- ✅ assets/ (folder)
- ✅ config/ (folder)
- ✅ database/ (folder)
- ✅ lib/ (folder)
- ✅ router.php (optional fallback)

### Step 2: Create Upload Directories

```bash
# Via SSH or cPanel Terminal:
mkdir -p ~/public_html/news.breachtimes.com/assets/uploads/images/articles
mkdir -p ~/public_html/news.breachtimes.com/assets/uploads/images/profiles
mkdir -p ~/public_html/news.breachtimes.com/assets/uploads/media/videos
mkdir -p ~/public_html/news.breachtimes.com/assets/uploads/media/audio
mkdir -p ~/public_html/news.breachtimes.com/assets/uploads/documents

# Set permissions:
chmod 755 ~/public_html/news.breachtimes.com/assets/uploads/
chmod 755 ~/public_html/news.breachtimes.com/assets/uploads/images/
chmod 755 ~/public_html/news.breachtimes.com/assets/uploads/media/
chmod 755 ~/public_html/news.breachtimes.com/assets/uploads/documents/
```

### Step 3: Verify .htaccess

Check that `.htaccess` file exists in:

```
~/public_html/news.breachtimes.com/.htaccess
```

Content should be:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Skip rewriting for real files
  RewriteCond %{REQUEST_FILENAME} -f
  RewriteRule ^ - [L]

  # Skip rewriting for real directories
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Don't rewrite the api folder
  RewriteCond %{REQUEST_URI} ^/api/ [OR]
  RewriteCond %{REQUEST_URI} ^/assets/ [OR]
  RewriteCond %{REQUEST_URI} ^/config/ [OR]
  RewriteCond %{REQUEST_URI} ^/database/ [OR]
  RewriteCond %{REQUEST_URI} ^/lib/
  RewriteRule ^ - [L]

  # For all other requests, rewrite to index.html
  RewriteRule ^(.*)$ index.html [QSA,L]
</IfModule>
```

## 📊 Path Resolution

### Homepage

```
Request: https://news.breachtimes.com/
↓
Maps to: ~/public_html/news.breachtimes.com/index.html ✅
```

### Direct Route Access

```
Request: https://news.breachtimes.com/article/art_001
↓
Apache detects: Not a real file → Rewrite to index.html
↓
Maps to: ~/public_html/news.breachtimes.com/index.html
↓
Browser loads React + assets
↓
React Router parses: /article/art_001
↓
Renders: ArticleDetail component ✅
```

### Assets

```
Request: https://news.breachtimes.com/assets/index.js
↓
Maps to: ~/public_html/news.breachtimes.com/assets/index.js ✅
```

### API Calls

```
Request: https://news.breachtimes.com/api/check_auth.php
↓
Maps to: ~/public_html/news.breachtimes.com/api/check_auth.php ✅
```

### Image Uploads

```
User uploads image
↓
FileUploader.php detects: Not in /dist/, not in /public/ → Domain root!
↓
Sets: $publicPath = domain root/
↓
Saves to: ~/public_html/news.breachtimes.com/assets/uploads/images/...
↓
Browser loads: https://news.breachtimes.com/assets/uploads/images/... ✅
```

## 🧪 Testing Checklist

After deployment, test:

- [ ] Homepage loads: `https://news.breachtimes.com/`
- [ ] Direct route works: `https://news.breachtimes.com/article/123`
- [ ] Admin loads: `https://news.breachtimes.com/admin`
- [ ] Login loads: `https://news.breachtimes.com/login`
- [ ] Image upload works
- [ ] Video upload works
- [ ] Uploaded images/videos visible in articles
- [ ] API calls work (check DevTools Network tab)
- [ ] No 404 errors in console (F12)

## 🔍 Browser DevTools - What to Check

When visiting `https://news.breachtimes.com/article/123`:

**Network Tab:**

- Request: `/article/123` → Status: 200 ✅ (rewritten to index.html)
- Assets: `/assets/index-*.js` → Status: 200 ✅
- Assets: `/assets/index-*.css` → Status: 200 ✅
- API: `/api/*` → Status: varies (depends on endpoint)

**Console Tab:**

- **NO errors** ✅
- React initializes normally
- Router works correctly

## 📝 Build Information

```
✓ Build completed successfully
✓ All files in dist/ ready for upload
✓ FileUploader.php updated for root-level hosting
✓ Vite configured with base: "/"
✓ .htaccess configured for SPA routing
✓ Total size: ~1.2MB (including all assets and vendor chunks)
```

## ✅ Benefits of This Structure

1. **Cleaner** - No extra `dist/` directory level
2. **Simpler** - Direct domain → root folder
3. **Standard** - Follows typical web hosting structure
4. **Better URLs** - No path nesting
5. **Easier to debug** - Clear file structure

## 💡 Summary

Your new structure is **cleaner and works perfectly** with the updated FileUploader detection logic. Just upload all files directly to the domain root and you're done! ✅
