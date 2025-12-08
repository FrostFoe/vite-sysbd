<?php
require_once "../../src/config/db.php";
require_once "../../src/lib/constants.php";
require_once "../../src/lib/security.php";

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

    // Generate email verification token
    $verification_token = bin2hex(random_bytes(32));
    $token_expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare(
        "INSERT INTO users (email, password, role, email_verified, verification_token, token_expiry) 
         VALUES (?, ?, 'user', 0, ?, ?)"
    );
    $stmt->execute([$email, $hashedPassword, $verification_token, $token_expiry]);

    $userId = $pdo->lastInsertId();

    // Send verification email
    sendVerificationEmail($email, $verification_token);

    // Set session
    $_SESSION["user_id"] = $userId;
    $_SESSION["user_email"] = $email;
    $_SESSION["user_role"] = "user";
    
    // Regenerate session ID for security
    secureSessionRegenerate();

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Registration successful. Please verify your email.",
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

