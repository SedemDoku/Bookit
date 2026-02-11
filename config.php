<?php
require_once __DIR__ . '/env.php';
loadEnvFile(__DIR__ . '/.env');

// Database configuration - Use environment variables in production
// Supabase Postgres defaults: set DATABASE_URL or DB_* vars.
define('DB_DRIVER', getenv('DB_DRIVER') ?: 'pgsql');
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_PORT', getenv('DB_PORT') ?: '5432');
define('DB_NAME', getenv('DB_NAME') ?: 'postgres');
define('DB_USER', getenv('DB_USER') ?: 'postgres');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_SSLMODE', getenv('DB_SSLMODE') ?: 'require');
define('DB_DSN', getenv('DB_DSN') ?: '');
define('DATABASE_URL', getenv('DATABASE_URL') ?: '');

// Security configuration
define('ALLOWED_ORIGINS', ['http://169.239.251.102:341', 'http://localhost', 'http://127.0.0.1']);
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
            $dsn = '';
            $dbUser = DB_USER;
            $dbPass = DB_PASS;
            if (DB_DSN) {
                $dsn = DB_DSN;
            } elseif (DATABASE_URL) {
                $parsed = buildPgDsnFromUrl(DATABASE_URL);
                $dsn = $parsed['dsn'];
                if (!empty($parsed['user'])) {
                    $dbUser = $parsed['user'];
                }
                if (!empty($parsed['pass'])) {
                    $dbPass = $parsed['pass'];
                }
            } else {
                $dsn = DB_DRIVER . ":host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME;
                if (DB_DRIVER === 'pgsql') {
                    $dsn .= ";sslmode=" . DB_SSLMODE;
                } else {
                    $dsn .= ";charset=utf8mb4";
                }
            }

            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode([
                'success' => false,
                'error' => 'Database connection failed. Please check your configuration.'
            ]);
            exit;
        }
    }
    return $pdo;
}

// Build a pgsql PDO DSN from a postgresql:// URL
function buildPgDsnFromUrl($url) {
    $parts = parse_url($url);
    if ($parts === false || empty($parts['host']) || empty($parts['path'])) {
        return ['dsn' => '', 'user' => '', 'pass' => ''];
    }

    $host = $parts['host'];
    $port = isset($parts['port']) ? $parts['port'] : '5432';
    $dbName = ltrim($parts['path'], '/');
    $user = isset($parts['user']) ? urldecode($parts['user']) : '';
    $pass = isset($parts['pass']) ? urldecode($parts['pass']) : '';

    return [
        'dsn' => "pgsql:host={$host};port={$port};dbname={$dbName};sslmode=" . DB_SSLMODE,
        'user' => $user,
        'pass' => $pass
    ];
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

