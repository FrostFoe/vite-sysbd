<?php
if (session_status() === PHP_SESSION_NONE) {
    // 30 days lifetime
    $lifetime = 30 * 24 * 60 * 60; 
    
    // Set garbage collection max lifetime
    ini_set('session.gc_maxlifetime', $lifetime);
    
    // Set cookie parameters
    session_set_cookie_params([
        'lifetime' => $lifetime,
        'path' => '/',
        'domain' => '', // Current domain
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on', // Only secure if HTTPS is on
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    
    session_start();
}
?>
