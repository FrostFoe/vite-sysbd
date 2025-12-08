<?php
/**
 * Error Logging Endpoint
 * Stores client-side errors to backend logs
 */

require_once "../../src/config/db.php";

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["message"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "error" => "Invalid input"]);
    exit();
}

$timestamp = $data["timestamp"] ?? date("Y-m-d H:i:s");
$level = $data["level"] ?? "error";
$message = htmlspecialchars($data["message"]);
$data_json = json_encode($data["data"] ?? []);
$user_id = $_SESSION["user_id"] ?? null;
$endpoint = $_SERVER["HTTP_REFERER"] ?? null;

// Log to file
$log_file = __DIR__ . "/../../logs/errors.log";
$log_dir = dirname($log_file);

if (!is_dir($log_dir)) {
    mkdir($log_dir, 0755, true);
}

$log_entry = "[" . $timestamp . "] [" . strtoupper($level) . "] [User: " . ($user_id ?? "Anonymous") . "] " . $message . " - " . substr($data_json, 0, 200) . "\n";

file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);

// Also log to error_log
error_log($log_entry);

http_response_code(200);
echo json_encode(["success" => true]);
?>
