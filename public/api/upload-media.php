<?php
/**
 * Media Upload API Endpoint
 * Handles secure file uploads for images and videos
 * POST /api/upload-media.php
 */

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Set JSON response header
header('Content-Type: application/json');

// Handle CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(json_encode(['success' => true]));
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode([
        'success' => 0,
        'message' => 'Method not allowed'
    ]));
}

// Configuration
$config = [
    'max_file_size' => [
        'image' => 5 * 1024 * 1024,     // 5MB for images
        'video' => 100 * 1024 * 1024,   // 100MB for videos
    ],
    'allowed_types' => [
        'image' => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'video' => ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
    ],
    'upload_dirs' => [
        'image' => __DIR__ . '/../assets/uploads/images/',
        'video' => __DIR__ . '/../assets/uploads/videos/',
    ],
];

try {
    // Validate file upload
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        $uploadError = $_FILES['file']['error'] ?? 'Unknown error';
        throw new Exception("File upload error: " . $uploadError);
    }

    // Get upload type (image or video)
    $type = isset($_POST['type']) ? sanitizeInput($_POST['type']) : 'image';
    
    if (!in_array($type, ['image', 'video'])) {
        throw new Exception("Invalid upload type");
    }

    $file = $_FILES['file'];
    
    // Validate MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mimeType, $config['allowed_types'][$type])) {
        throw new Exception("Invalid file type: " . $mimeType);
    }

    // Validate file size
    if ($file['size'] > $config['max_file_size'][$type]) {
        $maxSize = $config['max_file_size'][$type] / (1024 * 1024);
        throw new Exception("File size exceeds maximum of {$maxSize}MB");
    }

    // Create upload directory if not exists
    $uploadDir = $config['upload_dirs'][$type];
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            throw new Exception("Failed to create upload directory");
        }
    }

    // Generate unique filename
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $ext = strtolower($ext);
    
    // Validate extension against MIME type
    $validExtensions = getValidExtensions($type);
    if (!in_array($ext, $validExtensions)) {
        throw new Exception("Invalid file extension: ." . $ext);
    }

    // Generate unique filename using UUID
    $uniqueName = generateUniqueFilename($ext);
    $uploadPath = $uploadDir . $uniqueName;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $uploadPath)) {
        throw new Exception("Failed to save file");
    }

    // Set proper permissions
    chmod($uploadPath, 0644);

    // Generate relative URL (better for portability)
    // Note: The directory is plural (images/videos) but the type is singular (image/video)
    // We need to map the type to the directory name for the URL
    $urlDir = ($type === 'image') ? 'images' : 'videos';
    $publicUrl = "/assets/uploads/" . $urlDir . "/" . $uniqueName;

    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => 1,
        'file' => [
            'url' => $publicUrl,
            'name' => $uniqueName,
            'type' => $mimeType,
            'size' => $file['size'],
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => 0,
        'message' => $e->getMessage()
    ]);
    error_log("Upload error: " . $e->getMessage());
}

/**
 * Generate a unique filename using UUID v4
 */
function generateUniqueFilename($ext) {
    $uuid = sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
    return $uuid . '.' . $ext;
}

/**
 * Get valid extensions for a file type
 */
function getValidExtensions($type) {
    $extensions = [
        'image' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        'video' => ['mp4', 'webm', 'ogv', 'mov', 'avi', 'mkv'],
    ];
    return $extensions[$type] ?? [];
}

/**
 * Sanitize input
 */
function sanitizeInput($input) {
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}
