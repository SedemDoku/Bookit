<?php
// Database configuration - Use environment variables in production
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'bookmark_db');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// Security configuration
define('ALLOWED_ORIGINS', ['http://169.239.251.102:341', 'http://localhost', 'http://127.0.0.1']);
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB
define('UPLOAD_DIR', dirname(__DIR__) . '/uploads/media/');
define('ALLOWED_MEDIA_TYPES', ['audio/mpeg', 'audio/wav', 'audio/webm', 'video/mp4', 'video/webm', 'video/quicktime']);
define('ALLOWED_MEDIA_EXTENSIONS', ['mp3', 'wav', 'webm', 'mp4', 'mov', 'avi', 'm4a', 'flac']);
define('CSRF_TOKEN_LENGTH', 32);

// Set secure headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// Function to set CORS headers securely
function setCORSHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    // Allow chrome extension origins (they start with chrome-extension://)
    if (in_array($origin, ALLOWED_ORIGINS) || strpos($origin, 'chrome-extension://') === 0) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Credentials: true');
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-User-ID, X-User-Email, X-CSRF-Token');
    header('Access-Control-Max-Age: 86400');
}

// Database connection
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            die("Database connection failed. Please check your configuration.");
        }
    }
    return $pdo;
}

// Authenticate a user based on explicit headers (stateless)
function authenticateUserFromHeaders() {
    $userId = $_SERVER['HTTP_X_USER_ID'] ?? $_GET['user_id'] ?? null;
    $email = $_SERVER['HTTP_X_USER_EMAIL'] ?? $_GET['user_email'] ?? null;

    if (!$userId || !$email) {
        return null;
    }

    $userId = (int)$userId;
    if ($userId <= 0) {
        return null;
    }

    try {
        $db = getDB();
        $stmt = $db->prepare("SELECT id FROM users WHERE id = ? AND email = ? LIMIT 1");
        $stmt->execute([$userId, $email]);
        $row = $stmt->fetch();
        return $row ? $userId : null;
    } catch (Exception $e) {
        error_log('Header auth failed: ' . $e->getMessage());
        return null;
    }
}

// JSON response helper
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

// Error response helper
function jsonError($message, $statusCode = 400) {
    jsonResponse(['error' => $message], $statusCode);
}

// Success response helper
function jsonSuccess($data = null, $message = null) {
    $response = ['success' => true];
    if ($message) $response['message'] = $message;
    if ($data !== null) $response['data'] = $data;
    jsonResponse($response);
}

// Sanitize file upload name
function sanitizeFileName($filename) {
    $filename = basename($filename);
    $filename = preg_replace('/[^a-zA-Z0-9._-]/', '', $filename);
    $ext = pathinfo($filename, PATHINFO_EXTENSION);
    return time() . '_' . substr(md5(uniqid()), 0, 8) . '.' . $ext;
}

// Validate media upload
function validateMediaUpload($file, $type) {
    if (!isset($file['tmp_name']) || !isset($file['type']) || !isset($file['size'])) {
        return ['valid' => false, 'error' => 'Invalid file upload'];
    }
    
    if ($file['size'] > MAX_FILE_SIZE) {
        return ['valid' => false, 'error' => 'File too large (max ' . (MAX_FILE_SIZE / 1024 / 1024) . 'MB)'];
    }
    
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ALLOWED_MEDIA_EXTENSIONS)) {
        return ['valid' => false, 'error' => 'File type not allowed'];
    }
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mime, ALLOWED_MEDIA_TYPES)) {
        return ['valid' => false, 'error' => 'Invalid file MIME type'];
    }
    
    if ($type === 'audio' && strpos($mime, 'audio') === false) {
        return ['valid' => false, 'error' => 'File is not audio'];
    }
    if ($type === 'video' && strpos($mime, 'video') === false) {
        return ['valid' => false, 'error' => 'File is not video'];
    }
    
    return ['valid' => true];
}

// Handle media file upload
function uploadMediaFile($file, $userId, $type) {
    $validation = validateMediaUpload($file, $type);
    if (!$validation['valid']) {
        return $validation;
    }
    
    if (!is_dir(UPLOAD_DIR)) {
        if (!mkdir(UPLOAD_DIR, 0755, true)) {
            return ['valid' => false, 'error' => 'Failed to create upload directory'];
        }
    }
    
    $filename = sanitizeFileName($file['name']);
    $filepath = UPLOAD_DIR . $userId . '_' . $filename;
    $relativePath = 'uploads/media/' . $userId . '_' . $filename;
    
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        return ['valid' => false, 'error' => 'Failed to save file'];
    }
    
    return ['valid' => true, 'path' => $relativePath, 'url' => basename($relativePath)];
}

