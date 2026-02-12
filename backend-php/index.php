<?php
/**
 * Main Router / Entry Point
 * Internship Portal PHP Backend API
 * 
 * Routes all requests to appropriate handlers
 */

// Error reporting for development
// Error reporting for development - FORCE ON
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Disable output buffering to ensure errors are seen
// ob_start();

// Set content type to JSON
header('Content-Type: application/json');

// Load configuration
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/helpers/response.php';

// Handle CORS
handleCors();

// Parse the request URI
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];

// Remove script name from request URI if present
$basePath = dirname($scriptName);
if ($basePath !== '/') {
    $requestUri = str_replace($basePath, '', $requestUri);
}

// Remove query string and decode
$path = strtok($requestUri, '?');
$path = urldecode($path);

// Remove leading/trailing slashes and split into parts
$path = trim($path, '/');
$pathParts = $path ? explode('/', $path) : [];

// Get HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Debug logging (remove in production)
error_log("PHP Backend Request: $method " . implode('/', $pathParts));

// Health check / Root route
if (empty($pathParts) || (count($pathParts) === 1 && $pathParts[0] === 'index.php')) {
    jsonResponse([
        'message' => 'Internship Portal PHP Backend API',
        'version' => '1.0.0',
        'status' => 'running',
        'php_version' => PHP_VERSION,
        'endpoints' => [
            '/api/auth' => 'Authentication endpoints',
            '/api/drives' => 'Placement drives',
            '/api/internships' => 'Internship applications',
            '/api/alumni' => 'Alumni profiles',
            '/api/placements' => 'Placement statistics',
            '/api/off-campus-placements' => 'Off-campus placements',
            '/api/upload' => 'File uploads',
            '/api/exams' => 'Competitive exam scores'
        ]
    ]);
}

// All API routes start with 'api'
if ($pathParts[0] !== 'api') {
    jsonError('Route not found. All API routes should start with /api/', 404);
}

// Get the API resource (auth, drives, etc.)
$resource = $pathParts[1] ?? '';

// Route to appropriate handler
// Route to appropriate handler
try {
    switch ($resource) {
        case 'auth':
            require_once __DIR__ . '/routes/auth.php';
            handleAuthRoutes($method, $pathParts);
            break;

        case 'drives':
            require_once __DIR__ . '/routes/drives.php';
            handleDrivesRoutes($method, $pathParts);
            break;

        case 'internships':
            require_once __DIR__ . '/routes/internships.php';
            handleInternshipsRoutes($method, $pathParts);
            break;

        case 'alumni':
            require_once __DIR__ . '/routes/alumni.php';
            handleAlumniRoutes($method, $pathParts);
            break;

        case 'placements':
            require_once __DIR__ . '/routes/placements.php';
            handlePlacementsRoutes($method, $pathParts);
            break;

        case 'upload':
            require_once __DIR__ . '/routes/upload.php';
            handleUploadRoutes($method, $pathParts);
            break;

        case 'exams':
            require_once __DIR__ . '/routes/competitiveExams.php';
            handleExamsRoutes($method, $pathParts);
            break;

        case 'off-campus-placements':
            require_once __DIR__ . '/routes/offCampusPlacements.php';
            handleOffCampusPlacementRoutes($method, $pathParts);
            break;

        default:
            jsonError("Route not found: '$resource' (Path: " . implode('/', $pathParts) . ")", 404);
    }
} catch (Throwable $e) {
    error_log('Server error: ' . $e->getMessage());
    jsonError(
        'Internal server error',
        500,
        ['message' => $e->getMessage()] // Only in development
    );
}

// Flush output buffer
// ob_end_flush();
