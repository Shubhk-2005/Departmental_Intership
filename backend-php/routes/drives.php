<?php
/**
 * Drives Routes
 * Handles placement drive endpoints
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../services/DriveService.php';

$driveService = null;

function getDriveService(): DriveService
{
    global $driveService;
    if ($driveService === null) {
        $driveService = new DriveService();
    }
    return $driveService;
}

/**
 * GET /api/drives
 * Get all active drives (public)
 */
function handleGetDrives(): void
{
    try {
        $drives = getDriveService()->getActiveDrives();
        jsonResponse(['drives' => $drives]);
    } catch (Exception $e) {
        error_log('Get drives error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch drives', 500);
    }
}

/**
 * GET /api/drives/all
 * Get all drives including inactive (admin only)
 */
function handleGetAllDrives(): void
{
    if (!authWithRole('admin')) {
        return;
    }

    try {
        $drives = getDriveService()->getAllDrives();
        jsonResponse(['drives' => $drives]);
    } catch (Exception $e) {
        error_log('Get all drives error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch drives', 500);
    }
}

/**
 * GET /api/drives/:id
 * Get drive by ID
 */
function handleGetDriveById(string $id): void
{
    try {
        $drive = getDriveService()->getDriveById($id);

        if (!$drive) {
            jsonError('Drive not found', 404);
        }

        jsonResponse(['drive' => $drive]);
    } catch (Exception $e) {
        error_log('Get drive error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch drive', 500);
    }
}

/**
 * POST /api/drives
 * Create a new drive (admin only)
 */
function handleCreateDrive(): void
{
    if (!authWithRole('admin')) {
        return;
    }

    $body = getJsonBody();

    // Validate required fields
    $missing = validateRequired(['companyName', 'role', 'deadline']);
    if ($missing) {
        jsonError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    try {
        $authUser = getAuthUser();

        $drive = getDriveService()->createDrive([
            'companyName' => $body['companyName'],
            'role' => $body['role'],
            'eligibilityCriteria' => $body['eligibilityCriteria'] ?? '',
            'deadline' => $body['deadline'],
            'description' => $body['description'] ?? '',
            'createdBy' => $authUser['uid'],
            'isActive' => $body['isActive'] ?? true
        ]);

        jsonResponse([
            'message' => 'Drive created successfully',
            'drive' => $drive
        ], 201);

    } catch (Exception $e) {
        error_log('Create drive error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to create drive', 500);
    }
}

/**
 * PUT /api/drives/:id
 * Update a drive (admin only)
 */
function handleUpdateDrive(string $id): void
{
    if (!authWithRole('admin')) {
        return;
    }

    $body = getJsonBody();

    try {
        getDriveService()->updateDrive($id, $body);
        jsonResponse(['message' => 'Drive updated successfully']);
    } catch (Exception $e) {
        error_log('Update drive error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to update drive', 500);
    }
}

/**
 * DELETE /api/drives/:id
 * Delete a drive (admin only)
 */
function handleDeleteDrive(string $id): void
{
    if (!authWithRole('admin')) {
        return;
    }

    try {
        getDriveService()->deleteDrive($id);
        jsonResponse(['message' => 'Drive deleted successfully']);
    } catch (Exception $e) {
        error_log('Delete drive error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to delete drive', 500);
    }
}

/**
 * PATCH /api/drives/:id/deactivate
 * Deactivate a drive (admin only)
 */
function handleDeactivateDrive(string $id): void
{
    if (!authWithRole('admin')) {
        return;
    }

    try {
        getDriveService()->deactivateDrive($id);
        jsonResponse(['message' => 'Drive deactivated successfully']);
    } catch (Exception $e) {
        error_log('Deactivate drive error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to deactivate drive', 500);
    }
}

/**
 * Route handler for drives endpoints
 */
function handleDrivesRoutes(string $method, array $pathParts): void
{
    $param1 = $pathParts[2] ?? '';
    $param2 = $pathParts[3] ?? '';

    // GET /api/drives
    if ($method === 'GET' && $param1 === '') {
        handleGetDrives();
        return;
    }

    // GET /api/drives/all
    if ($method === 'GET' && $param1 === 'all') {
        handleGetAllDrives();
        return;
    }

    // POST /api/drives
    if ($method === 'POST' && $param1 === '') {
        handleCreateDrive();
        return;
    }

    // Routes with ID parameter
    if (!empty($param1) && $param1 !== 'all') {
        $id = $param1;

        // GET /api/drives/:id
        if ($method === 'GET' && $param2 === '') {
            handleGetDriveById($id);
            return;
        }

        // PUT /api/drives/:id
        if ($method === 'PUT' && $param2 === '') {
            handleUpdateDrive($id);
            return;
        }

        // DELETE /api/drives/:id
        if ($method === 'DELETE' && $param2 === '') {
            handleDeleteDrive($id);
            return;
        }

        // PATCH /api/drives/:id/deactivate
        if ($method === 'PATCH' && $param2 === 'deactivate') {
            handleDeactivateDrive($id);
            return;
        }
    }

    jsonError('Drives endpoint not found', 404);
}
