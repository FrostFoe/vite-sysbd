<?php
/**
 * Application Constants
 * Centralized configuration for magic numbers and settings
 */

// File Upload Settings
define('MAX_FILE_SIZE', 2 * 1024 * 1024); // 2MB
define('ALLOWED_FILE_TYPES', ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif']);
define('UPLOAD_DIR', __DIR__ . '/../../uploads/');

// Pagination Settings
define('DEFAULT_PAGE_SIZE', 20);
define('MAX_PAGE_SIZE', 100);

// Password Policy
define('MIN_PASSWORD_LENGTH', 8);
define('REQUIRE_UPPERCASE', true);
define('REQUIRE_LOWERCASE', true);
define('REQUIRE_NUMBERS', true);
define('REQUIRE_SPECIAL_CHARS', true);

// Rate Limiting
define('LOGIN_MAX_ATTEMPTS', 5);
define('LOGIN_LOCKOUT_DURATION', 900); // 15 minutes in seconds
define('REGISTER_RATE_LIMIT', 10); // Per hour

// Security Headers
define('SESSION_TIMEOUT', 3600); // 1 hour
define('SESSION_COOKIE_SECURE', true);
define('SESSION_COOKIE_HTTPONLY', true);
define('SESSION_COOKIE_SAMESITE', 'Strict');

// Database
define('DB_CHARSET', 'utf8mb4');
define('DB_MAX_RETRIES', 30);
define('DB_RETRY_DELAY', 1); // seconds
?>
