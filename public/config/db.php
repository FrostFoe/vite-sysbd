<?php

$host = "127.0.0.1";
$db = "breachtimes";
$user = "sysbdadm";
$pass = "lzx26NGPR58";
$charset = "utf8mb4";

// Load GEMINI_API_KEY from .env if it exists
if (file_exists(__DIR__ . '/../../.env')) {
    $env_lines = file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($env_lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            if (trim($name) === 'GEMINI_API_KEY') {
                $gemini_api_key = trim($value);
                break;
            }
        }
    }
}

// Fallback to hardcoded key if not in .env
if (!isset($gemini_api_key)) {
    $gemini_api_key = "AIzaSyD-wmqmiXKltxHabN0t6SVzdxub0Itj1F0";
}

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
