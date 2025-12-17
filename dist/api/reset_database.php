<?php
require_once 'api_header.php';
require_once __DIR__ . '/../lib/CacheManager.php';

session_start();

// --- Authorization Check ---
// IMPORTANT: This is a destructive operation.
// In a real production environment, this endpoint should be removed or heavily secured.
if (!isset($_SESSION['user_role']) || $_SESSION['user_role'] !== 'admin') {
    send_response(['error' => 'Unauthorized. Admin access required.'], 403);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_response(['error' => 'Method not allowed. Use POST to reset the database.'], 405);
    exit();
}

try {
    // 1. Read the SQL file to reset the schema
    $sqlFilePath = __DIR__ . '/../database/database.sql';
    if (!file_exists($sqlFilePath)) {
        throw new Exception('Database schema file not found at ' . $sqlFilePath);
    }
    $sql = file_get_contents($sqlFilePath);

    // 2. Execute the SQL to drop and recreate tables
    $pdo->exec($sql);

    // 3. Run the seeder script
    $seedFilePath = __DIR__ . '/../database/seed.php';
    if (!file_exists($seedFilePath)) {
        throw new Exception('Database seed file not found at ' . $seedFilePath);
    }
    // The seed script uses the global $pdo object from db.php
    require $seedFilePath;

    // 4. Clear the cache
    $cache = new CacheManager();
    $cache->flush();

    send_response([
        'success' => true,
        'message' => 'Database has been successfully reset and seeded.'
    ], 200);

} catch (Exception $e) {
    send_response(['error' => 'Database reset failed: ' . $e->getMessage()], 500);
}
?>
