<?php
require_once '../config.php';

header('Content-Type: application/json');
setCORSHeaders();

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Stateless authentication via explicit headers
$userId = authenticateUserFromHeaders();

if (!$userId) {
    http_response_code(401);
    jsonError('Authentication required. Please log in.', 401);
    exit;
}

// Additional security: Verify user ID is valid integer
if (!is_numeric($userId) || $userId <= 0) {
    http_response_code(401);
    jsonError('Invalid authentication', 401);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$db = getDB();

try {
    switch ($method) {
        case 'GET':
            handleGetBookmarks($db, $userId);
            break;
            
        case 'POST':
            handleCreateBookmark($db, $userId);
            break;
            
        case 'PUT':
            handleUpdateBookmark($db, $userId);
            break;
            
        case 'DELETE':
            handleDeleteBookmark($db, $userId);
            break;
            
        default:
            jsonError('Method not allowed', 405);
    }
} catch (Exception $e) {
    error_log("Bookmarks API error: " . $e->getMessage());
    jsonError('Server error: ' . $e->getMessage(), 500);
}

function handleGetBookmarks($db, $userId) {
    $collectionId = $_GET['collection_id'] ?? null;
    $search = trim($_GET['search'] ?? '');
    $tag = trim($_GET['tag'] ?? '');
    $favorite = $_GET['favorite'] ?? '';
    
    $sql = "SELECT b.*, 
                   COALESCE(STRING_AGG(DISTINCT t.name, ','), '') as tags,
                   c.name as collection_name
            FROM bookmarks b
            LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
            LEFT JOIN tags t ON bt.tag_id = t.id
            LEFT JOIN collections c ON b.collection_id = c.id
            WHERE b.user_id = ?";
    
    $params = [$userId];
    
    if ($collectionId !== null && $collectionId !== '') {
        $sql .= " AND b.collection_id = ?";
        $params[] = (int)$collectionId;
    }
    
    if ($favorite === 'true') {
        $sql .= " AND b.favorite = 1";
    }
    
    if (!empty($search)) {
        $sql .= " AND (b.title ILIKE ? OR b.description ILIKE ? OR b.content ILIKE ?)";
        $searchParam = "%" . $search . "%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    $sql .= " GROUP BY b.id, c.name ORDER BY b.created_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $bookmarks = $stmt->fetchAll();
    
    // Process tags
    foreach ($bookmarks as &$bookmark) {
        $bookmark['tags'] = $bookmark['tags'] ? explode(',', $bookmark['tags']) : [];
        $bookmark['favorite'] = (bool)$bookmark['favorite'];
        
        // Filter by tag if specified
        if (!empty($tag) && !in_array($tag, $bookmark['tags'])) {
            continue;
        }
    }
    
    // Remove filtered items
    if (!empty($tag)) {
        $bookmarks = array_values(array_filter($bookmarks, function($b) use ($tag) {
            return in_array($tag, $b['tags']);
        }));
    }
    
    jsonSuccess($bookmarks);
}

function handleCreateBookmark($db, $userId) {
    // Handle multipart form data for file uploads
    if (strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false) {
        $title = trim($_POST['title'] ?? '');
        $url = trim($_POST['url'] ?? '');
        $type = $_POST['type'] ?? 'link';
        $content = $_POST['content'] ?? '';
        $description = trim($_POST['description'] ?? '');
        $collectionId = $_POST['collection_id'] ?? null;
        $tags = isset($_POST['tags']) ? (is_array($_POST['tags']) ? $_POST['tags'] : explode(',', $_POST['tags'])) : [];
        $favorite = isset($_POST['favorite']) ? (bool)$_POST['favorite'] : false;
    } else {
        // JSON request
        $data = json_decode(file_get_contents('php://input'), true);
        $title = trim($data['title'] ?? '');
        $url = trim($data['url'] ?? '');
        $type = $data['type'] ?? 'link';
        $content = $data['content'] ?? '';
        $description = trim($data['description'] ?? '');
        $collectionId = $data['collection_id'] ?? null;
        $tags = $data['tags'] ?? [];
        $favorite = isset($data['favorite']) ? (bool)$data['favorite'] : false;
    }
    
    if (empty($title)) {
        jsonError('Title is required');
    }

    // Validate type - link, text, image, and video allowed
    if (!in_array($type, ['link', 'text', 'image', 'video'])) {
        jsonError('Invalid bookmark type. Only link, text, image, and video bookmarks are allowed.');
    }
    
    // Validate collection belongs to user
    if ($collectionId) {
        $stmt = $db->prepare("SELECT id FROM collections WHERE id = ? AND user_id = ?");
        $stmt->execute([$collectionId, $userId]);
        if (!$stmt->fetch()) {
            jsonError('Invalid collection');
        }
    }
    
    // Insert bookmark
    $stmt = $db->prepare("INSERT INTO bookmarks (user_id, collection_id, title, url, type, content, description, favorite) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id");
    $stmt->execute([$userId, $collectionId, $title, $url, $type, $content, $description, $favorite ? 1 : 0]);
    $bookmarkId = $stmt->fetchColumn();
    
    // Handle tags
    if (!empty($tags) && is_array($tags)) {
        foreach ($tags as $tagName) {
            $tagName = trim($tagName);
            if (empty($tagName)) continue;
            
            // Get or create tag
            $stmt = $db->prepare(
                "INSERT INTO tags (user_id, name) VALUES (?, ?) " .
                "ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name " .
                "RETURNING id"
            );
            $stmt->execute([$userId, $tagName]);
            $tagId = $stmt->fetchColumn();

            // Link bookmark to tag
            $stmt = $db->prepare("INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING");
            $stmt->execute([$bookmarkId, $tagId]);
        }
    }
    
    // Fetch complete bookmark
    $stmt = $db->prepare("SELECT b.*, 
                                  GROUP_CONCAT(DISTINCT t.name) as tags,
                                  c.name as collection_name
                           FROM bookmarks b
                           LEFT JOIN bookmark_tags bt ON b.id = bt.bookmark_id
                           LEFT JOIN tags t ON bt.tag_id = t.id
                           LEFT JOIN collections c ON b.collection_id = c.id
                           WHERE b.id = ? AND b.user_id = ?
                           GROUP BY b.id");
    $stmt->execute([$bookmarkId, $userId]);
    $bookmark = $stmt->fetch();
    $bookmark['tags'] = $bookmark['tags'] ? explode(',', $bookmark['tags']) : [];
    $bookmark['favorite'] = (bool)$bookmark['favorite'];
    
    jsonSuccess($bookmark, 'Bookmark created successfully');
}

function handleUpdateBookmark($db, $userId) {
    $bookmarkId = $_GET['id'] ?? null;
    if (!$bookmarkId) {
        jsonError('Bookmark ID required');
    }
    
    // Verify ownership
    $stmt = $db->prepare("SELECT id FROM bookmarks WHERE id = ? AND user_id = ?");
    $stmt->execute([$bookmarkId, $userId]);
    if (!$stmt->fetch()) {
        jsonError('Bookmark not found', 404);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $updates = [];
    $params = [];
    
    if (isset($data['title'])) {
        $updates[] = "title = ?";
        $params[] = trim($data['title']);
    }
    if (isset($data['url'])) {
        $updates[] = "url = ?";
        $params[] = trim($data['url']);
    }
    if (isset($data['type'])) {
        $updates[] = "type = ?";
        $params[] = $data['type'];
    }
    if (isset($data['content'])) {
        $updates[] = "content = ?";
        $params[] = $data['content'];
    }
    if (isset($data['description'])) {
        $updates[] = "description = ?";
        $params[] = trim($data['description']);
    }
    if (isset($data['collection_id'])) {
        $updates[] = "collection_id = ?";
        $params[] = $data['collection_id'];
    }
    if (isset($data['favorite'])) {
        $updates[] = "favorite = ?";
        $params[] = $data['favorite'] ? 1 : 0;
    }
    
    if (empty($updates)) {
        jsonError('No fields to update');
    }
    
    $params[] = $bookmarkId;
    $params[] = $userId;
    
    $sql = "UPDATE bookmarks SET " . implode(', ', $updates) . " WHERE id = ? AND user_id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    
    // Update tags if provided
    if (isset($data['tags']) && is_array($data['tags'])) {
        // Remove existing tags
        $stmt = $db->prepare("DELETE FROM bookmark_tags WHERE bookmark_id = ?");
        $stmt->execute([$bookmarkId]);
        
        // Add new tags
        foreach ($data['tags'] as $tagName) {
            $tagName = trim($tagName);
            if (empty($tagName)) continue;
            
            $stmt = $db->prepare(
                "INSERT INTO tags (user_id, name) VALUES (?, ?) " .
                "ON CONFLICT (user_id, name) DO UPDATE SET name = EXCLUDED.name " .
                "RETURNING id"
            );
            $stmt->execute([$userId, $tagName]);
            $tagId = $stmt->fetchColumn();

            $stmt = $db->prepare("INSERT INTO bookmark_tags (bookmark_id, tag_id) VALUES (?, ?) ON CONFLICT DO NOTHING");
            $stmt->execute([$bookmarkId, $tagId]);
        }
    }
    
    jsonSuccess(null, 'Bookmark updated successfully');
}

function handleDeleteBookmark($db, $userId) {
    $bookmarkId = $_GET['id'] ?? null;
    if (!$bookmarkId) {
        jsonError('Bookmark ID required');
    }
    
    // Verify ownership and delete
    $stmt = $db->prepare("DELETE FROM bookmarks WHERE id = ? AND user_id = ?");
    $stmt->execute([$bookmarkId, $userId]);
    
    if ($stmt->rowCount() === 0) {
        jsonError('Bookmark not found', 404);
    }
    
    jsonSuccess(null, 'Bookmark deleted successfully');
}

