# Configuration Guide

Complete configuration reference for the Personal Web Tech Bookmark Manager project.

## 📋 Table of Contents

- [Database Configuration](#database-configuration)
- [Environment Variables](#environment-variables)
- [API URL Configuration](#api-url-configuration)
- [Browser Extension Configuration](#browser-extension-configuration)
- [Security Configuration](#security-configuration)
- [Deployment Scenarios](#deployment-scenarios)
- [Troubleshooting](#troubleshooting)

---

## Database Configuration

### Required Database Settings

Edit `config.php` with your database credentials:

```php
define('DB_HOST', 'localhost');      // Database server hostname
define('DB_NAME', 'bookmark_db');    // Database name
define('DB_USER', 'your_username');  // Database username
define('DB_PASS', 'your_password');  // Database password
```

### Using Environment Variables (Recommended for Production)

For better security, use environment variables instead of hardcoding credentials:

```php
// config.php supports these environment variables:
// DB_HOST, DB_NAME, DB_USER, DB_PASS
```

Set them in your system or `.env` file:

```bash
export DB_HOST=localhost
export DB_NAME=bookmark_db
export DB_USER=your_username
export DB_PASS=your_password
```

### Database Schema

The application uses 4 main tables:

1. **users** - User accounts and authentication
2. **collections** - Bookmark collections/folders with nested support
3. **bookmarks** - Bookmark entries with media support
4. **tags** - Bookmark tagging system

Import using: `mysql -u username -p bookmark_db < database.sql`

---

## Environment Variables

### Supported Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | MySQL server hostname |
| `DB_NAME` | `bookmark_db` | Database name |
| `DB_USER` | (required) | Database username |
| `DB_PASS` | (required) | Database password |


---

## API URL Configuration

### Web Application

The web app uses **relative paths** by default, which work automatically:

- `api/auth.php`
- `api/bookmarks.php`
- `api/collections.php`


**No configuration needed** unless hosting at a non-root path.

### Custom Base Path

If hosted at a subdirectory (e.g., `/bookmark_manager/`), update `auth.js` and `app.js`:

```javascript
const API_BASE = '/bookmark_manager/api';
```

---

## Browser Extension Configuration

### Chrome Extension (WebExtention/)

**Configure API URL in two files:**

1. **WebExtention/popup.js**:
   ```javascript
   const DEFAULT_API_BASE = 'http://your-server.com/api';
   ```

2. **WebExtention/background.js**:
   ```javascript
   apiUrl: 'http://your-server.com/api',
   ```

### Firefox Extension (WebExtensionFirefox/)

**Configure API URL in two files:**

1. **WebExtensionFirefox/popup.js**:
   ```javascript
   const DEFAULT_API_BASE = 'http://your-server.com/api';
   ```

2. **WebExtensionFirefox/background.js**:
   ```javascript
   apiUrl: 'http://your-server.com/api',
   ```

### Extension Configuration Examples

**Local Development:**
```javascript
const DEFAULT_API_BASE = 'http://localhost/Personal_Web_Tech_Project/api';
```

**Remote Server:**
```javascript
const DEFAULT_API_BASE = 'https://yourdomain.com/api';
```

**School Server Example:**
```javascript
const DEFAULT_API_BASE = 'http://169.239.251.102:341/~sedem.doku/api';
```

---

## Security Configuration

### CORS (Cross-Origin Resource Sharing)

**Allowed Origins** are configured in `config.php`:

```php
function setCORSHeaders() {
    $allowedOrigins = [
        'http://localhost',
        'http://127.0.0.1',
        'chrome-extension://*',
        'moz-extension://*'
    ];
    // Add your server URLs here
}
```

**To add custom origins:**

```php
$allowedOrigins = [
    'https://yourdomain.com',
    'http://localhost:8000',
    // Add more as needed
];
```

### CSRF Protection

CSRF tokens are automatically generated and validated for:
- Login/Signup
- State-changing operations (POST, PUT, DELETE)

**Session-based tokens** with automatic regeneration.

### Security Headers

Automatically set in `config.php`:

- `Content-Security-Policy`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS only)

### Password Requirements

Configured in `api/auth.php`:

- Minimum 8 characters
- At least one special character
- Password hashing with PHP's `password_hash()`

---

> Note: Server-side media uploads and downloads are disabled. Media is stored as external URLs (e.g., YouTube links, image URLs) and rendered directly by the client. The `api/media.php` endpoint is removed in this state.

---

## Deployment Scenarios

### Scenario 1: Local Development (XAMPP)

1. **Database:**
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'root');
   define('DB_PASS', '');
   ```

2. **Extension API:**
   ```javascript
   const DEFAULT_API_BASE = 'http://localhost/Personal_Web_Tech_Project/api';
   ```

3. **No HTTPS needed** for localhost

### Scenario 2: Remote Production Server

1. **Database:** Use environment variables
   ```bash
   export DB_HOST=localhost
   export DB_USER=production_user
   export DB_PASS=secure_password
   ```

2. **Extension API:**
   ```javascript
   const DEFAULT_API_BASE = 'https://yourdomain.com/api';
   ```

3. **Enable HTTPS:**
   ```php
   // In config.php
   ini_set('session.cookie_secure', 1);
   ini_set('session.cookie_httponly', 1);
   ```

4. **Update CORS** to include production domain

### Scenario 3: School Server / Shared Hosting

1. **Database:** Use provided credentials
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'student.name');
   define('DB_PASS', 'assigned_password');
   ```

2. **Extension API:**
   ```javascript
   const DEFAULT_API_BASE = 'http://server-ip/~student.name/api';
   ```

3. **Check file permissions:**
   ```bash
   chmod 644 *.php
   chmod 755 api/
   ```

---

## Troubleshooting

### Database Connection Issues

**Problem:** "Database connection failed"

**Solutions:**
- Verify credentials in `config.php`
- Ensure MySQL service is running
- Check database exists: `SHOW DATABASES;`
- Test connection: `mysql -u username -p`

### Extension Can't Connect to API

**Problem:** Extension shows "Failed to connect"

**Solutions:**
- Verify API URL in `popup.js` and `background.js`
- Check server is accessible from browser
- Open browser console for detailed errors
- Ensure CORS headers allow extension origin

### CORS Errors

**Problem:** "Access blocked by CORS policy"

**Solutions:**
- Add origin to allowed list in `config.php`
- Check preflight OPTIONS requests are handled
- Verify `Access-Control-Allow-Origin` header is set
- For extensions, ensure `chrome-extension://*` is allowed

### Session/Login Issues

**Problem:** "Session expired" or can't stay logged in

**Solutions:**
- Clear browser cookies
- Check PHP session configuration
- Verify `session_start()` is called in `config.php`
- Ensure session directory is writable

### Permission Denied Errors

**Problem:** Can't write files or access directories

**Solutions:**
- Set proper file permissions:
  ```bash
  chmod 644 *.php
  ```
- Check Apache/PHP user has write access
- On Windows, check folder security settings

### Extension Authentication Headers

**Problem:** Extension authentication fails

**Solutions:**
- Check `X-User-ID` and `X-User-Email` headers are sent
- Verify user is logged in via extension
- Check API endpoint validates headers correctly
- Clear extension storage and re-login

---

## Configuration Checklist

Before deploying, ensure:

- [ ] Database credentials set in `config.php`
- [ ] Database schema imported (`database.sql`)
- [ ] Extension API URLs configured
- [ ] CORS origins include your domain
- [ ] Security headers enabled
- [ ] HTTPS enabled (production)
- [ ] Environment variables set (if using)
- [ ] File permissions correct

---

## Additional Resources

- [README.md](README.md) - Project overview and setup
- [QUICK_START.md](QUICK_START.md) - Implementation reference
- [COMPREHENSIVE_DOCUMENTATION.md](COMPREHENSIVE_DOCUMENTATION.md) - Detailed docs
- [WebExtention/README.md](WebExtention/README.md) - Extension guide

---

**Last Updated:** December 18, 2025

