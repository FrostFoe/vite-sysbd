# Authentication & Security - Quick Reference

## 🏗️ System Components

### Backend (PHP)
| File | Purpose | Security Features |
|------|---------|------------------|
| **login.php** | User authentication | Bcrypt verification, SQL injection protection, generic error messages |
| **register.php** | Account creation | Password hashing, duplicate check, parameterized queries |
| **check_auth.php** | Session verification | Checks $_SESSION, returns auth status |
| **logout.php** | Session destruction | Clears all session data |
| **security.php** | HTML sanitization | XSS protection, tag/attribute filtering |

### Frontend (React/TypeScript)
| File | Purpose | Security Features |
|------|---------|------------------|
| **AuthContext.tsx** | Auth state management | Memory-only storage, session verification on mount |
| **api.ts** | API configuration | withCredentials for cookies, structured requests |
| **apiInterceptors.ts** | Request/response handling | Error code handling (401, 403, 429) |

### Database
| Table | Columns | Security |
|-------|---------|----------|
| **users** | id, email, password, role, created_at | Bcrypt-hashed passwords |

---

## 🔐 Security Layers

### Layer 1: Input Validation
```
Email:    filter_var(FILTER_VALIDATE_EMAIL)
Password: strlen() >= 6 (minimum)
Types:    Type hints in TypeScript
```

### Layer 2: Password Security
```
Hashing:      password_hash(..., PASSWORD_DEFAULT)
Verification: password_verify(...) [timing-safe]
Algorithm:    bcrypt (salted, slow)
```

### Layer 3: Database Protection
```
SQL Injection: Prepared statements ($pdo->prepare)
Parameter Binding: execute([$variable])
Error Handling: Exceptions logged, not shown to user
```

### Layer 4: Session Management
```
Storage:        $_SESSION (server-side, not cookies)
Cookie Flags:   HttpOnly, Secure, SameSite=Strict
Identification: PHPSESSID (auto-managed by PHP)
```

### Layer 5: Content Security
```
HTML:          sanitize_html() removes dangerous tags
JavaScript:    React state (memory-only, not localStorage)
Attributes:    Allowed list: href, src, alt, title, class, target
Protocols:     javascript:, vbscript:, data: blocked
```

### Layer 6: API Communication
```
Credentials:   withCredentials: true
CORS:          Credentials in cross-origin requests
Status Codes:  401 (auth), 403 (forbidden), 429 (rate limit)
```

---

## 🔄 Authentication Flows

### ✅ Successful Login
```
1. User enters email/password
2. Frontend: AuthContext.login(email, password)
3. POST /api/login.php {email, password}
4. Backend: Find user by email (prepared statement)
5. Backend: password_verify(input, hashed) → true
6. Backend: Set $_SESSION variables
7. Backend: Response with user object
8. Browser: Automatic Set-Cookie: PHPSESSID=...
9. Frontend: AuthContext.user = user data
10. Protected pages now accessible
```

### ✅ Session Check (Page Reload)
```
1. Page loads
2. useEffect() → checkAuth()
3. GET /api/check_auth.php
4. Backend: if (isset($_SESSION['user_id'])) → return user
5. Frontend: Restore auth state from session
6. User never needs to re-login during session
```

### ✅ Logout
```
1. User clicks Logout
2. Frontend: AuthContext.logout()
3. GET /api/logout.php
4. Backend: session_destroy() → clears all data
5. Browser: Cookie expires/removed
6. Frontend: AuthContext.user = null
7. Redirect to login page
```

### ❌ Failed Login
```
1. POST /api/login.php with wrong password
2. Backend: password_verify() → false
3. Backend: HTTP 401 + "Invalid email or password"
4. Frontend: Show error toast
5. No session created
6. User stays on login page
```

---

## 🛡️ Attack Prevention

### SQL Injection
```php
❌ VULNERABLE: "SELECT * FROM users WHERE email = '$email'"
✅ SAFE:       $pdo->prepare("SELECT * FROM users WHERE email = ?")->execute([$email])
```

### XSS (Cross-Site Scripting)
```javascript
❌ VULNERABLE: localStorage.setItem('user', JSON.stringify(user))
✅ SAFE:       State variable in AuthContext (memory only)

❌ VULNERABLE: <div dangerouslySetInnerHTML={{__html: userContent}} />
✅ SAFE:       sanitize_html() removes <script>, onclick, etc.
```

