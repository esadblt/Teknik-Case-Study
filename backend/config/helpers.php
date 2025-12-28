<?php
/**
 * Input Validation Helper
 * Sanitizes and validates user input
 */

function validateInput($data, $field, $type = 'string') {
    if (!isset($data[$field])) {
        return null;
    }
    
    $value = $data[$field];
    
    switch($type) {
        case 'string':
            return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
        case 'int':
            $filtered = filter_var($value, FILTER_VALIDATE_INT);
            return $filtered !== false ? $filtered : null;
        case 'bool':
            return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        case 'email':
            return filter_var($value, FILTER_VALIDATE_EMAIL) ?: null;
        case 'date':
            $date = DateTime::createFromFormat('Y-m-d', $value);
            return $date ? $date->format('Y-m-d') : null;
        default:
            return $value;
    }
}

/**
 * Send JSON response
 */
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

/**
 * Send error response
 */
function errorResponse($message, $statusCode = 400) {
    jsonResponse(['error' => $message], $statusCode);
}

/**
 * Get JSON input from request body
 */
function getJsonInput() {
    $rawData = file_get_contents("php://input");
    $data = json_decode($rawData, true);
    
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        errorResponse('Invalid JSON', 400);
    }
    
    return $data;
}
