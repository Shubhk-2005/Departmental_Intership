<?php
/**
 * Upload Routes
 * Handles file upload endpoints for Firebase Storage
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../services/StorageService.php';

$storageService = null;

function getStorageService(): StorageService
{
    global $storageService;
    if ($storageService === null) {
        $storageService = new StorageService();
    }
    return $storageService;
}

// Allowed file types
define('ALLOWED_RESUME_TYPES', ['application/pdf']);
define('ALLOWED_IMAGE_TYPES', ['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
define('ALLOWED_DOCUMENT_TYPES', ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']);

// Max file sizes (in bytes)
define('MAX_RESUME_SIZE', 5 * 1024 * 1024);    // 5MB
define('MAX_IMAGE_SIZE', 2 * 1024 * 1024);      // 2MB
define('MAX_DOCUMENT_SIZE', 10 * 1024 * 1024);  // 10MB

/**
 * POST /api/upload/resume
 * Upload resume (PDF only)
 */
function handleUploadResume(): void
{
    if (!verifyToken()) {
        return;
    }

    if (!isset($_FILES['file'])) {
        jsonError('No file uploaded', 400);
    }

    $file = $_FILES['file'];
    $storage = getStorageService();

    // Validate file type
    if (!$storage->validateFileType($file, ALLOWED_RESUME_TYPES)) {
        jsonError('Invalid file type. Only PDF files are allowed for resumes.', 400);
    }

    // Validate file size
    if (!$storage->validateFileSize($file, MAX_RESUME_SIZE)) {
        jsonError('File too large. Maximum size is 5MB.', 400);
    }

    try {
        $authUser = getAuthUser();
        $customName = 'resume_' . $authUser['uid'] . '_' . time();

        $result = $storage->uploadFile($file, 'resumes', $customName);

        jsonResponse([
            'message' => 'Resume uploaded successfully',
            'file' => $result
        ], 201);

    } catch (Exception $e) {
        error_log('Upload resume error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to upload resume', 500);
    }
}

/**
 * POST /api/upload/profile-photo
 * Upload profile photo
 */
function handleUploadProfilePhoto(): void
{
    if (!verifyToken()) {
        return;
    }

    if (!isset($_FILES['file'])) {
        jsonError('No file uploaded', 400);
    }

    $file = $_FILES['file'];
    $storage = getStorageService();

    // Validate file type
    if (!$storage->validateFileType($file, ALLOWED_IMAGE_TYPES)) {
        jsonError('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.', 400);
    }

    // Validate file size
    if (!$storage->validateFileSize($file, MAX_IMAGE_SIZE)) {
        jsonError('File too large. Maximum size is 2MB.', 400);
    }

    try {
        $authUser = getAuthUser();
        $customName = 'profile_' . $authUser['uid'] . '_' . time();

        $result = $storage->uploadFile($file, 'profile-photos', $customName);

        jsonResponse([
            'message' => 'Profile photo uploaded successfully',
            'file' => $result
        ], 201);

    } catch (Exception $e) {
        error_log('Upload profile photo error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to upload profile photo', 500);
    }
}

/**
 * POST /api/upload/document
 * Upload general document
 */
function handleUploadDocument(): void
{
    if (!verifyToken()) {
        return;
    }

    if (!isset($_FILES['file'])) {
        jsonError('No file uploaded', 400);
    }

    $file = $_FILES['file'];
    $storage = getStorageService();

    // Validate file type
    if (!$storage->validateFileType($file, ALLOWED_DOCUMENT_TYPES)) {
        jsonError('Invalid file type. Allowed types: PDF, JPEG, PNG, DOC, DOCX.', 400);
    }

    // Validate file size
    if (!$storage->validateFileSize($file, MAX_DOCUMENT_SIZE)) {
        jsonError('File too large. Maximum size is 10MB.', 400);
    }

    try {
        $authUser = getAuthUser();
        $customName = 'doc_' . $authUser['uid'] . '_' . time();

        $result = $storage->uploadFile($file, 'documents', $customName);

        jsonResponse([
            'message' => 'Document uploaded successfully',
            'file' => $result
        ], 201);

    } catch (Exception $e) {
        error_log('Upload document error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to upload document', 500);
    }
}

/**
 * DELETE /api/upload/:path
 * Delete uploaded file
 */
function handleDeleteFile(string $path): void
{
    if (!verifyToken()) {
        return;
    }

    // Decode the path (it might be URL encoded)
    $path = urldecode($path);

    try {
        $storage = getStorageService();

        // Check if file exists
        if (!$storage->fileExists($path)) {
            jsonError('File not found', 404);
        }

        $deleted = $storage->deleteFile($path);

        if ($deleted) {
            jsonResponse(['message' => 'File deleted successfully']);
        } else {
            jsonError('Failed to delete file', 500);
        }

    } catch (Exception $e) {
        error_log('Delete file error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to delete file', 500);
    }
}

/**
 * GET /api/upload/list/:folder
 * List files in a folder
 */
function handleListFiles(string $folder): void
{
    if (!authWithRole('admin')) {
        return;
    }

    try {
        $storage = getStorageService();
        $files = $storage->listFiles($folder);

        jsonResponse(['files' => $files]);

    } catch (Exception $e) {
        error_log('List files error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to list files', 500);
    }
}

/**
 * Route handler for upload endpoints
 */
function handleUploadRoutes(string $method, array $pathParts): void
{
    $action = $pathParts[2] ?? '';
    $param = $pathParts[3] ?? '';

    // POST endpoints
    if ($method === 'POST') {
        switch ($action) {
            case 'resume':
                handleUploadResume();
                return;
            case 'profile-photo':
                handleUploadProfilePhoto();
                return;
            case 'document':
                handleUploadDocument();
                return;
        }
    }

    // DELETE /api/upload/:path
    if ($method === 'DELETE' && !empty($action)) {
        // Reconstruct the full path from remaining parts
        $fullPath = implode('/', array_slice($pathParts, 2));
        handleDeleteFile($fullPath);
        return;
    }

    // GET /api/upload/list/:folder
    if ($method === 'GET' && $action === 'list' && !empty($param)) {
        handleListFiles($param);
        return;
    }

    jsonError('Upload endpoint not found', 404);
}
