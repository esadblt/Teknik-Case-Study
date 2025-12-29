<?php
/**
 * CORS Middleware
 * Handles Cross-Origin Resource Sharing headers
 */

function handleCors()
{
    // Allow all origins for production
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '*';

    // If origin is set, use it; otherwise use wildcard
    if (!empty($origin) && $origin !== '*') {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header("Access-Control-Allow-Origin: *");
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    header("Content-Type: application/json; charset=UTF-8");

    // Preflight request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
