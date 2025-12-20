<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/security.php";

header("Content-Type: application/json");
require_once __DIR__ . '/../lib/session.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["email"]) || !isset($data["password"])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Email and password required",
    ]);
    exit();
}

$email = trim($data["email"]);
$password = $data["password"];

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit();
}

try {
    $stmt = $pdo->prepare(
        "SELECT id, email, password, role FROM users WHERE email = ?",
    );
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user["password"])) {
        session_regenerate_id(true);
        $_SESSION["user_id"] = $user["id"];
        $_SESSION["user_email"] = $user["email"];
        $_SESSION["user_role"] = $user["role"];

        echo json_encode([
            "success" => true,
            "user" => [
                "id" => $user["id"],
                "email" => $user["email"],
                "role" => $user["role"],
            ],
        ]);
    } else {
        usleep(500000); // Delay execution by 0.5 seconds to slow down brute-force attacks
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Invalid email or password",
        ]);
    }
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Login failed"]);
}
?>
