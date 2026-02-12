<?php
/**
 * Cloudinary Configuration
 * Handles Cloudinary SDK initialization and helpers
 */

// Load environment variables from .env file
$envPath = __DIR__ . '/../../.env';

// Debug: log the resolved path
error_log('Cloudinary config: Looking for .env at: ' . realpath($envPath) ?: $envPath);

if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '#') === 0)
            continue; // Skip comments
        if (strpos($line, '=') === false)
            continue; // Skip invalid lines
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        if (!empty($key)) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
    error_log('Cloudinary config: .env file loaded successfully');
} else {
    error_log('Cloudinary config: WARNING - .env file NOT found at: ' . $envPath);
}

// Cloudinary credentials from environment
define('CLOUDINARY_CLOUD_NAME', getenv('CLOUDINARY_CLOUD_NAME') ?: '');
define('CLOUDINARY_API_KEY', getenv('CLOUDINARY_API_KEY') ?: '');
define('CLOUDINARY_API_SECRET', getenv('CLOUDINARY_API_SECRET') ?: '');

// Debug: verify credentials loaded
error_log('Cloudinary config: CLOUD_NAME=' . (CLOUDINARY_CLOUD_NAME ? CLOUDINARY_CLOUD_NAME : '(EMPTY)'));
error_log('Cloudinary config: API_KEY=' . (CLOUDINARY_API_KEY ? substr(CLOUDINARY_API_KEY, 0, 6) . '...' : '(EMPTY)'));
error_log('Cloudinary config: API_SECRET=' . (CLOUDINARY_API_SECRET ? substr(CLOUDINARY_API_SECRET, 0, 4) . '...' : '(EMPTY)'));

/**
 * Get Cloudinary upload URL
 * Use 'raw' resource type to handle PDFs and other non-image files
 */
function cloudinaryUploadUrl(string $resourceType = 'raw'): string
{
    return 'https://api.cloudinary.com/v1_1/' . CLOUDINARY_CLOUD_NAME . '/' . $resourceType . '/upload';
}

/**
 * Get Cloudinary destroy URL (for deleting files)
 */
function cloudinaryDestroyUrl(string $resourceType = 'image'): string
{
    return 'https://api.cloudinary.com/v1_1/' . CLOUDINARY_CLOUD_NAME . '/' . $resourceType . '/destroy';
}

/**
 * Generate Cloudinary signature for authenticated requests
 * 
 * IMPORTANT: Cloudinary requires parameters to be sorted alphabetically,
 * joined as "key=value" pairs separated by "&", with the API secret appended
 * directly (no "&" before the secret). Values must NOT be URL-encoded.
 */
function cloudinarySignature(array $params): string
{
    ksort($params);

    // Build the string to sign manually - DO NOT use http_build_query()
    // because it URL-encodes values, which produces incorrect signatures
    $parts = [];
    foreach ($params as $key => $value) {
        $parts[] = $key . '=' . $value;
    }
    $toSign = implode('&', $parts) . CLOUDINARY_API_SECRET;

    error_log('Cloudinary signature: string to sign = ' . $toSign);

    return sha1($toSign);
}
