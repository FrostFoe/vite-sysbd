<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/functions.php";
require_once __DIR__ . "/../lib/constants.php";
require_once __DIR__ . "/../lib/security.php";
require_once __DIR__ . "/../lib/pagination.php";

// Set security headers
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("Referrer-Policy: strict-origin-when-cross-origin");
header(
    "Access-Control-Allow-Origin: " .
        (isset($_SERVER["HTTP_ORIGIN"]) ? $_SERVER["HTTP_ORIGIN"] : "*"),
);
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Max-Age: 86400");

// Handle CORS preflight
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

function send_response($data, $code = 200)
{
    http_response_code($code);
    echo json_encode($data);
    exit();
}
?>
