<?php
/**
 * Media Serving Endpoint
 * Securely serves uploaded media files with proper user authentication
 */
require_once '../config.php';

// Set CORS headers
setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    die('Method not allowed');
}

// Get requested file
$file = $_GET['f'] ?? '';
if (empty($file)) {
    http_response_code(400);
    die('File not specified');
}

// Sanitize file parameter to prevent directory traversal
$file = basename($file);
$filepath = UPLOAD_DIR . $file;

// Check if file exists
if (!file_exists($filepath)) {
    http_response_code(404);
    die('File not found');
}

// Extract user ID from filename (format: userid_timestamp_hash.ext)
$parts = explode('_', $file);
if (empty($parts[0]) || !is_numeric($parts[0])) {
    http_response_code(403);
    die('Invalid file');
}
$fileOwnerId = (int)$parts[0];

// Check authentication via explicit headers (stateless)
// HTML media elements can't send custom headers, so also check URL parameters as fallback
$userId = authenticateUserFromHeaders();

// If no user ID from headers (e.g., HTML media element request), try URL parameters
if (!$userId) {
    $userId = $_GET['user_id'] ?? null;
    $userEmail = $_GET['user_email'] ?? null;
    
    if ($userId && $userEmail) {
        // Verify the user ID and email match
        $db = getDB();
        $stmt = $db->prepare("SELECT id FROM users WHERE id = ? AND email = ? LIMIT 1");
        $stmt->execute([(int)$userId, $userEmail]);
        $row = $stmt->fetch();
        $userId = $row ? (int)$userId : null;
    }
}

// Verify user owns this file
if (!$userId || $userId !== $fileOwnerId) {
    http_response_code(403);
    die('Access denied');
}

// Verify file exists in database
$db = getDB();
$relativePath = 'uploads/media/' . $file;
$stmt = $db->prepare("SELECT id, type FROM bookmarks WHERE user_id = ? AND (content = ? OR url = ?)");
$stmt->execute([$userId, $relativePath, $relativePath]);
if (!$stmt->fetch()) {
    http_response_code(404);
    die('File not found in database');
}

// Determine MIME type
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $filepath);
finfo_close($finfo);

// Security: only allow media files
if (!in_array($mime, ALLOWED_MEDIA_TYPES)) {
    http_response_code(403);
    die('Access denied');
}

// Set proper headers for media serving
header('Content-Type: ' . $mime);
header('Content-Disposition: inline; filename="' . basename($filepath) . '"');
header('Cache-Control: public, max-age=31536000');
header('Content-Length: ' . filesize($filepath));

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// Serve the file
readfile($filepath);
?>
