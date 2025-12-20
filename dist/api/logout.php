<?php
require_once __DIR__ . '/../lib/session.php';
session_destroy();
header("Content-Type: application/json");
echo json_encode(["success" => true]);
?>
