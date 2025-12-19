<?php

// Load .env variables
if (file_exists(__DIR__ . '/../../.env')) {
    $env_lines = file(__DIR__ . '/../../.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($env_lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            // Remove surrounding quotes if present
            if (preg_match('/^"(.*)"$/', $value, $matches) || preg_match("/^'(.*)'$/", $value, $matches)) {
                $value = $matches[1];
            }
            putenv("$name=$value");
            $_ENV[$name] = $value;
        }
    }
}

$host = getenv('DB_HOST');
$db = getenv('DB_NAME');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');
$port = getenv('DB_PORT') ?: 3306;
$charset = "utf8mb4";
$gemini_api_key = getenv('GEMINI_API_KEY');

if (!$host || !$db || !$user) {
    // We cannot proceed without DB credentials. 
    // Since this is an API, we should probably return a 500 or log error.
    error_log("Database configuration missing in .env");
    // We won't exit here immediately to allow for better error handling in the try-catch block if needed,
    // but the connection will likely fail.
}

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
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