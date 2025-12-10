<?php
/**
 * Cleanup helper for blob/data bookmarks.
 *
 * Usage (CLI):
 *   php scripts/cleanup_blob_bookmarks.php --action=report   # default, shows matches
 *   php scripts/cleanup_blob_bookmarks.php --action=export   # prints JSON array
 *   php scripts/cleanup_blob_bookmarks.php --action=delete   # deletes rows + tag links
 *
 * Safety:
 * - Default is report (read-only).
 * - Delete will also remove bookmark_tags rows for the affected bookmarks.
 */

require_once __DIR__ . '/../config.php';

defaultHeadersForCli();

$action = parseAction($argv ?? []);
$db = getDB();

$rows = findBlobBookmarks($db);

switch ($action) {
    case 'report':
        report($rows);
        break;
    case 'export':
        exportJson($rows);
        break;
    case 'delete':
        deleteRows($db, $rows);
        break;
    default:
        fwrite(STDERR, "Unknown action: {$action}\n");
        exit(1);
}

/** Turn off default headers when running from CLI. */
function defaultHeadersForCli(): void {
    if (php_sapi_name() === 'cli') {
        // No-op for now; headers in config are harmless but we ensure no output before them.
    }
}

function parseAction(array $argv): string {
    foreach ($argv as $arg) {
        if (strpos($arg, '--action=') === 0) {
            return substr($arg, 9);
        }
    }
    return 'report';
}

function findBlobBookmarks(PDO $db): array {
    $stmt = $db->prepare("SELECT id, user_id, title, type, url, content FROM bookmarks WHERE content LIKE 'blob:%' OR content LIKE 'data:%'");
    $stmt->execute();
    return $stmt->fetchAll();
}

function report(array $rows): void {
    $count = count($rows);
    echo "Found {$count} bookmark(s) with blob/data content.\n";
    foreach ($rows as $row) {
        printf("- id=%d user_id=%d type=%s title=%s content=%s\n",
            $row['id'], $row['user_id'], $row['type'], safeStr($row['title']), preview($row['content']));
    }
}

function exportJson(array $rows): void {
    echo json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
}

function deleteRows(PDO $db, array $rows): void {
    if (empty($rows)) {
        echo "No blob/data bookmarks to delete.\n";
        return;
    }

    $ids = array_column($rows, 'id');
    $placeholders = implode(',', array_fill(0, count($ids), '?'));

    $db->beginTransaction();
    try {
        // Remove tag links first
        $stmt = $db->prepare("DELETE FROM bookmark_tags WHERE bookmark_id IN ({$placeholders})");
        $stmt->execute($ids);

        // Remove bookmarks
        $stmt = $db->prepare("DELETE FROM bookmarks WHERE id IN ({$placeholders})");
        $stmt->execute($ids);

        $db->commit();
        echo "Deleted " . count($ids) . " bookmark(s).\n";
    } catch (Exception $e) {
        $db->rollBack();
        fwrite(STDERR, "Delete failed: " . $e->getMessage() . "\n");
        exit(1);
    }
}

function safeStr($value): string {
    return is_null($value) ? '' : trim((string)$value);
}

function preview($value, int $limit = 80): string {
    $str = safeStr($value);
    if (strlen($str) <= $limit) return $str;
    return substr($str, 0, $limit - 3) . '...';
}
