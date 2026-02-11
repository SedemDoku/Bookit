<?php
// Database setup script for Supabase Postgres
$databaseUrl = getenv('DATABASE_URL');

if (!$databaseUrl) {
    echo "Error: DATABASE_URL is not set.\n";
    exit(1);
}

$parts = parse_url($databaseUrl);
if ($parts === false || empty($parts['host']) || empty($parts['path'])) {
    echo "Error: Invalid DATABASE_URL.\n";
    exit(1);
}

$host = $parts['host'];
$port = isset($parts['port']) ? $parts['port'] : '5432';
$dbName = ltrim($parts['path'], '/');
$user = isset($parts['user']) ? urldecode($parts['user']) : '';
$pass = isset($parts['pass']) ? urldecode($parts['pass']) : '';

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbName;sslmode=require";
    $pdo = new PDO($dsn, $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "Connected to Postgres successfully!\n\n";
    
    // Read and execute the SQL file
    $sql = file_get_contents(__DIR__ . '/database.sql');
    
    // Execute as a single batch to support functions and triggers
    $pdo->exec($sql);
    echo "\n✓ Database setup complete!\n";
    
    // Verify tables
    $stmt = $pdo->query("SELECT tablename FROM pg_tables WHERE schemaname = 'public'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo "\nTables in public schema:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
