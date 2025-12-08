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

// Check rate limiting
$rate_check = checkLoginRateLimit($email, $pdo);
if (!$rate_check['allowed']) {
    http_response_code(429);
    echo json_encode([
        "success" => false,
        "message" => $rate_check['message']
    ]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user["password"])) {
        // Check if email is verified
        if (!$user['email_verified']) {
            http_response_code(403);
            echo json_encode([
                "success" => false,
                "message" => "Please verify your email before logging in"
            ]);
            exit();
        }

        // Clear login attempts on successful login
        clearLoginAttempts($email);

        // Set session
        $_SESSION["user_id"] = $user["id"];
        $_SESSION["user_email"] = $user["email"];
        $_SESSION["user_role"] = $user["role"];
        $_SESSION["login_time"] = time();
        
        // Regenerate session ID for security
        secureSessionRegenerate();

        echo json_encode([
            "success" => true,
            "user" => [
                "id" => $user["id"],
                "email" => $user["email"],
                "role" => $user["role"],
            ],
        ]);
    } else {
        // Record failed login attempt
        recordFailedLoginAttempt($email);
        
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid credentials"
        ]);
    }
} catch (PDOException $e) {
    error_log("Login database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error"]);
}
exit();
?>
