<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/constants.php";
require_once __DIR__ . "/../lib/security.php";

header("Content-Type: application/json");
session_start();

// Set security headers
setSecurityHeaders();

// Enforce HTTPS in production
// enforceHttps();

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["email"]) || !isset($data["password"])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit();
}

$email = validateAndSanitize($data["email"], 'email');
$password = $data["password"];

if (!$email) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit();
}

// Validate password strength
$password_validation = validatePasswordStrength($password);
if (!$password_validation['valid']) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Password requirements: " . implode(", ", $password_validation['errors'])
    ]);
    exit();
}

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode([
            "success" => false,
            "message" => "User already exists"
        ]);
        exit();
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare(
        "INSERT INTO users (email, password, role) 
         VALUES (?, ?, 'user')"
    );
    $stmt->execute([$email, $hashedPassword]);

    $userId = $pdo->lastInsertId();

    // Set session
    $_SESSION["user_id"] = $userId;
    $_SESSION["user_email"] = $email;
    $_SESSION["user_role"] = "user";
    
    // Regenerate session ID for security
    secureSessionRegenerate();

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Registration successful.",
        "user" => [
            "email" => $email,
            "role" => "user",
        ],
    ]);
} catch (PDOException $e) {
    error_log("Registration database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "An error occurred. Please try again later."
    ]);
}
?>

