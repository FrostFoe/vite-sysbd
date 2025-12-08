<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/check_auth.php";

// Check admin role
if (!isset($_SESSION["user_role"]) || $_SESSION["user_role"] !== "admin") {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized",
    ]);
    exit();
}

try {
    $data = json_decode(file_get_contents("php://input"), true);

    if (
        empty($data["id"]) ||
        empty($data["title_bn"]) ||
        empty($data["title_en"])
    ) {
        throw new Exception("Missing required fields");
    }

    $id = $data["id"];
    $title_bn = $data["title_bn"];
    $title_en = $data["title_en"];
    $color = $data["color"] ?? "#b80000";

    // Check if category exists
    $stmt = $pdo->prepare("SELECT id FROM categories WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch();

    if ($exists) {
        // Update
        $stmt = $pdo->prepare(
            "UPDATE categories SET title_bn = ?, title_en = ?, color = ? WHERE id = ?",
        );
        $stmt->execute([$title_bn, $title_en, $color, $id]);
    } else {
        // Insert
        $stmt = $pdo->prepare(
            "INSERT INTO categories (id, title_bn, title_en, color) VALUES (?, ?, ?, ?)",
        );
        $stmt->execute([$id, $title_bn, $title_en, $color]);
    }

    echo json_encode([
        "success" => true,
        "message" => $exists ? "Category updated" : "Category created",
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
}
?>
