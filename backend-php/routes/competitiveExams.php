<?php
/**
 * Competitive Exams Routes
 * Handles competitive exam score endpoints for students and alumni
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../services/CompetitiveExamService.php';

$examService = null;

function getExamService(): CompetitiveExamService
{
    global $examService;
    if ($examService === null) {
        $examService = new CompetitiveExamService();
    }
    return $examService;
}

/**
 * GET /api/exams
 * Get exams for current user (students/alumni see their own)
 */
function handleGetExams(): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();

    try {
        $exams = getExamService()->getExamsByUserId($authUser['uid']);
        jsonResponse(['exams' => $exams]);
    } catch (Exception $e) {
        error_log('Get exams error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch exams', 500);
    }
}

/**
 * GET /api/exams/students
 * Get all student exam scores (admin only)
 */
function handleGetStudentExams(): void
{
    if (!authWithRole('admin')) {
        return;
    }

    try {
        $exams = getExamService()->getStudentExams();
        jsonResponse(['exams' => $exams]);
    } catch (Exception $e) {
        error_log('Get student exams error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch student exams', 500);
    }
}

/**
 * GET /api/exams/:id
 * Get exam by ID (users can only access their own)
 */
function handleGetExamById(string $id): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();

    try {
        $exam = getExamService()->getExamById($id);

        if (!$exam) {
            jsonError('Exam not found', 404);
        }

        // Check authorization
        if ($authUser['role'] !== 'admin' && $exam['userId'] !== $authUser['uid']) {
            jsonError('Access denied', 403);
        }

        jsonResponse(['exam' => $exam]);
    } catch (Exception $e) {
        error_log('Get exam error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to fetch exam', 500);
    }
}

/**
 * POST /api/exams
 * Create a new exam score (students and alumni only)
 */
function handleCreateExam(): void
{
    if (!authWithRole('student', 'alumni')) {
        return;
    }

    $body = getJsonBody();

    // Validate required fields
    $missing = validateRequired(['examType', 'score', 'examDate']);
    if ($missing) {
        jsonError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    $authUser = getAuthUser();

    try {
        $exam = getExamService()->createExam([
            'userId' => $authUser['uid'],
            'userEmail' => $authUser['email'],
            'userRole' => $authUser['role'],
            'examType' => $body['examType'],
            'score' => $body['score'],
            'examDate' => $body['examDate'],
            'validityPeriod' => $body['validityPeriod'] ?? null,
            'scoreReportUrl' => $body['scoreReportUrl'] ?? null
        ]);

        jsonResponse([
            'message' => 'Exam score added successfully',
            'exam' => $exam
        ], 201);

    } catch (Exception $e) {
        error_log('Create exam error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to add exam score', 500);
    }
}

/**
 * PUT /api/exams/:id
 * Update an exam score (users can only update their own)
 */
function handleUpdateExam(string $id): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();
    $body = getJsonBody();

    try {
        $exam = getExamService()->getExamById($id);

        if (!$exam) {
            jsonError('Exam not found', 404);
        }

        // Check authorization
        if ($authUser['role'] !== 'admin' && $exam['userId'] !== $authUser['uid']) {
            jsonError('Access denied', 403);
        }

        // Only allow updating specific fields
        $allowedUpdates = [];
        if (isset($body['examType']))
            $allowedUpdates['examType'] = $body['examType'];
        if (isset($body['score']))
            $allowedUpdates['score'] = $body['score'];
        if (isset($body['examDate']))
            $allowedUpdates['examDate'] = $body['examDate'];
        if (isset($body['validityPeriod']))
            $allowedUpdates['validityPeriod'] = $body['validityPeriod'];
        if (isset($body['scoreReportUrl']))
            $allowedUpdates['scoreReportUrl'] = $body['scoreReportUrl'];

        getExamService()->updateExam($id, $allowedUpdates);
        jsonResponse(['message' => 'Exam score updated successfully']);

    } catch (Exception $e) {
        error_log('Update exam error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to update exam', 500);
    }
}

/**
 * DELETE /api/exams/:id
 * Delete an exam score (users can only delete their own)
 */
function handleDeleteExam(string $id): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();

    try {
        $exam = getExamService()->getExamById($id);

        if (!$exam) {
            jsonError('Exam not found', 404);
        }

        // Check authorization
        if ($authUser['role'] !== 'admin' && $exam['userId'] !== $authUser['uid']) {
            jsonError('Access denied', 403);
        }

        getExamService()->deleteExam($id);
        jsonResponse(['message' => 'Exam score deleted successfully']);

    } catch (Exception $e) {
        error_log('Delete exam error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to delete exam', 500);
    }
}

/**
 * Route handler for exams endpoints
 */
function handleExamsRoutes(string $method, array $pathParts): void
{
    $param1 = $pathParts[2] ?? '';

    // GET /api/exams
    if ($method === 'GET' && $param1 === '') {
        handleGetExams();
        return;
    }

    // GET /api/exams/students (admin only)
    if ($method === 'GET' && $param1 === 'students') {
        handleGetStudentExams();
        return;
    }

    // POST /api/exams
    if ($method === 'POST' && $param1 === '') {
        handleCreateExam();
        return;
    }

    // Routes with ID parameter
    if (!empty($param1) && $param1 !== 'students') {
        $id = $param1;

        // GET /api/exams/:id
        if ($method === 'GET') {
            handleGetExamById($id);
            return;
        }

        // PUT /api/exams/:id
        if ($method === 'PUT') {
            handleUpdateExam($id);
            return;
        }

        // DELETE /api/exams/:id
        if ($method === 'DELETE') {
            handleDeleteExam($id);
            return;
        }
    }

    jsonError('Exams endpoint not found', 404);
}
