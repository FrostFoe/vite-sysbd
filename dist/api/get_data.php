<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/functions.php";
require_once __DIR__ . "/../lib/CacheManager.php";

function get_data(
    $lang = "bn",
    $page = 1,
    $limit = null,
    $categoryFilter = null,
    $includeDrafts = false,
) {
    global $pdo;

    $lang = $lang === "en" ? "en" : "bn";

    $cache = new CacheManager();

    $categories = $cache->get($cache->generateKey(["categories", $lang]));
    if (!$categories) {
        $stmt = $pdo->query(
            "SELECT id, title_bn, title_en, color FROM categories ORDER BY id ASC",
        );
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $cache->set(
            $cache->generateKey(["categories", $lang]),
            $categories,
            3600,
        );
    }

    $categoryMap = [];
    foreach ($categories as $cat) {
        $categoryMap[$cat["id"]] = [
            "bn" => $cat["title_bn"],
            "en" => $cat["title_en"],
        ];
    }

    $sections = $cache->get(
        $cache->generateKey(["sections", $lang, $categoryFilter]),
    );
    if (!$sections) {
        $sectionParams = [];
        $whereSectionListClause = "1=1";
        if ($categoryFilter) {
            $whereSectionListClause .= " AND associated_category = ?";
            $sectionParams[] = $categoryFilter;
        }

        $titleCol = "title_{$lang}";

        $sectionSql = "
            SELECT id, {$titleCol} as title, type, highlight_color, associated_category, style, sort_order
            FROM sections
            WHERE {$whereSectionListClause}
            ORDER BY sort_order ASC
        ";
        $stmt = $pdo->prepare($sectionSql);
        $stmt->execute($sectionParams);
        $sections = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $cache->set(
            $cache->generateKey(["sections", $lang, $categoryFilter]),
            $sections,
            3600,
        );
    }

    $articleParams = [];
    $whereArticleListClause = "a.status = 'published'";
    if ($includeDrafts) {
        $whereArticleListClause = "1=1";
    }

    if ($categoryFilter) {
        $whereArticleListClause .= " AND a.category_id = ?";
        $articleParams[] = $categoryFilter;
    }

    $artTitleCol = "a.title_{$lang}";
    $artSummaryCol = "a.summary_{$lang}";
    $artReadTimeCol = "a.read_time_{$lang}";

    $articleListSql = "
        SELECT
            a.id,
            a.section_id,
            {$artTitleCol} as title,
            {$artSummaryCol} as summary,
            a.image_bn,
            a.image_en,
            a.use_separate_images,
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

    $articlesBySection = [];
    foreach ($allArticles as $article) {
        if (!empty($article["title"])) {
            $article["category_title"] = $article["category_title"] ?? null;
            $articlesBySection[$article["section_id"]][] = $article;
        }
    }

    $sectionsData = [];
    foreach ($sections as $section) {
        $sectionId = $section["id"];

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
                
                // Determine which image to show
                $displayImage = $article["image_bn"];
                if ($article["use_separate_images"] && $lang === "en" && !empty($article["image_en"])) {
                    $displayImage = $article["image_en"];
                }

                $articleData = [
                    "id" => $article["id"],
                    "title" => $article["title"],
                    "summary" => $article["summary"],
                    "image" => $displayImage,
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
    require_once __DIR__ . '/../lib/session.php';

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

    $cache = new CacheManager();
    $cacheKey = $cache->generateKey([
        "get_data",
        $lang,
        $page,
        $limit,
        $categoryFilter,
        $includeDrafts,
    ]);

    $data = $cache->get($cacheKey);
    if (!$data) {
        $data = get_data($lang, $page, $limit, $categoryFilter, $includeDrafts);

        $cache->set($cacheKey, $data, 300);
    }

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
