<?php
require_once __DIR__ . "/../../src/config/db.php";
require_once __DIR__ . "/../../src/lib/functions.php"; // For time_ago

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

    // 1. Fetch categories
    $stmt = $pdo->query(
        "SELECT id, title_bn, title_en, color FROM categories ORDER BY id ASC",
    );
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Create Category Map for O(1) Lookup
    $categoryMap = [];
    foreach ($categories as $cat) {
        $categoryMap[$cat["id"]] = [
            "bn" => $cat["title_bn"],
            "en" => $cat["title_en"],
        ];
    }

    // 2. Fetch Sections (Unified)
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

    // 3. Fetch Articles (Unified)
    $articleParams = [];
    $whereArticleListClause = "status = 'published'"; // Default
    if ($includeDrafts) {
        $whereArticleListClause = "1=1";
    }

    if ($categoryFilter) {
        $whereArticleListClause .= " AND category_id = ?";
        $articleParams[] = $categoryFilter;
    }

    // Dynamic Column Selection for Articles
    // Fallback logic: If title_en is empty, maybe show title_bn?
    // For now, strict selection: title_{$lang}.
    $artTitleCol = "title_{$lang}";
    $artSummaryCol = "summary_{$lang}";
    $artReadTimeCol = "read_time_{$lang}";
    // Content is not fetched for list view

    $articleListSql = "
        SELECT id, section_id, {$artTitleCol} as title, {$artSummaryCol} as summary, 
               image, published_at, created_at, category_id, {$artReadTimeCol} as read_time, 
               is_video, status
        FROM articles
        WHERE {$whereArticleListClause}
        ORDER BY published_at DESC
    ";

    $stmt = $pdo->prepare($articleListSql);
    $stmt->execute($articleParams);
    $allArticles = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Group articles by section_id
    $articlesBySection = [];
    foreach ($allArticles as $article) {
        // Filter out empty translations if necessary (e.g., if an article only has BN content)
        if (!empty($article["title"])) {
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
                $categoryName = null;
                if (
                    !empty($article["category_id"]) &&
                    isset($categoryMap[$article["category_id"]])
                ) {
                    $categoryName =
                        $lang === "en"
                            ? $categoryMap[$article["category_id"]]["en"]
                            : $categoryMap[$article["category_id"]]["bn"];
                }

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
                    "isVideo" => (bool) $article["is_video"],
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

    $data = get_data($lang, $page, $limit, $categoryFilter, $includeDrafts);

    $cacheKey = md5(
        json_encode([
            "lang" => $lang,
            "limit" => $limit,
            "page" => $page,
            "categoryFilter" => $categoryFilter,
            "includeDrafts" => $includeDrafts,
        ]),
    );
    $cacheFile =
        sys_get_temp_dir() .
        DIRECTORY_SEPARATOR .
        "bt_cache_" .
        $cacheKey .
        ".json";
    $cacheTtl = 30;

    $etag = null;
    if (file_exists($cacheFile) && time() - filemtime($cacheFile) < $cacheTtl) {
        $json = file_get_contents($cacheFile);
        $etag = '"' . md5($json) . '"';
        if (
            isset($_SERVER["HTTP_IF_NONE_MATCH"]) &&
            trim($_SERVER["HTTP_IF_NONE_MATCH"]) === $etag
        ) {
            header("ETag: " . $etag);
            http_response_code(304);
            exit();
        }
        header("ETag: " . $etag);
        header("Cache-Control: public, max-age=" . $cacheTtl);
        header("Content-Type: application/json");
        echo $json;
        exit();
    }

    $json = json_encode($data);
    @file_put_contents($cacheFile, $json);
    $etag = '"' . md5($json) . '"';
    header("ETag: " . $etag);
    header("Cache-Control: public, max-age=" . $cacheTtl);
    header("Content-Type: application/json");
    echo $json;
}
?>
