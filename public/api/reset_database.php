<?php
require_once "api_header.php";
require_once __DIR__ . "/../lib/CacheManager.php";

if (php_sapi_name() !== "cli") {
    require_once __DIR__ . '/../lib/session.php';

    if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
        send_response(["error" => "Unauthorized. Admin access required."], 403);
        exit();
    }

    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        send_response(
            ["error" => "Method not allowed. Use POST to reset the database."],
            405,
        );
        exit();
    }
}

try {
    $tables = [
        "muted_users",
        "comment_votes",
        "comments",
        "documents",
        "article_submissions",
        "articles",
        "sections",
        "categories",
        "users",
    ];
    $dropTablesSql = "DROP TABLE IF EXISTS " . implode(", ", $tables) . ";";

    $sqlFilePath = __DIR__ . "/../database/database.sql";
    if (!file_exists($sqlFilePath)) {
        throw new Exception(
            "Database schema file not found at " . $sqlFilePath,
        );
    }
    $schemaSql = file_get_contents($sqlFilePath);

    $fullResetSql = "
        SET FOREIGN_KEY_CHECKS=0;
        {$dropTablesSql}
        SET FOREIGN_KEY_CHECKS=1;
        {$schemaSql}
    ";
    $pdo->exec($fullResetSql);

    $seedFilePath = __DIR__ . "/../database/seed.php";
    if (!file_exists($seedFilePath)) {
        throw new Exception("Database seed file not found at " . $seedFilePath);
    }
    require $seedFilePath;

    $cache = new CacheManager();
    $cache->flush();

    if (php_sapi_name() === "cli") {
        echo "Database has been successfully reset and seeded.\n";
    } else {
        send_response(
            [
                "success" => true,
                "message" => "Database has been successfully reset and seeded.",
            ],
            200,
        );
    }
} catch (Exception $e) {
    if (php_sapi_name() === "cli") {
        echo "Error: Database reset failed: " . $e->getMessage() . "\n";
    } else {
        send_response(
            ["error" => "Database reset failed: " . $e->getMessage()],
            500,
        );
    }
}
?>
