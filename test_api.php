<?php
// Test API endpoints without PHP sessions (uses header-based auth)
$userId = 1;
$userEmail = 'test@example.com';

echo "Testing API endpoints...\n\n";

// Test collections endpoint
echo "Testing collections.php:\n";
$ch = curl_init('http://localhost/Personal_Web_Tech_Project/api/collections.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
	'X-User-ID: ' . $userId,
	'X-User-Email: ' . $userEmail
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "HTTP Code: $httpCode\n";
echo "Response: $response\n\n";

// Test bookmarks endpoint
echo "Testing bookmarks.php:\n";
$ch = curl_init('http://localhost/Personal_Web_Tech_Project/api/bookmarks.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
	'X-User-ID: ' . $userId,
	'X-User-Email: ' . $userEmail
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
