<?php
/**
 * Alumni Routes
 * Handles alumni profile endpoints
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../services/AlumniService.php';

$alumniService = null;

function getAlumniService(): AlumniService
{
    global $alumniService;
    if ($alumniService === null) {
        $alumniService = new AlumniService();
    }
    return $alumniService;
}

/**
 * GET /api/alumni
 * Get all public alumni profiles
 */
function handleGetAlumni(): void
{
    try {
        $alumni = getAlumniService()->getPublicAlumni();
        jsonResponse(['alumni' => $alumni]);
    } catch (Exception $e) {
        error_log('Get alumni error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch alumni', 500);
    }
}

/**
 * GET /api/alumni/my-profile
 * Get current user's alumni profile (alumni only)
 */
function handleGetMyProfile(): void
{
    if (!authWithRole('alumni')) {
        return;
    }

    $authUser = getAuthUser();

    try {
        $profile = getAlumniService()->getAlumniByUserId($authUser['uid']);

        if (!$profile) {
            jsonError('Alumni profile not found', 404);
        }

        jsonResponse(['profile' => $profile]);
    } catch (Exception $e) {
        error_log('Get alumni profile error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch profile', 500);
    }
}

/**
 * POST /api/alumni
 * Create alumni profile (alumni only)
 */
function handleCreateAlumniProfile(): void
{
    if (!authWithRole('alumni')) {
        return;
    }

    $body = getJsonBody();

    // Validate required fields
    $missing = validateRequired(['name', 'graduationYear', 'company', 'role']);
    if ($missing) {
        jsonError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    $authUser = getAuthUser();

    try {
        // Check if profile already exists
        $existingProfile = getAlumniService()->getAlumniByUserId($authUser['uid']);
        if ($existingProfile) {
            jsonError('Alumni profile already exists', 400);
        }

        $profile = getAlumniService()->createAlumniProfile([
            'userId' => $authUser['uid'],
            'name' => $body['name'],
            'graduationYear' => $body['graduationYear'],
            'company' => $body['company'],
            'role' => $body['role'],
            'linkedinUrl' => $body['linkedinUrl'] ?? null,
            'isPublic' => $body['isPublic'] ?? true
        ]);

        jsonResponse([
            'message' => 'Alumni profile created successfully',
            'profile' => $profile
        ], 201);

    } catch (Exception $e) {
        error_log('Create alumni profile error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to create profile', 500);
    }
}

/**
 * PUT /api/alumni/:id
 * Update alumni profile (owner or admin only)
 */
function handleUpdateAlumniProfile(string $id): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();
    $body = getJsonBody();

    try {
        $profile = getAlumniService()->getAlumniByUserId($authUser['uid']);

        if (!$profile) {
            jsonError('Alumni profile not found', 404);
        }

        // Check authorization
        if ($authUser['role'] !== 'admin' && $profile['userId'] !== $authUser['uid']) {
            jsonError('Access denied', 403);
        }

        getAlumniService()->updateAlumniProfile($id, $body);
        jsonResponse(['message' => 'Alumni profile updated successfully']);

    } catch (Exception $e) {
        error_log('Update alumni profile error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to update profile', 500);
    }
}

/**
 * DELETE /api/alumni/:id
 * Delete alumni profile (owner or admin only)
 */
function handleDeleteAlumniProfile(string $id): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();

    try {
        $profile = getAlumniService()->getAlumniByUserId($authUser['uid']);

        if (!$profile) {
            jsonError('Alumni profile not found', 404);
        }

        // Check authorization
        if ($authUser['role'] !== 'admin' && $profile['userId'] !== $authUser['uid']) {
            jsonError('Access denied', 403);
        }

        getAlumniService()->deleteAlumniProfile($id);
        jsonResponse(['message' => 'Alumni profile deleted successfully']);

    } catch (Exception $e) {
        error_log('Delete alumni profile error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to delete profile', 500);
    }
}

/**
 * Route handler for alumni endpoints
 */
function handleAlumniRoutes(string $method, array $pathParts): void
{
    $param1 = $pathParts[2] ?? '';

    // GET /api/alumni
    if ($method === 'GET' && $param1 === '') {
        handleGetAlumni();
        return;
    }

    // GET /api/alumni/my-profile
    if ($method === 'GET' && $param1 === 'my-profile') {
        handleGetMyProfile();
        return;
    }

    // POST /api/alumni
    if ($method === 'POST' && $param1 === '') {
        handleCreateAlumniProfile();
        return;
    }

    // Routes with ID parameter
    if (!empty($param1) && $param1 !== 'my-profile') {
        $id = $param1;

        // PUT /api/alumni/:id
        if ($method === 'PUT') {
            handleUpdateAlumniProfile($id);
            return;
        }

        // DELETE /api/alumni/:id
        if ($method === 'DELETE') {
            handleDeleteAlumniProfile($id);
            return;
        }
    }

    jsonError('Alumni endpoint not found', 404);
}
