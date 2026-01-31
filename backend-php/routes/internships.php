<?php
/**
 * Internships Routes
 * Handles student internship application endpoints
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../services/InternshipService.php';

$internshipService = null;

function getInternshipService(): InternshipService
{
    global $internshipService;
    if ($internshipService === null) {
        $internshipService = new InternshipService();
    }
    return $internshipService;
}

/**
 * GET /api/internships
 * Get internships for current user (students see their own, admins see all)
 */
function handleGetInternships(): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();

    try {
        if ($authUser['role'] === 'admin') {
            $internships = getInternshipService()->getAllInternships();
        } else {
            $internships = getInternshipService()->getStudentInternships($authUser['uid']);
        }

        jsonResponse(['internships' => $internships]);
    } catch (Exception $e) {
        error_log('Get internships error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch internships', 500);
    }
}

/**
 * GET /api/internships/:id
 * Get internship by ID (students can only access their own)
 */
function handleGetInternshipById(string $id): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();

    try {
        $internship = getInternshipService()->getInternshipById($id);

        if (!$internship) {
            jsonError('Internship not found', 404);
        }

        // Check authorization
        if ($authUser['role'] !== 'admin' && $internship['studentId'] !== $authUser['uid']) {
            jsonError('Access denied', 403);
        }

        jsonResponse(['internship' => $internship]);
    } catch (Exception $e) {
        error_log('Get internship error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch internship', 500);
    }
}

/**
 * POST /api/internships
 * Create a new internship application
 */
function handleCreateInternship(): void
{
    if (!authWithRole('student', 'admin')) {
        return;
    }

    $body = getJsonBody();

    // Validate required fields
    $missing = validateRequired(['companyName', 'role', 'domain', 'duration', 'status']);
    if ($missing) {
        jsonError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    $authUser = getAuthUser();

    // Get user details for admin visibility
    require_once __DIR__ . '/../services/UserService.php';
    $userService = new UserService();
    $userData = $userService->getUserById($authUser['uid']);

    try {
        $internship = getInternshipService()->createInternship([
            'studentId' => $authUser['uid'],
            'studentName' => $userData['name'] ?? $authUser['email'],
            'studentEmail' => $authUser['email'],
            'companyName' => $body['companyName'],
            'role' => $body['role'],
            'domain' => $body['domain'],
            'duration' => $body['duration'],
            'status' => $body['status'],
            'category' => $body['category'] ?? 'Internship',
            'type' => $body['type'] ?? 'Off-campus',
            'internshipType' => $body['internshipType'] ?? 'Unpaid',
            'stipendAmount' => $body['stipendAmount'] ?? null,
            'stipendCurrency' => $body['stipendCurrency'] ?? null,
            'driveId' => $body['driveId'] ?? null,
            'startDate' => $body['startDate'] ?? null,
            'endDate' => $body['endDate'] ?? null
        ]);

        jsonResponse([
            'message' => 'Internship application created successfully',
            'internship' => $internship
        ], 201);

    } catch (Exception $e) {
        error_log('Create internship error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to create internship', 500);
    }
}

/**
 * PUT /api/internships/:id
 * Update an internship (students can only update their own)
 */
function handleUpdateInternship(string $id): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();
    $body = getJsonBody();

    try {
        $internship = getInternshipService()->getInternshipById($id);

        if (!$internship) {
            jsonError('Internship not found', 404);
        }

        // Check authorization
        if ($authUser['role'] !== 'admin' && $internship['studentId'] !== $authUser['uid']) {
            jsonError('Access denied', 403);
        }

        getInternshipService()->updateInternship($id, $body);
        jsonResponse(['message' => 'Internship updated successfully']);

    } catch (Exception $e) {
        error_log('Update internship error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to update internship', 500);
    }
}

/**
 * DELETE /api/internships/:id
 * Delete an internship (students can only delete their own)
 */
function handleDeleteInternship(string $id): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();

    try {
        $internship = getInternshipService()->getInternshipById($id);

        if (!$internship) {
            jsonError('Internship not found', 404);
        }

        // Check authorization
        if ($authUser['role'] !== 'admin' && $internship['studentId'] !== $authUser['uid']) {
            jsonError('Access denied', 403);
        }

        getInternshipService()->deleteInternship($id);
        jsonResponse(['message' => 'Internship deleted successfully']);

    } catch (Exception $e) {
        error_log('Delete internship error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to delete internship', 500);
    }
}

/**
 * Route handler for internships endpoints
 */
function handleInternshipsRoutes(string $method, array $pathParts): void
{
    $param1 = $pathParts[2] ?? '';

    // GET /api/internships
    if ($method === 'GET' && $param1 === '') {
        handleGetInternships();
        return;
    }

    // POST /api/internships
    if ($method === 'POST' && $param1 === '') {
        handleCreateInternship();
        return;
    }

    // Routes with ID parameter
    if (!empty($param1)) {
        $id = $param1;

        // GET /api/internships/:id
        if ($method === 'GET') {
            handleGetInternshipById($id);
            return;
        }

        // PUT /api/internships/:id
        if ($method === 'PUT') {
            handleUpdateInternship($id);
            return;
        }

        // DELETE /api/internships/:id
        if ($method === 'DELETE') {
            handleDeleteInternship($id);
            return;
        }
    }

    jsonError('Internships endpoint not found', 404);
}
