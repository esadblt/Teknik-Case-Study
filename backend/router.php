<?php
/**
 * Simple Router for PHP Built-in Server
 * Routes /api/* requests to the correct PHP files
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// If requesting a file that exists, serve it directly
if (file_exists(__DIR__ . $uri) && is_file(__DIR__ . $uri)) {
    return false;
}

// Route /api/* to /api/*.php
if (preg_match('/^\/api\/(\w+)$/', $uri, $matches)) {
    $file = __DIR__ . '/api/' . $matches[1] . '.php';
    if (file_exists($file)) {
        require $file;
        exit;
    }
}

// Default: return 404
http_response_code(404);
echo json_encode(['error' => 'Not Found']);
?>