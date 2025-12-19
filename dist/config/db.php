<?php

$host = "127.0.0.1";
$db = "breachtimes";
$user = "sysbdadm";
$pass = "lzx26NGPR58";
$charset = "utf8mb4";

$gemini_api_key = "AIzaSyAk9areQ7h53Y7YypZrxyhfeO0T2Tz1kJg";

$dsn = "mysql:host=$host;port=3306;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    http_response_code(500);
    error_log("Database connection failed: " . $e->getMessage());

    exit("A database error occurred. Please try again later.");
}
?>
