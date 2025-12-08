<?php
$host = "127.0.0.1";
$db = "breachtimes";
$user = "root";
$pass = "rootpass";
$charset = "utf8mb4";

$dsn = "mysql:host=$host;port=3306;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Connection failed. Could be server down or DB missing.
    $max_retries = 30;
    $server_connected = false;
    $pdo = null;

    // 1. Wait for MySQL server to be available
    for ($i = 0; $i < $max_retries; $i++) {
        try {
            // Connect without selecting database
            $pdo = new PDO(
                "mysql:host=$host;charset=$charset",
                $user,
                $pass,
                $options,
            );
            $server_connected = true;
            break;
        } catch (\PDOException $e2) {
            error_log(
                "Waiting for MySQL... (Attempt " . ($i + 1) . "/$max_retries)",
            );
            sleep(1);
        }
    }

    if (!$server_connected) {
        throw new \PDOException(
            "Failed to connect to MySQL server after $max_retries attempts: " .
                $e->getMessage(),
        );
    }

    // 2. Try to select the database
    try {
        $pdo->exec("USE `$db`");
    } catch (\PDOException $e3) {
        // Database likely doesn't exist, create it and import schema
        try {
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db`");
            $pdo->exec("USE `$db`");

            $sqlPath = __DIR__ . "/../database/database.sql";
            if (file_exists($sqlPath)) {
                $schema = file_get_contents($sqlPath);
                $pdo->exec($schema);
                error_log("Database `$db` created and schema imported.");
            } else {
                error_log("Warning: Schema file not found at $sqlPath");
            }
        } catch (\PDOException $e4) {
            throw new \PDOException(
                "Failed to create database/schema: " . $e4->getMessage(),
                (int) $e4->getCode(),
            );
        }
    }
}
?>
