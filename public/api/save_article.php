<?php
require_once "api_header.php";

// Helper function to calculate read time (simple example)
function calculate_read_time_from_text($text, $lang = "en")
{
    $word_count = str_word_count(strip_tags($text));
    $words_per_minute = 200; // Average reading speed
    $minutes = ceil($word_count / $words_per_minute);
    $minutes = max(1, $minutes); // Ensure at least 1 minute

    if ($lang === "bn") {
        // Bengali translation for minutes
        $bengali_digits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
        $minute_str = " মিনিট"; // Using plural form for consistency
        // Convert minutes to Bengali digits
        $tens = floor($minutes / 10);
        $ones = $minutes % 10;
        return ($tens > 0 ? $bengali_digits[$tens] : "") .
            $bengali_digits[$ones] .
            $minute_str;
    } else {
        return $minutes . " min";
    }
}

// Start session for authentication checks
session_start();

// --- Authorization Check ---
if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
    send_response(["error" => "Unauthorized"], 403);
    exit(); // Stop execution if unauthorized
}
// --- End Authorization Check ---

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    send_response(["error" => "Method not allowed"], 405);
    exit();
}

$id = !empty($_POST["id"]) ? $_POST["id"] : uniqid();

// Unified Fields
$title_bn = $_POST["title_bn"] ?? "";
$title_en = $_POST["title_en"] ?? "";
$summary_bn = $_POST["summary_bn"] ?? "";
$summary_en = $_POST["summary_en"] ?? "";
$content_bn = $_POST["content_bn"] ?? "";
$content_en = $_POST["content_en"] ?? "";

// SEO Fields
$meta_title = isset($_POST["meta_title"]) ? substr(trim(strip_tags($_POST["meta_title"])), 0, 255) : null;
$meta_description = isset($_POST["meta_description"]) ? trim(strip_tags($_POST["meta_description"])) : null;
$meta_keywords = isset($_POST["meta_keywords"]) ? substr(trim(strip_tags($_POST["meta_keywords"])), 0, 255) : null;

// Common Fields
$category_id = $_POST["category_id"] ?? "";
$section_id = $_POST["sectionId"] ?? "news";
$image = $_POST["image"] ?? "";
$leaked_documents = $_POST["leaked_documents"] ?? null;
$status = $_POST["status"] ?? "draft"; // Default to draft
$allow_submissions = isset($_POST["allow_submissions"]) ? 1 : 0;

// Dynamically calculate read_time
$read_time_bn = calculate_read_time_from_text($content_bn, "bn");
$read_time_en = calculate_read_time_from_text($content_en, "en");

$stmt = $pdo->prepare("SELECT id FROM articles WHERE id = ?");
$stmt->execute([$id]);
$exists = $stmt->fetch();

if ($exists) {
    // Update article
    $stmt = $pdo->prepare(
        "UPDATE articles SET 
            title_bn=?, title_en=?, 
            summary_bn=?, summary_en=?, 
            content_bn=?, content_en=?, 
            read_time_bn=?, read_time_en=?,
            meta_title=?, meta_description=?, meta_keywords=?,
            category_id=?, section_id=?, 
            image=?, leaked_documents=?, status=?, allow_submissions=?
        WHERE id=?",
    );
    $stmt->execute([
        $title_bn,
        $title_en,
        $summary_bn,
        $summary_en,
        $content_bn,
        $content_en,
        $read_time_bn,
        $read_time_en,
        $meta_title,
        $meta_description,
        $meta_keywords,
        $category_id,
        $section_id,
        $image,
        $leaked_documents,
        $status,
        $allow_submissions,
        $id,
    ]);
} else {
    // Create new article
    $stmt = $pdo->prepare(
        "INSERT INTO articles (
            id, 
            title_bn, title_en, 
            summary_bn, summary_en, 
            content_bn, content_en, 
            read_time_bn, read_time_en,
            meta_title, meta_description, meta_keywords,
            category_id, section_id, 
            image, leaked_documents, status, allow_submissions, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
    );
    $stmt->execute([
        $id,
        $title_bn,
        $title_en,
        $summary_bn,
        $summary_en,
        $content_bn,
        $content_en,
        $read_time_bn,
        $read_time_en,
        $meta_title,
        $meta_description,
        $meta_keywords,
        $category_id,
        $section_id,
        $image,
        $leaked_documents,
        $status,
        $allow_submissions,
    ]);
}

send_response(["success" => true, "id" => $id]);
?>