### CSRF (Cross-Site Request Forgery)
```
Session Cookie: SameSite=Strict
Effect: Cookie only sent to same-site requests
Result: Attacker's domain can't access your cookie
```

### Session Hijacking
```
Cookie Flags:
- HttpOnly: JavaScript cannot read cookie
- Secure: Cookie only sent over HTTPS
- SameSite: Cookie restricted to same-site requests
```

### Password Attacks
```
Brute Force:     Rate limiting (not yet implemented)
Dictionary:      Bcrypt with salt (computational cost)
Rainbow Tables:  Bcrypt salting prevents pre-computed hashes
Timing Attack:   password_verify() uses constant-time comparison
```

---

## 📊 Security Status Matrix

```
Feature                    | Status | Risk  | Fix Priority
---------------------------|--------|-------|-------------
Password Hashing           | ✅     | LOW   | None
SQL Injection             | ✅     | LOW   | None
XSS Protection            | ✅     | LOW   | None
Session Security          | ✅     | LOW   | None
CSRF Protection           | ⚠️     | MED   | Medium
Rate Limiting             | ❌     | MED   | High
Email Verification        | ❌     | MED   | Medium
Password Complexity       | ⚠️     | MED   | Medium
Account Lockout           | ❌     | MED   | Medium
2FA/MFA                   | ❌     | HIGH  | Low
HTTPS Enforcement         | ⚠️     | HIGH  | High
Session Timeout           | ❌     | MED   | Medium
Secure Headers            | ❌     | LOW   | Low
Audit Logging             | ⚠️     | MED   | Medium
```

---

## 🚀 Quick Improvements (Priority Order)

### Priority 1: Critical (Week 1)
```php
// 1. Add HTTPS enforcement
if (!$_SERVER['HTTPS']) die('HTTPS required');

// 2. Add rate limiting
$cache->incr("login_attempts:$ip");
if ($cache->get("login_attempts:$ip") > 5) die('Too many attempts');

// 3. Add session timeout
if (time() - $_SESSION['last_activity'] > 3600) session_destroy();
```

### Priority 2: High (Week 2)
```php
// 1. Enforce password complexity
if (!preg_match('/[A-Z]/', $password)) die('Need uppercase');

// 2. Add secure headers
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// 3. Session ID regeneration
session_regenerate_id(true);
```

### Priority 3: Medium (Week 3)
```php
// 1. Email verification
$token = hash('sha256', random_bytes(32));
// Send verification email with token

// 2. Account lockout
if ($failed_attempts > 5) {
    $lockout_until = time() + 900;  // 15 minutes
}

// 3. Audit logging
error_log("User {$email} logged in from {$_SERVER['REMOTE_ADDR']}");
```

### Priority 4: Nice-to-Have (Month 2)
```php
// 1. Two-Factor Authentication (2FA)
// 2. Password reset flow
// 3. Account activity log
// 4. Suspicious login detection
```

---

## 📝 Testing Checklist

### Manual Testing
- [ ] Register new account → verify in database
- [ ] Login with correct password → should work
- [ ] Login with wrong password → should fail
- [ ] Modify password in browser dev tools → should fail (hashed)
- [ ] Logout → session destroyed
- [ ] Refresh page → session persists (until timeout)
- [ ] SQL injection attempt: `admin' OR '1'='1` → no effect
- [ ] XSS attempt in content: `<script>alert('xss')</script>` → sanitized

### Automated Testing (Add to CI/CD)
```bash
# Password hashing test
php -r "echo password_verify('test', password_hash('test', PASSWORD_DEFAULT)) ? 'PASS' : 'FAIL';"

# SQL injection test
php -r "
$stmt = new PDOStatement('SELECT * FROM users WHERE email = ?');
$stmt->execute(['admin\' OR \'1\'=\'1']);
echo 'PASS: No injection';
"

# XSS sanitization test
php -r "
require 'security.php';
$dirty = '<script>alert(1)</script>';
$clean = sanitize_html($dirty);
echo strpos($clean, '<script>') === false ? 'PASS' : 'FAIL';
"
```

---

## 🔗 Related Files

- **Full Documentation**: `/SECURITY.md`
- **Project Plan**: `/PROJECT_PLAN.md`
- **Database Schema**: `/public/database/database.sql`
- **Configuration**: `/public/config/db.php`
- **Test Database**: `/public/database/seed.php`

---

*Complete security analysis for your authentication system*
*For detailed information, see SECURITY.md*
