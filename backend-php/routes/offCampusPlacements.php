<?php
/**
 * Off-Campus Placement Routes
 * Handles off-campus placement endpoints
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../services/OffCampusPlacementService.php';
require_once __DIR__ . '/../services/StorageService.php';

$placementService = null;

function getPlacementService(): OffCampusPlacementService
{
    global $placementService;
    if ($placementService === null) {
        $placementService = new OffCampusPlacementService();
    }
    return $placementService;
}

/**
 * POST /api/off-campus-placements
 * Create off-campus placement (alumni/student)
 */
function handleCreatePlacement(): void
{
    // Allow students to add their placements (they will becoming alumni soon)
    if (!authWithRole('alumni', 'student', 'admin')) {
        return;
    }

    $authUser = getAuthUser();

    // Handle multipart/form-data for file upload
    $body = $_POST;

    // Validate required fields
    $requiredFields = ['alumniName', 'graduationYear', 'companyName', 'companyLocation', 'jobRole', 'joiningDate', 'employmentType'];
    $missing = [];
    foreach ($requiredFields as $field) {
        if (!isset($body[$field]) || empty($body[$field])) {
            $missing[] = $field;
        }
    }

    if (!empty($missing)) {
        jsonError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    // Validate file upload
    if (!isset($_FILES['companyIdCard']) || $_FILES['companyIdCard']['error'] === UPLOAD_ERR_NO_FILE) {
        jsonError('Company ID card is required', 400);
    }

    try {
        // Upload company ID card
        $storageService = new StorageService();
        $file = $_FILES['companyIdCard'];

        // Validate file type
        $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        if (!in_array($file['type'], $allowedTypes)) {
            jsonError('Invalid file type. Only JPG, PNG, and PDF files are allowed.', 400);
        }

        // Validate file size (5MB max)
        $maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if ($file['size'] > $maxSize) {
            jsonError('File size exceeds 5MB limit', 400);
        }

        // Upload file
        $uploadResult = $storageService->uploadFile(
            $file,
            'company-id-cards',
            $authUser['uid'] . '_' . time()
        );

        // Create placement record
        $placementData = [
            'userId' => $authUser['uid'],
            'alumniName' => $body['alumniName'],
            'graduationYear' => $body['graduationYear'],
            'companyName' => $body['companyName'],
            'companyLocation' => $body['companyLocation'],
            'jobRole' => $body['jobRole'],
            'package' => isset($body['package']) && !empty($body['package']) ? floatval($body['package']) : null,
            'joiningDate' => $body['joiningDate'],
            'employmentType' => $body['employmentType'],
            'companyIdCardUrl' => $uploadResult['url'],
            'companyIdCardPath' => $uploadResult['path']
        ];

        $placement = getPlacementService()->createPlacement($placementData);

        jsonResponse([
            'message' => 'Off-campus placement created successfully',
            'placement' => $placement
        ], 201);

    } catch (Exception $e) {
        error_log('Create placement error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to create placement', 500);
    }
}

/**
 * GET /api/off-campus-placements
 * Get all placements (admin only)
 */
function handleGetAllPlacements(): void
{
    if (!authWithRole('admin')) {
        return;
    }

    try {
        $placements = getPlacementService()->getAllPlacements();
        jsonResponse(['placements' => $placements]);
    } catch (Exception $e) {
        error_log('Get placements error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch placements', 500);
    }
}

/**
 * GET /api/off-campus-placements/my-placements
 * Get current user's placements (alumni/student)
 */
function handleGetMyPlacements(): void
{
    if (!authWithRole('alumni', 'student', 'admin')) {
        return;
    }

    $authUser = getAuthUser();

    try {
        $placements = getPlacementService()->getPlacementsByAlumni($authUser['uid']);
        jsonResponse(['placements' => $placements]);
    } catch (Exception $e) {
        error_log('Get my placements error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch placements', 500);
    }
}

/**
 * PUT /api/off-campus-placements/:id
 * Update placement (owner or admin only)
 */
function handleUpdatePlacement(string $id): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();
    $body = getJsonBody();

    try {
        $placement = getPlacementService()->getPlacementById($id);

        if (!$placement) {
            jsonError('Placement not found', 404);
        }

        // Check authorization
        if ($authUser['role'] !== 'admin' && $placement['userId'] !== $authUser['uid']) {
            jsonError('Access denied', 403);
        }

        getPlacementService()->updatePlacement($id, $body);
        jsonResponse(['message' => 'Placement updated successfully']);

    } catch (Exception $e) {
        error_log('Update placement error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to update placement', 500);
    }
}

/**
 * DELETE /api/off-campus-placements/:id
 * Delete placement (owner or admin only)
 */
function handleDeletePlacement(string $id): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();

    try {
        $placement = getPlacementService()->getPlacementById($id);

        if (!$placement) {
            jsonError('Placement not found', 404);
        }

        // Check authorization
        if ($authUser['role'] !== 'admin' && $placement['userId'] !== $authUser['uid']) {
            jsonError('Access denied', 403);
        }

        // Delete file from storage
        if (isset($placement['companyIdCardPath'])) {
            $storageService = new StorageService();
            $storageService->deleteFile($placement['companyIdCardPath']);
        }

        getPlacementService()->deletePlacement($id);
        jsonResponse(['message' => 'Placement deleted successfully']);

    } catch (Exception $e) {
        error_log('Delete placement error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to delete placement', 500);
    }
}

/**
 * GET /api/off-campus-placements/export-csv
 * Export placements to CSV (admin only)
 */
function handleExportCSV(): void
{
    if (!authWithRole('admin')) {
        return;
    }

    try {
        $csvContent = getPlacementService()->exportToCSV();

        // Set headers for CSV download
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="off-campus-placements_' . date('Y-m-d') . '.csv"');
        header('Pragma: no-cache');
        header('Expires: 0');

        echo $csvContent;
        exit;

    } catch (Exception $e) {
        error_log('Export CSV error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to export CSV', 500);
    }
}

/**
 * Route handler for off-campus placement endpoints
 */
function handleOffCampusPlacementRoutes(string $method, array $pathParts): void
{
    $param1 = $pathParts[2] ?? '';
    $param2 = $pathParts[3] ?? '';

    // GET /api/off-campus-placements/my-placements
    if ($method === 'GET' && $param1 === 'my-placements') {
        handleGetMyPlacements();
        return;
    }

    // GET /api/off-campus-placements/export-csv
    if ($method === 'GET' && $param1 === 'export-csv') {
        handleExportCSV();
        return;
    }

    // GET /api/off-campus-placements (admin only)
    if ($method === 'GET' && $param1 === '') {
        handleGetAllPlacements();
        return;
    }

    // POST /api/off-campus-placements
    if ($method === 'POST' && $param1 === '') {
        handleCreatePlacement();
        return;
    }

    // Routes with ID parameter
    if (!empty($param1) && $param1 !== 'my-placements' && $param1 !== 'export-csv') {
        $id = $param1;

        // PUT /api/off-campus-placements/:id
        if ($method === 'PUT') {
            handleUpdatePlacement($id);
            return;
        }

        // DELETE /api/off-campus-placements/:id
        if ($method === 'DELETE') {
            handleDeletePlacement($id);
            return;
        }
    }

    jsonError('Off-campus placement endpoint not found', 404);
}
