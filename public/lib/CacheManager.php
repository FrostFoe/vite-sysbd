<?php
/**
 * Server-Side Cache Manager
 * Implements caching for frequently accessed data
 */

class CacheManager {
    private $cacheDir;
    private $defaultTtl;
    
    public function __construct($cacheDir = null, $defaultTtl = 300) { // 5 minutes default
        $this->cacheDir = $cacheDir ?: sys_get_temp_dir() . '/bt_cache';
        $this->defaultTtl = $defaultTtl;
        
        // Create cache directory if it doesn't exist
        if (!is_dir($this->cacheDir)) {
            mkdir($this->cacheDir, 0755, true);
        }
    }
    
    /**
     * Generate a cache key from data
     */
    public function generateKey($data) {
        return md5(json_encode($data));
    }
    
    /**
     * Get cached data
     */
    public function get($key) {
        $cacheFile = $this->getCacheFile($key);
        
        if (!file_exists($cacheFile)) {
            return null;
        }
        
        $cacheData = json_decode(file_get_contents($cacheFile), true);
        
        if (time() - $cacheData['timestamp'] > $cacheData['ttl']) {
            // Cache expired
            unlink($cacheFile);
            return null;
        }
        
        return $cacheData['data'];
    }
    
    /**
     * Set cached data
     */
    public function set($key, $data, $ttl = null) {
        $ttl = $ttl ?: $this->defaultTtl;
        $cacheFile = $this->getCacheFile($key);
        
        $cacheData = [
            'data' => $data,
            'timestamp' => time(),
            'ttl' => $ttl
        ];
        
        file_put_contents($cacheFile, json_encode($cacheData));
    }
    
    /**
     * Delete cached data
     */
    public function delete($key) {
        $cacheFile = $this->getCacheFile($key);
        if (file_exists($cacheFile)) {
            unlink($cacheFile);
        }
    }
    
    /**
     * Check if cache exists and is valid
     */
    public function exists($key) {
        $data = $this->get($key);
        return $data !== null;
    }
    
    private function getCacheFile($key) {
        return $this->cacheDir . '/' . $key . '.cache';
    }
}

/**
 * Usage example in API endpoints
 */
function getCachedArticle($articleId, $lang = 'bn') {
    global $pdo;
    
    $cache = new CacheManager();
    $cacheKey = $cache->generateKey(['article', $articleId, $lang]);
    
    $cached = $cache->get($cacheKey);
    if ($cached) {
        return $cached;
    }
    
    // Fetch from database
    $stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ?");
    $stmt->execute([$articleId]);
    $articleRaw = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$articleRaw) {
        return null;
    }
    
    // Process article data (same as before)
    $article = [
        "id" => $articleRaw["id"],
        "title" => $lang === "en" ? $articleRaw["title_en"] : $articleRaw["title_bn"],
        "summary" => $lang === "en" ? $articleRaw["summary_en"] : $articleRaw["summary_bn"],
        "content" => $lang === "en" ? $articleRaw["content_en"] : $articleRaw["content_bn"],
        "readTime" => $lang === "en" ? $articleRaw["read_time_en"] : $articleRaw["read_time_bn"],
        "image" => $articleRaw["image"],
        "published_at" => $articleRaw["published_at"],
        "category_id" => $articleRaw["category_id"],
        "section_id" => $articleRaw["section_id"],
        "status" => $articleRaw["status"],
    ];
    
    // Cache for 10 minutes as article data is relatively stable
    $cache->set($cacheKey, $article, 600);
    
    return $article;
}

/**
 * Cache for frequently accessed lookup data
 */
function getCachedCategories($lang = 'bn') {
    global $pdo;
    
    $cache = new CacheManager();
    $cacheKey = $cache->generateKey(['categories', $lang]);
    
    $cached = $cache->get($cacheKey);
    if ($cached) {
        return $cached;
    }
    
    // Fetch from database
    $stmt = $pdo->query("SELECT id, title_bn, title_en, color FROM categories ORDER BY id ASC");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Cache for 60 minutes as categories rarely change
    $cache->set($cacheKey, $categories, 3600);
    
    return $categories;
}

function getCachedSections($lang = 'bn') {
    global $pdo;
    
    $cache = new CacheManager();
    $cacheKey = $cache->generateKey(['sections', $lang]);
    
    $cached = $cache->get($cacheKey);
    if ($cached) {
        return $cached;
    }
    
    // Fetch from database
    $titleCol = "title_{$lang}";
    $stmt = $pdo->query("SELECT id, {$titleCol} as title, type, highlight_color, associated_category, style, sort_order FROM sections ORDER BY sort_order ASC");
    $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Cache for 60 minutes as sections rarely change
    $cache->set($cacheKey, $sections, 3600);
    
    return $sections;
}