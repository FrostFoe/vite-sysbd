<?php
require_once "../../src/config/db.php";

header("Content-Type: application/json");
session_start();

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["email"]) || !isset($data["password"])) {
    echo json_encode(["success" => false, "message" => "Invalid input"]);
    exit(); // Exit after sending response
}

$email = $data["email"];
$password = $data["password"];

try {
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user["password"])) {
        $_SESSION["user_id"] = $user["id"];
        $_SESSION["user_email"] = $user["email"];
        $_SESSION["user_role"] = $user["role"];

        echo json_encode([
            "success" => true,
            "user" => [
                "email" => $user["email"],
                "role" => $user["role"],
            ],
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Invalid credentials",
        ]);
    }
} catch (PDOException $e) {
    // Log the error in a real application
    error_log("Login database error: " . $e->getMessage());
    echo json_encode(["success" => false, "message" => "Database error"]);
}
exit(); // Ensure script terminates after response
?>
