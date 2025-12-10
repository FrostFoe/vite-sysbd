<?php
// ----------------------------------------------------------------
//  DATABASE CONFIGURATION
// ----------------------------------------------------------------
//  Please update the following details with your cPanel
//  MySQL database credentials.
// ----------------------------------------------------------------

$host = "127.0.0.1"; // e.g., "localhost"
$db = "breachtimes";
$user = "root";
$pass = "rootpass";
$charset = "utf8mb4";

// ----------------------------------------------------------------
//  DO NOT EDIT BELOW THIS LINE
// ----------------------------------------------------------------

$dsn = "mysql:host=$host;port=3306;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // In a production environment, it's better to log this error and
    // show a generic error page rather than exposing connection details.
    http_response_code(500);
    error_log("Database connection failed: " . $e->getMessage());
    // You can include a file that renders a user-friendly error page.
    // include 'error_500.php';
    exit('A database error occurred. Please try again later.');
}
?>
