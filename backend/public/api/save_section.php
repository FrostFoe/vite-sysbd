<?php
header("Content-Type: application/json");
require_once __DIR__ . "/../../src/config/db.php";
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

    if (empty($data["id"]) || empty($data["type"])) {
        throw new Exception("Missing required fields: id and type");
    }

    $id = $data["id"];
    $title_bn = $data["title_bn"] ?? "";
    $title_en = $data["title_en"] ?? "";
    $type = $data["type"];
    $highlight_color = $data["highlight_color"] ?? null;
    $associated_category = $data["associated_category"] ?? null;
    $style = $data["style"] ?? null;
    $sort_order = $data["sort_order"] ?? 0;

    // Check if section exists
    $stmt = $pdo->prepare("SELECT id FROM sections WHERE id = ?");
    $stmt->execute([$id]);
    $exists = $stmt->fetch();

    if ($exists) {
        // Update
        $stmt = $pdo->prepare(
            "UPDATE sections SET title_bn = ?, title_en = ?, type = ?, highlight_color = ?, associated_category = ?, style = ?, sort_order = ? WHERE id = ?",
        );
        $stmt->execute([
            $title_bn,
            $title_en,
            $type,
            $highlight_color,
            $associated_category,
            $style,
            $sort_order,
            $id,
        ]);
        $message = "সেকশন আপডেট হয়েছে";
    } else {
        // Insert
        $stmt = $pdo->prepare(
            "INSERT INTO sections (id, title_bn, title_en, type, highlight_color, associated_category, style, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        );
        $stmt->execute([
            $id,
            $title_bn,
            $title_en,
            $type,
            $highlight_color,
            $associated_category,
            $style,
            $sort_order,
        ]);
        $message = "সেকশন তৈরি হয়েছে";
    }

    echo json_encode([
        "success" => true,
        "message" => $message,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage(),
    ]);
}
?>
