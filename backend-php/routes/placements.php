<?php
/**
 * Placements Routes
 * Handles placement statistics endpoints
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../services/PlacementService.php';

$placementService = null;

function getPlacementService(): PlacementService
{
    global $placementService;
    if ($placementService === null) {
        $placementService = new PlacementService();
    }
    return $placementService;
}

/**
 * GET /api/placements/stats
 * Get all placement statistics (public)
 */
function handleGetAllStats(): void
{
    try {
        $stats = getPlacementService()->getAllStats();
        jsonResponse(['stats' => $stats]);
    } catch (Exception $e) {
        error_log('Get placement stats error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch placement stats', 500);
    }
}

/**
 * GET /api/placements/stats/latest
 * Get latest placement statistics (public)
 */
function handleGetLatestStats(): void
{
    try {
        $stats = getPlacementService()->getLatestStats();

        if (!$stats) {
            jsonError('No placement stats found', 404);
        }

        jsonResponse(['stats' => $stats]);
    } catch (Exception $e) {
        error_log('Get latest stats error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch latest stats', 500);
    }
}

/**
 * GET /api/placements/stats/:year
 * Get placement statistics for a specific year (public)
 */
function handleGetStatsByYear(string $year): void
{
    try {
        $stats = getPlacementService()->getStatsByYear($year);

        if (!$stats) {
            jsonError('Stats not found for this year', 404);
        }

        jsonResponse(['stats' => $stats]);
    } catch (Exception $e) {
        error_log('Get stats by year error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch stats', 500);
    }
}

/**
 * POST /api/placements/stats
 * Create or update placement statistics (admin only)
 */
function handleCreateStats(): void
{
    if (!authWithRole('admin')) {
        return;
    }

    $body = getJsonBody();

    // Validate required fields
    if (empty($body['year']) || !isset($body['totalStudents']) || !isset($body['placedStudents'])) {
        jsonError('Missing required fields', 400);
    }

    try {
        getPlacementService()->upsertPlacementStats([
            'year' => $body['year'],
            'totalStudents' => $body['totalStudents'],
            'placedStudents' => $body['placedStudents'],
            'highestPackage' => $body['highestPackage'] ?? 0,
            'averagePackage' => $body['averagePackage'] ?? 0,
            'companiesVisited' => $body['companiesVisited'] ?? 0,
            'internshipsCompleted' => $body['internshipsCompleted'] ?? 0
        ]);

        jsonResponse(['message' => 'Placement stats saved successfully'], 201);

    } catch (Exception $e) {
        error_log('Save placement stats error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to save placement stats', 500);
    }
}

/**
 * DELETE /api/placements/stats/:year
 * Delete placement statistics for a year (admin only)
 */
function handleDeleteStats(string $year): void
{
    if (!authWithRole('admin')) {
        return;
    }

    try {
        getPlacementService()->deleteStats($year);
        jsonResponse(['message' => 'Placement stats deleted successfully']);
    } catch (Exception $e) {
        error_log('Delete stats error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to delete stats', 500);
    }
}

/**
 * Route handler for placements endpoints
 */
function handlePlacementsRoutes(string $method, array $pathParts): void
{
    $param1 = $pathParts[2] ?? '';
    $param2 = $pathParts[3] ?? '';

    // All placement routes are under /stats
    if ($param1 !== 'stats') {
        jsonError('Placements endpoint not found', 404);
        return;
    }

    // GET /api/placements/stats
    if ($method === 'GET' && $param2 === '') {
        handleGetAllStats();
        return;
    }

    // POST /api/placements/stats
    if ($method === 'POST' && $param2 === '') {
        handleCreateStats();
        return;
    }

    // GET /api/placements/stats/latest
    if ($method === 'GET' && $param2 === 'latest') {
        handleGetLatestStats();
        return;
    }

    // Routes with year parameter
    if (!empty($param2) && $param2 !== 'latest') {
        $year = $param2;

        // GET /api/placements/stats/:year
        if ($method === 'GET') {
            handleGetStatsByYear($year);
            return;
        }

        // DELETE /api/placements/stats/:year
        if ($method === 'DELETE') {
            handleDeleteStats($year);
            return;
        }
    }

    jsonError('Placements endpoint not found', 404);
}
