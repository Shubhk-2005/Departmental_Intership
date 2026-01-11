<?php
/**
 * Response Helper Functions
 * Standardize JSON responses across all endpoints
 */

/**
 * Send a JSON success response
 */
function jsonResponse($data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit();
}

/**
 * Send a JSON error response
 */
function jsonError(string $message, int $statusCode = 500, ?array $details = null): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json');

    $response = ['error' => $message];
    if ($details !== null) {
        $response['details'] = $details;
    }

    echo json_encode($response, JSON_PRETTY_PRINT);
    exit();
}

/**
 * Get JSON body from request
 */
function getJsonBody(): array
{
    $body = file_get_contents('php://input');
    $data = json_decode($body, true);
    return $data ?? [];
}

/**
 * Get specific field from JSON body with optional default
 */
function getBodyField(string $field, $default = null)
{
    $body = getJsonBody();
    return $body[$field] ?? $default;
}

/**
 * Validate required fields in request body
 */
function validateRequired(array $requiredFields): ?array
{
    $body = getJsonBody();
    $missing = [];

    foreach ($requiredFields as $field) {
        if (!isset($body[$field]) || $body[$field] === '') {
            $missing[] = $field;
        }
    }

    if (!empty($missing)) {
        return $missing;
    }

    return null;
}

/**
 * Get path parameter from URL
 */
function getPathParam(int $index): ?string
{
    global $pathParts;
    return $pathParts[$index] ?? null;
}

/**
 * Check if request method matches
 */
function isMethod(string $method): bool
{
    return $_SERVER['REQUEST_METHOD'] === strtoupper($method);
}

/**
 * Get HTTP request method
 */
function getMethod(): string
{
    return $_SERVER['REQUEST_METHOD'];
}

/**
 * Get Authorization header
 */
function getAuthHeader(): ?string
{
    $headers = getallheaders();
    return $headers['Authorization'] ?? $headers['authorization'] ?? null;
}

/**
 * Get Bearer token from Authorization header
 */
function getBearerToken(): ?string
{
    $authHeader = getAuthHeader();

    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        return null;
    }

    return substr($authHeader, 7);
}
