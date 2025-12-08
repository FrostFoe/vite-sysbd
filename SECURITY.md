# Authentication & Security Architecture - Complete Analysis

## 🔐 System Overview

Your application implements a **PHP Session-based Authentication** system with both backend and frontend security layers. Here's the complete breakdown:

---

## 📊 Architecture Diagram

```
Frontend (React/TypeScript)          Backend (PHP)           Database (MySQL)
├─ AuthContext (State)      ───────> Login.php           ──────> users table
├─ useAuth Hook             ───────> Register.php        ──────> Check credentials
├─ API Client               ───────> Check_Auth.php      ──────> Store sessions
└─ Interceptors             ───────> Logout.php          ──────> Manage passwords

Sessions: Browser Cookies ◄─────────── PHP $_SESSION
```

---

## 🔑 Authentication Flow

### 1. **LOGIN FLOW**
```
User Input (email/password)
           ↓
Frontend: AuthContext.login()
           ↓
HTTP POST → /api/login.php
           ↓
Backend: Validate email format + Password verify
           ↓
Create PHP Session $_SESSION variables
           ↓
Response: User object + Set-Cookie header
           ↓
Frontend: AuthContext stores user state
           ↓
Protected routes accessible
```

### 2. **REGISTRATION FLOW**
```
User Input (email/password)
           ↓
Frontend: AuthContext.register()
           ↓
HTTP POST → /api/register.php
           ↓
Backend: Validate email + Check duplicates + Hash password
           ↓
Insert user into database
           ↓
Create PHP Session
           ↓
Response: User object + Set-Cookie header
           ↓
Frontend: Auto-login (user redirected to dashboard)
```

### 3. **SESSION CHECK FLOW**
```
Page Load / App Initialization
           ↓
Frontend: useEffect() → checkAuth()
           ↓
HTTP GET → /api/check_auth.php
           ↓
Backend: Check $_SESSION["user_id"]
           ↓
Response: {authenticated: true/false, user: {...}}
           ↓
Frontend: Set auth state + Show/hide protected UI
```

### 4. **LOGOUT FLOW**
```
User clicks Logout
           ↓
Frontend: AuthContext.logout()
           ↓
HTTP GET → /api/logout.php
           ↓
Backend: session_destroy()
           ↓
Clear all session data + Cookie expires
           ↓
Frontend: Clear user state
           ↓
Redirect to login page
```

---

## 🛡️ Security Implementation Details

### A. PASSWORD SECURITY

