<?php
require_once __DIR__ . "/../config/db.php";

// Drop tables to reset
try {
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 0");
    $pdo->exec(
        "DROP TABLE IF EXISTS articles, categories, sections, comments, users",
    );
    $pdo->exec("SET FOREIGN_KEY_CHECKS = 1");
} catch (PDOException $e) {
    echo "Error dropping tables: " . $e->getMessage() . "\n";
}

// Run schema
$sql = file_get_contents(__DIR__ . "/database.sql");
if (!$sql) {
    die("Error reading database.sql");
}
try {
    $pdo->exec($sql);
    echo "Database schema imported.\n";
} catch (PDOException $e) {
    die("Error importing schema: " . $e->getMessage());
}

// Seed Users
$pass = password_hash("admin123", PASSWORD_BCRYPT);
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute(["admin@breachtimes.com"]);
if (!$stmt->fetch()) {
    $pdo->prepare(
        "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
    )->execute(["admin@breachtimes.com", $pass, "admin"]);
}

// Seed Categories
$cats = [
    ["news", "খবর", "News", "#b80000"],
    ["sport", "খেলা", "Sport", "#ffcc00"],
    ["tech", "প্রযুক্তি", "Technology", "#0066cc"],
];
$stmt = $pdo->prepare(
    "INSERT INTO categories (id, title_bn, title_en, color) VALUES (?, ?, ?, ?)",
);
foreach ($cats as $c) {
    $stmt->execute($c);
}

// Seed Sections
$sections = [
    ["hero", "প্রধান খবর", "Top Stories", "hero-grid", "#b80000", "news", 1],
    ["latest", "সর্বশেষ", "Latest", "list", "#333333", "news", 2],
];
$stmt = $pdo->prepare(
    "INSERT INTO sections (id, title_bn, title_en, type, highlight_color, associated_category, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
);
foreach ($sections as $s) {
    $stmt->execute($s);
}

// Seed Articles
$stmt = $pdo->prepare(
    "INSERT INTO articles 
    (id, section_id, category_id, title_bn, summary_bn, content_bn, read_time_bn, title_en, summary_en, content_en, read_time_en, image, published_at, status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 'published')",
);

$stmt->execute([
    uniqid("art_"),
    "hero",
    "tech",
    "সাইবার নিরাপত্তা হুমকি বাড়ছে",
    "হ্যাকাররা নতুন কৌশলে আক্রমণ করছে...",
    "<p>বিস্তারিত বংলায়...</p>",
    "৩ মিনিট",
    "Cyber Security Threats Rising",
    "Hackers are using new techniques...",
    "<p>Details in English...</p>",
    "3 min",
    "", // image
]);

echo "Seeding complete.\n";
?>
