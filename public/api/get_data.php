<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/functions.php"; // For time_ago
require_once __DIR__ . "/../lib/CacheManager.php"; // Include the new cache manager

function get_data(
    $lang = "bn",
    $page = 1,
    $limit = null,
    $categoryFilter = null,
    $includeDrafts = false,
) {
    global $pdo;

    // Validate language
    $lang = $lang === "en" ? "en" : "bn";

    // Use cache for categories and sections since they change infrequently
    $cache = new CacheManager();

    // Get categories from cache or database
    $categories = $cache->get($cache->generateKey(["categories", $lang]));
    if (!$categories) {
        $stmt = $pdo->query(
            "SELECT id, title_bn, title_en, color FROM categories ORDER BY id ASC",
        );
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Cache for 60 minutes as categories rarely change
        $cache->set(
            $cache->generateKey(["categories", $lang]),
            $categories,
            3600,
        );
    }

    // Create Category Map for O(1) Lookup
    $categoryMap = [];
    foreach ($categories as $cat) {
        $categoryMap[$cat["id"]] = [
            "bn" => $cat["title_bn"],
            "en" => $cat["title_en"],
        ];
    }

    // Get sections from cache or database
    $sections = $cache->get(
        $cache->generateKey(["sections", $lang, $categoryFilter]),
    );
    if (!$sections) {
        $sectionParams = [];
        $whereSectionListClause = "1=1"; // Always true
        if ($categoryFilter) {
            $whereSectionListClause .= " AND associated_category = ?";
            $sectionParams[] = $categoryFilter;
        }

        // Dynamic Column Selection based on Language
        $titleCol = "title_{$lang}";
        // Sections don't have translated type/style usually, but title is translated.

        $sectionSql = "
            SELECT id, {$titleCol} as title, type, highlight_color, associated_category, style, sort_order
            FROM sections
            WHERE {$whereSectionListClause}
            ORDER BY sort_order ASC
        ";
        $stmt = $pdo->prepare($sectionSql);
        $stmt->execute($sectionParams);
        $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // Cache for 60 minutes as sections rarely change
        $cache->set(
            $cache->generateKey(["sections", $lang, $categoryFilter]),
            $sections,
            3600,
        );
    }

    // 3. Fetch Articles (Unified) - now with JOIN to get category info in one query
    $articleParams = [];
    $whereArticleListClause = "a.status = 'published'"; // Default
    if ($includeDrafts) {
        $whereArticleListClause = "1=1";
    }

    if ($categoryFilter) {
        $whereArticleListClause .= " AND a.category_id = ?";
        $articleParams[] = $categoryFilter;
    }

    // Dynamic Column Selection for Articles
    $artTitleCol = "a.title_{$lang}";
    $artSummaryCol = "a.summary_{$lang}";
    $artReadTimeCol = "a.read_time_{$lang}";

    // Optimized query with JOIN to get category names in one query
    $articleListSql = "
        SELECT
            a.id,
            a.section_id,
            {$artTitleCol} as title,
            {$artSummaryCol} as summary,
            a.image,
            a.published_at,
            a.created_at,
            a.category_id,
            {$artReadTimeCol} as read_time,
            a.status,
            COALESCE(c.title_{$lang}, c.title_bn) as category_title
        FROM articles a
        LEFT JOIN categories c ON a.category_id = c.id
        WHERE {$whereArticleListClause}
        ORDER BY a.published_at DESC
    ";

    $stmt = $pdo->prepare($articleListSql);
    $stmt->execute($articleParams);
    $allArticles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Group articles by section_id
    $articlesBySection = [];
    foreach ($allArticles as $article) {
        // Filter out empty translations if necessary
        if (!empty($article["title"])) {
            // Add category title to the article for easier access
            $article["category_title"] = $article["category_title"] ?? null;
            $articlesBySection[$article["section_id"]][] = $article;
        }
    }

    // Construct Response
    $sectionsData = [];
    foreach ($sections as $section) {
        $sectionId = $section["id"];

        // Skip sections with no title in requested language?
        if (empty($section["title"])) {
            continue;
        }

        $sectionData = [
            "id" => $sectionId,
            "title" => $section["title"],
            "type" => $section["type"],
            "highlightColor" => $section["highlight_color"],
            "associatedCategory" => $section["associated_category"],
            "style" => $section["style"],
            "articles" => [],
        ];

        if (isset($articlesBySection[$sectionId])) {
            $sectionArticles = $articlesBySection[$sectionId];

            if ($limit !== null) {
                $sectionArticles = array_slice(
                    $sectionArticles,
                    ($page - 1) * $limit,
                    $limit,
                );
            }

            foreach ($sectionArticles as $article) {
                $categoryName = $article["category_title"] ?? null;

                $articleData = [
                    "id" => $article["id"],
                    "title" => $article["title"],
                    "summary" => $article["summary"],
                    "image" => $article["image"],
                    "published_at" => $article["published_at"],
                    "category" =>
                        $categoryName ??
                        ($lang === "bn" ? "অন্যান্য" : "Other"),
                    "category_id" => $article["category_id"] ?? null,
                    "read_time" => $article["read_time"],
                    "status" => $article["status"],
                ];
                $sectionData["articles"][] = $articleData;
            }
        }
        $sectionsData[] = $sectionData;
    }

    $data = [
        "categories" => $categories,
        "sections" => $sectionsData,
        "meta" => [
            "page" => $page,
            "limit" => $limit,
            "categoryFilter" => $categoryFilter,
            "includeDrafts" => $includeDrafts,
        ],
    ];

    return $data;
}

if (count(debug_backtrace()) == 0) {
    session_start();

    $lang = isset($_GET["lang"]) ? $_GET["lang"] : "bn";
    $limit =
        isset($_GET["limit"]) && is_numeric($_GET["limit"])
            ? (int) $_GET["limit"]
            : null;
    $page =
        isset($_GET["page"]) && is_numeric($_GET["page"])
            ? (int) $_GET["page"]
            : 1;
    $categoryFilter = isset($_GET["category"]) ? $_GET["category"] : null;

    $isAdmin =
        isset($_SESSION["user_role"]) && $_SESSION["user_role"] === "admin";
    $includeDrafts = $isAdmin;

    // Create cache key for the entire response
    $cache = new CacheManager();
    $cacheKey = $cache->generateKey([
        "get_data",
        $lang,
        $page,
        $limit,
        $categoryFilter,
        $includeDrafts,
    ]);

    // Try to get from cache first
    $data = $cache->get($cacheKey);
    if (!$data) {
        $data = get_data($lang, $page, $limit, $categoryFilter, $includeDrafts);
        // Cache for 5 minutes for data that changes frequently
        $cache->set($cacheKey, $data, 300);
    }

    // Send response with ETag for HTTP caching
    $json = json_encode($data);
    $etag = '"' . md5($json) . '"';

    if (
        isset($_SERVER["HTTP_IF_NONE_MATCH"]) &&
        trim($_SERVER["HTTP_IF_NONE_MATCH"]) === $etag
    ) {
        header("ETag: " . $etag);
        header("Cache-Control: public, max-age=300");
        http_response_code(304);
        exit();
    }

    header("ETag: " . $etag);
    header("Cache-Control: public, max-age=300");
    header("Content-Type: application/json");
    echo $json;
}
?>