#### **Hashing Algorithm**
```php
// register.php
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
```
- **Algorithm**: bcrypt (PHP's PASSWORD_DEFAULT)
- **Work Factor**: Automatically managed by PHP
- **Strength**: Industry-standard, resistant to GPU attacks
- **Salting**: Automatic per-password

#### **Verification**
```php
// login.php
if ($user && password_verify($password, $user["password"])) {
    // Password is correct
}
```
- **Timing Attack Resistant**: `password_verify()` uses constant-time comparison
- **No Plain Text Comparison**: Never compares raw passwords

#### **Validation Rules**
```php
// register.php
if (strlen($password) < 6) {
    echo "Password must be at least 6 characters";
}
```
- **Minimum Length**: 6 characters (could be stronger: 12+)
- **Frontend Validation**: Prevents unnecessary server requests

---

### B. EMAIL VALIDATION

#### **Format Validation**
```php
// login.php & register.php
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo "Invalid email format";
}
```
- **PHP Built-in Filter**: RFC 5322 compliant
- **Prevents**: Malformed email injections
- **Frontend Sanitization**: trim() removes whitespace

#### **Duplicate Prevention**
```php
// register.php
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
$stmt->execute([$email]);
if ($stmt->fetch()) {
    http_response_code(409);
    echo "User already exists";
}
```
- **Checks Before Insert**: Prevents duplicate accounts
- **HTTP 409**: Proper status code for conflict

---

### C. SQL INJECTION PREVENTION

#### **Parameterized Queries (Prepared Statements)**
```php
// ALL queries use prepared statements
$stmt = $pdo->prepare("SELECT id, email, password, role FROM users WHERE email = ?");
$stmt->execute([$email]);  // Parameter bound separately
```

#### **Protection Method**
```
Bad (Vulnerable):
  $query = "SELECT * FROM users WHERE email = '$email'";
  
Good (Secure):
  $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
  $stmt->execute([$email]);
  
Why: Database never interprets user input as SQL code
```

- **PDO Prepared Statements**: Separates SQL from data
- **ERRMODE_EXCEPTION**: Throws errors instead of failing silently
- **100% Protection**: Against SQL injection attacks

---

### D. SESSION MANAGEMENT

#### **Session Start & Storage**
```php
// All auth files
session_start();
```

#### **Session Variables Set**
```php
// login.php & register.php
$_SESSION["user_id"] = $user["id"];        // Unique identifier
$_SESSION["user_email"] = $user["email"];  // Email for display
$_SESSION["user_role"] = $user["role"];    // For authorization
```

#### **Session Storage Location**
```
Default PHP sessions stored in:
/var/lib/php/sessions/  (Linux)
or configured in php.ini
```

#### **Session Security Features**
```php
// Session cookie configuration (php.ini recommended):
session.cookie_httponly = On          // JS cannot access cookie
session.cookie_secure = On            // HTTPS only (production)
session.cookie_samesite = Strict      // CSRF protection
session.use_strict_mode = On          // Validate session IDs
session.use_only_cookies = On         // No URL-based sessions
```

---

### E. CROSS-SITE REQUEST FORGERY (CSRF)

#### **Current Protection**
```php
// Browser's SameSite attribute on session cookie
// Set in php.ini or by PHP 7.3+
session.cookie_samesite = Strict
```

#### **How It Works**
```
1. User logs in → browser receives session cookie
2. Browser automatically includes cookie in same-site requests
3. Different domain requests CANNOT include the cookie
4. Malicious site's requests are rejected
```

#### **Additional Considerations**
```php
// Could add explicit CSRF tokens for extra protection:
// 1. Generate token on login
// 2. Include in form data
// 3. Verify on form submission
// Current system relies on SameSite cookie attribute
```

---

### F. AUTHENTICATION STATE SECURITY

#### **Frontend Auth Context**
```typescript
// src/context/AuthContext.tsx
interface AuthContextType {
  user: User | null;                          // Stored in memory, not localStorage
  isAuthenticated: boolean;                   // Boolean state
  login: (email, password) => Promise<bool>;  // HTTP-only credentials
  logout: () => Promise<void>;
}
```

#### **Why Memory Storage (NOT localStorage)?**
```
❌ DON'T: localStorage.setItem('user', JSON.stringify(user))
   - Vulnerable to XSS (JavaScript can read it)
   - Persists after logout
   - Accessible to any JS on the page

✅ DO: Store in React state (memory only)
   - Lost on page refresh (verify via check_auth.php)
   - Protected from XSS
   - Cleared on logout
```

#### **Session Verification**
```typescript
// AuthContext.useEffect()
useEffect(() => {
  checkAuth();  // Calls /api/check_auth.php on mount
}, [checkAuth]);

// Each page load verifies session from backend
// If session expired, user is logged out
```

---

### G. SECURE HTTP COMMUNICATION

#### **Credentials in Requests**
```typescript
// src/lib/api.ts
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  // ← CRITICAL for session cookies
});
```

#### **What This Means**
```
1. withCredentials: true
   - Browser includes session cookie in all API requests
   - Works across origins (if CORS enabled)
   - Proves the request is from authenticated user

2. Without this flag:
   - Session cookie NOT sent
   - Backend sees user as unauthenticated
   - All requests fail
```

#### **Cookie Security**
```http
Set-Cookie: PHPSESSID=abc123...
   HttpOnly    → JS cannot access (XSS protection)
   Secure      → HTTPS only (production)
   SameSite    → Strict (CSRF protection)
```

---

### H. INPUT SANITIZATION & OUTPUT ENCODING

#### **HTML Sanitization** (security.php)
```php
function sanitize_html($html) {
    // 1. Load HTML safely
    $dom = new DOMDocument();
    libxml_use_internal_errors(true);
    $dom->loadHTML(mb_convert_encoding($html, "HTML-ENTITIES", "UTF-8"));
    
    // 2. Define allowed tags
    $allowed_tags = [
        "p", "b", "strong", "i", "em", "u",
        "a", "ul", "ol", "li", "h1-h6",
        "br", "img", "blockquote", "span", "div"
    ];
    
    // 3. Define allowed attributes
    $allowed_attrs = ["href", "src", "alt", "title", "class", "target"];
    
    // 4. Remove dangerous tags (script, style, iframe, embed, etc.)
    // 5. Clean attributes (remove onclick, onload, etc.)
    // 6. Remove javascript: and vbscript: protocols
    
    return $sanitized_html;
}
```

#### **Dangerous Tags Removed**
```php
"script", "style", "iframe", "object", "embed", 
"applet", "meta", "link"
// These are completely removed, not just sanitized
```

#### **Protocol Checking**
```php
// Remove href/src with dangerous protocols
if (preg_match("/^(javascript|vbscript|data):/i", $value)) {
    $node->removeAttribute($attr);  // Remove the attribute entirely
}

// Prevents: <a href="javascript:alert('xss')">Click</a>
// Prevents: <img src="data:text/html,...">
```

#### **Usage in Code**
```php
// When storing user-generated HTML (from editor)
$clean_html = sanitize_html($_POST['content']);
$stmt->prepare("UPDATE articles SET content = ?")->execute([$clean_html]);
```

---

### I. ERROR HANDLING & LOGGING

#### **Error Response Format**
```php
// Always return structured JSON
http_response_code(401);  // Proper HTTP status
echo json_encode([
    "success" => false,
    "message" => "Invalid email or password"
]);
```

#### **Error Messages**
```php
// ✅ GOOD: Generic message to user
"Invalid email or password"  // Doesn't reveal if email exists

// ❌ BAD: Specific message
"Email not found in database"  // Leaks user enumeration info
"Password hash mismatch"        // Gives away security details
```

#### **Error Logging**
```php
error_log("Login error: " . $e->getMessage());
// Logs to server error log, NOT returned to client
// Users see generic message, admins see details
```

#### **No Debug Output**
```php
error_reporting(E_ALL);
ini_set('display_errors', '0');  // ← Don't show errors to users
// Errors logged to file only
```

---

### J. ROLE-BASED ACCESS CONTROL (RBAC)

#### **Role Storage**
```php
// Set during login/registration
$_SESSION["user_role"] = $user["role"];  // "admin" or "user"

// Inserted into database during registration
$stmt = $pdo->prepare("INSERT INTO users (email, password, role) VALUES (?, ?, 'user')");
// Default role: 'user'
```

#### **Role Usage**
```typescript
// Frontend - show/hide admin features
if (user?.role === "admin") {
  <AdminDashboard />
} else {
  <UserDashboard />
}
```

#### **Authorization Checks**
```php
// Backend - verify role before allowing action
session_start();
if ($_SESSION["user_role"] !== "admin") {
    http_response_code(403);  // Forbidden
    exit;
}
// Execute admin operation
```

---

## 🚨 Security Issues & Recommendations

### Current Strengths ✅
1. **Password Hashing**: bcrypt with automatic salting
2. **SQL Injection**: 100% protected with prepared statements
3. **Session Security**: HttpOnly, SameSite cookies
4. **Input Validation**: Email format, password length
5. **HTML Sanitization**: Removes dangerous tags/attributes
6. **Error Handling**: Generic messages, server-side logging

### Areas for Improvement ⚠️

#### **1. Password Requirements**
```php
// Current: 6 characters minimum
// Better: 12+ characters with complexity

// Add to register.php:
function validate_password_strength($password) {
    if (strlen($password) < 12) return false;
    if (!preg_match('/[A-Z]/', $password)) return false;  // Uppercase
    if (!preg_match('/[a-z]/', $password)) return false;  // Lowercase
    if (!preg_match('/[0-9]/', $password)) return false;  // Number
    if (!preg_match('/[^A-Za-z0-9]/', $password)) return false;  // Special char
    return true;
}
```

#### **2. Rate Limiting**
```php
// Add to login.php & register.php:
// Track failed attempts per IP
// Lock account after 5 failed attempts
// Implement exponential backoff

$redis->incr("failed_attempts:$ip");
if ($redis->get("failed_attempts:$ip") > 5) {
    http_response_code(429);  // Too Many Requests
    exit;
}
```

#### **3. Email Verification**
```php
// After registration:
// 1. Generate verification token
// 2. Send email with token link
// 3. Mark email as verified only after token click
// 4. Disable account until verified

$token = bin2hex(random_bytes(32));
// Store in database with expiration
```

#### **4. Two-Factor Authentication (2FA)**
```php
// Optional but recommended:
// After password verification, require second factor
// - TOTP (Google Authenticator)
// - SMS verification
// - Email confirmation
```

#### **5. HTTPS Enforcement**
```php
// Add to all auth endpoints:
if (empty($_SERVER['HTTPS']) || $_SERVER['HTTPS'] === 'off') {
    http_response_code(400);
    die('HTTPS required');
}
```

#### **6. CSRF Token System**
```php
// More explicit than relying solely on SameSite:
session_start();
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// Return token to frontend
// Require token in POST requests
// Verify on backend before processing
```

#### **7. Account Lockout**
```php
// After N failed login attempts:
$stmt = $pdo->prepare("
    UPDATE users SET locked_until = DATE_ADD(NOW(), INTERVAL 15 MINUTE)
    WHERE email = ?
");

// Check on login:
if ($user['locked_until'] > now) {
    http_response_code(429);
    echo "Account temporarily locked";
}
```

#### **8. Session Timeout**
```php
// Add session expiration:
if (isset($_SESSION['last_activity']) && 
    time() - $_SESSION['last_activity'] > 3600) {  // 1 hour
    session_destroy();
    http_response_code(401);
}
$_SESSION['last_activity'] = time();
```

#### **9. Secure Headers**
```php
// Add to all responses:
header('X-Frame-Options: DENY');                    // Clickjacking
header('X-Content-Type-Options: nosniff');          // MIME sniffing
header('X-XSS-Protection: 1; mode=block');          // XSS
header('Strict-Transport-Security: max-age=31536000');  // HSTS
header('Content-Security-Policy: default-src \'self\'');
```

#### **10. Logging & Monitoring**
```php
// Log all auth events:
$log = [
    'timestamp' => date('Y-m-d H:i:s'),
    'event' => 'login_attempt',
    'email' => $email,
    'ip' => $_SERVER['REMOTE_ADDR'],
    'user_agent' => $_SERVER['HTTP_USER_AGENT'],
    'success' => $success,
];
file_put_contents('auth.log', json_encode($log) . "\n", FILE_APPEND);
```

---

## 🔒 Attack Vectors & Mitigations

| Attack Type | Current Protection | Risk Level | Mitigation |
|------------|-------------------|-----------|-----------|
| **SQL Injection** | Prepared statements | ✅ LOW | None needed, already protected |
| **XSS (JavaScript)** | Memory-only state | ✅ LOW | None needed, not using localStorage |
| **XSS (HTML)** | sanitize_html() | ✅ LOW | Apply sanitization to all user content |
| **CSRF** | SameSite cookies | ⚠️ MEDIUM | Add explicit CSRF tokens |
| **Brute Force** | None | ⚠️ MEDIUM | Implement rate limiting |
| **Session Hijacking** | HttpOnly, Secure | ✅ LOW | Ensure HTTPS in production |
| **Password Weakness** | Min 6 chars | ⚠️ MEDIUM | Enforce complexity rules |
| **Account Enumeration** | Generic messages | ✅ LOW | None needed, already protected |
| **Session Fixation** | PHP default handling | ✅ LOW | Regenerate session ID on login |
| **Timing Attacks** | password_verify() | ✅ LOW | None needed, already protected |

---

## 📋 Deployment Security Checklist

### Before Going to Production

- [ ] **HTTPS Enabled**: All traffic encrypted
- [ ] **php.ini Configuration**:
  - [ ] `session.cookie_httponly = On`
  - [ ] `session.cookie_secure = On`
  - [ ] `session.cookie_samesite = Strict`
  - [ ] `display_errors = Off`
  - [ ] `expose_php = Off`

- [ ] **Database**:
  - [ ] User doesn't have DROP privileges
  - [ ] Regular backups scheduled
  - [ ] Strong database password

- [ ] **File Permissions**:
  - [ ] Database config file not web-accessible (644)
  - [ ] Uploaded files not executable (644)
  - [ ] Sessions directory secure (700)

- [ ] **Security Headers** in .htaccess or nginx config:
  - [ ] X-Frame-Options: DENY
  - [ ] X-Content-Type-Options: nosniff
  - [ ] Strict-Transport-Security
  - [ ] Content-Security-Policy

- [ ] **Monitoring**:
  - [ ] Auth logs enabled
  - [ ] Failed login tracking
  - [ ] Email notifications for suspicious activity

- [ ] **Environment Variables**:
  - [ ] Database credentials in .env (not in git)
  - [ ] API keys secure
  - [ ] Debug mode OFF

---

## 🎓 Code Examples

### Example: Secure Login
```php
<?php
require_once __DIR__ . "/../config/db.php";
require_once __DIR__ . "/../lib/security.php";

header("Content-Type: application/json");
session_start();

// Enforce HTTPS in production
if (ENVIRONMENT === 'production' && empty($_SERVER['HTTPS'])) {
    http_response_code(400);
    exit(json_encode(['error' => 'HTTPS required']));
}

// Get and validate input
$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data["email"]) || !isset($data["password"])) {
    http_response_code(400);
    exit(json_encode(["success" => false, "message" => "Email and password required"]));
}

$email = trim($data["email"]);  // Whitespace removal
$password = $data["password"];

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    exit(json_encode(["success" => false, "message" => "Invalid email format"]));
}

try {
    // Use prepared statement (prevents SQL injection)
    $stmt = $pdo->prepare("SELECT id, email, password, role FROM users WHERE email = ?");
    $stmt->execute([$email]);  // Parameter binding
    $user = $stmt->fetch();

    // Verify password with timing-safe comparison
    if ($user && password_verify($password, $user["password"])) {
        // Regenerate session ID to prevent fixation
        session_regenerate_id(true);
        
        // Store minimal data in session
        $_SESSION["user_id"] = $user["id"];
        $_SESSION["user_email"] = $user["email"];
        $_SESSION["user_role"] = $user["role"];
        $_SESSION["login_time"] = time();
        
        // Log successful attempt
        error_log("Successful login: {$email} from {$_SERVER['REMOTE_ADDR']}");
        
        http_response_code(200);
        echo json_encode([
            "success" => true,
            "user" => [
                "id" => $user["id"],
                "email" => $user["email"],
                "role" => $user["role"],
            ],
        ]);
    } else {
        // Generic message (don't reveal if email exists)
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid email or password"]);
        
        // Log failed attempt
        error_log("Failed login attempt: {$email} from {$_SERVER['REMOTE_ADDR']}");
    }
} catch (PDOException $e) {
    // Log error but don't expose details to user
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Login failed"]);
}
?>
```

---

## 📚 Security Resources

- **OWASP Top 10**: https://owasp.org/Top10/
- **PHP Security Manual**: https://www.php.net/manual/en/security.php
- **Password Hashing**: https://www.php.net/manual/en/faq.passwords.php
- **Session Security**: https://www.php.net/manual/en/session.security.php
- **HTML Sanitization**: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

---

*Last Updated: December 8, 2025*
*Security Review: Comprehensive Authentication & Authorization Analysis*
