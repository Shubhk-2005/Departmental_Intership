<?php
/**
 * CORS Configuration
 * Handles Cross-Origin Resource Sharing headers
 */

function handleCors()
{
    // Allow from any origin (adjust for production)
    $allowedOrigins = [
        'http://localhost:8080',
        'http://localhost:3000',
        'http://localhost:5173',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowedOrigins)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        // For development, allow all origins
        header("Access-Control-Allow-Origin: *");
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400"); // 24 hours cache for preflight

    // Handle preflight OPTIONS request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}
