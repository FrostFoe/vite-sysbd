<?php
require_once '../config/db.php';
require_once '../lib/security.php';

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get JSON input
$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['email'], $data['password'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Email এবং পাসওয়ার্ড প্রয়োজন']);
    exit();
}

$email = trim($data['email']);
$password = trim($data['password']);
$role = isset($data['role']) ? trim($data['role']) : 'user';

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'বৈধ ইমেল প্রবেশ করুন']);
    exit();
}

// Validate password
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'পাসওয়ার্ড কমপক্ষে 6 অক্ষর হওয়া উচিত']);
    exit();
}

// Validate role
if (!in_array($role, ['admin', 'user'])) {
    $role = 'user';
}

try {
    // Check if user already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'এই ইমেল ইতিমধ্যে নিবন্ধিত']);
        exit();
    }

    // Hash password
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Insert new user
    $stmt = $pdo->prepare('
        INSERT INTO users (email, password, role, created_at)
        VALUES (?, ?, ?, NOW())
    ');
    $stmt->execute([$email, $hashedPassword, $role]);

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $pdo->lastInsertId(),
            'email' => $email,
            'role' => $role,
        ],
    ]);
} catch (Exception $e) {
    error_log('Create user error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'সার্ভার ত্রুটি']);
}
