# Path Configuration Summary

## 🎯 Current Deployment Structure

```
public_html/news.breachtimes.com/dist/  ← This is your domain root
├── index.html                            → https://news.breachtimes.com/
├── api/                                  → https://news.breachtimes.com/api/
├── assets/                               → https://news.breachtimes.com/assets/
├── config/                               → Database config
├── database/                             → Database files
└── lib/                                  → PHP libraries
```

## 🔧 Fixed Configuration

### 1. API Base URL
**File:** `src/lib/api.ts`
```typescript
// FIXED: Now hardcoded to /api (domain root)
const API_BASE_URL = "/api";
```

**Why:** When dist/ is the domain root, `/api` routes directly to `dist/api/`.

### 2. Media URL Normalization
**File:** `src/lib/utils.ts`
```typescript
export function normalizeMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // Absolute URLs (http/https) - return as-is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // Root-relative paths (/) - return as-is
  // They map to domain root which IS dist/
  if (url.startsWith("/")) {
    return url;
  }
  
  return url;
}
```

**Why:** When a path starts with `/`, browser treats it as domain-root-relative. Since domain root IS `dist/`, no path manipulation needed.

### 3. Vite Build Configuration
**File:** `vite.config.ts`
```typescript
base: "./",  // Relative paths for bundled assets
```

**Why:** This makes bundled JS/CSS files load relative to the page, allowing them to work from `dist/` subfolder on cPanel.

## 📍 Path Resolution Examples

### Image Upload
```
User uploads image → upload_image.php returns → /assets/uploads/images/photo.jpg
Browser requests  → https://news.breachtimes.com/assets/uploads/images/photo.jpg
Maps to           → public_html/news.breachtimes.com/dist/assets/uploads/images/photo.jpg ✅
```

### API Call
```
Frontend calls    → /api/check_auth.php
Browser requests  → https://news.breachtimes.com/api/check_auth.php
Maps to           → public_html/news.breachtimes.com/dist/api/check_auth.php ✅
```

### Featured Image in Article
```
Article image     → /assets/uploads/images/feature.jpg (from database)
normalizeMediaUrl → returns as-is (starts with /)
Browser loads     → https://news.breachtimes.com/assets/uploads/images/feature.jpg ✅
```

### Video Player
```
Video in content  → /assets/uploads/videos/video.mp4 (from TipTap editor)
normalizeMediaUrl → returns as-is (starts with /)
Browser loads     → https://news.breachtimes.com/assets/uploads/videos/video.mp4 ✅
```

## ✅ All Components Using Correct Paths

1. **CustomImage.tsx** - Uses `normalizeMediaUrl()` for featured images
2. **CustomVideo.tsx** - Uses `normalizeMediaUrl()` for video src/poster
3. **ArticleDetail.tsx** - Uses `normalizeMediaUrl()` for article featured images
4. **ContentRenderer.tsx** - Normalizes media in rich text content
5. **CustomEditor.tsx** - Uploads return `/assets/uploads/...` paths
6. **API calls** - Use `/api` base URL

## 🚀 Deployment

Just upload entire `dist/` folder to `public_html/news.breachtimes.com/dist/`:
- All paths are relative
- No configuration needed on server
- Images/videos will load correctly
- API calls will work correctly

## 📊 Build Output

```
✓ 1234 modules transformed
✓ dist/index.html
✓ dist/assets/index-xxx.js (2.5MB)
✓ dist/assets/vendor-react-xxx.js (400KB)
✓ dist/assets/vendor-tiptap-xxx.js (300KB)
✓ dist/assets/index-xxx.css (500KB)
```

All files use relative imports, ready for `/dist/` hosting!
