<?php
/**
 * Auth Routes
 * Handles user authentication endpoints
 */

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../middleware/auth.php';
require_once __DIR__ . '/../services/UserService.php';

/**
 * POST /api/auth/signup
 * Create a new user account
 */
function handleSignup(): void
{
    $body = getJsonBody();

    // Validate required fields
    $missing = validateRequired(['email', 'password', 'name', 'role']);
    if ($missing) {
        jsonError('Missing required fields: ' . implode(', ', $missing), 400);
    }

    try {
        $auth = auth();

        // Create Firebase Auth user
        $userRecord = $auth->createUser([
            'email' => $body['email'],
            'password' => $body['password'],
            'displayName' => $body['name']
        ]);

        // Create user document in Firestore
        $userService = new UserService();
        $user = $userService->createUser([
            'uid' => $userRecord->uid,
            'email' => $body['email'],
            'role' => $body['role'],
            'name' => $body['name'],
            'department' => $body['department'] ?? null,
            'graduationYear' => $body['graduationYear'] ?? null,
            'rollNumber' => $body['rollNumber'] ?? null
        ]);

        jsonResponse([
            'message' => 'User created successfully',
            'user' => [
                'uid' => $user['uid'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role']
            ]
        ], 201);

    } catch (Exception $e) {
        error_log('Signup error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to create user', 500);
    }
}

/**
 * POST /api/auth/login
 * Create custom token for server-side auth
 */
function handleLogin(): void
{
    $body = getJsonBody();

    if (empty($body['uid'])) {
        jsonError('User ID required', 400);
    }

    try {
        $userService = new UserService();
        $user = $userService->getUserById($body['uid']);

        if (!$user) {
            jsonError('User not found', 404);
        }

        // Create custom token
        $auth = auth();
        $customToken = $auth->createCustomToken($body['uid']);

        jsonResponse([
            'user' => [
                'uid' => $user['uid'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role']
            ],
            'customToken' => $customToken->toString()
        ]);

    } catch (Exception $e) {
        error_log('Login error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Login failed', 500);
    }
}

/**
 * GET /api/auth/me
 * Get current user profile
 */
function handleGetMe(): void
{
    if (!verifyToken()) {
        return;
    }

    $authUser = getAuthUser();

    try {
        $userService = new UserService();
        $user = $userService->getUserById($authUser['uid']);

        if (!$user) {
            jsonError('User not found', 404);
        }

        jsonResponse(['user' => $user]);

    } catch (Exception $e) {
        error_log('Get user error: ' . $e->getMessage());
        jsonError($e->getMessage() ?: 'Failed to get user', 500);
    }
}

/**
 * GET /api/auth/lookup-student
 * Look up a student record by college email (used during alumni registration)
 * No auth required — only returns non-sensitive profile data
 */
function handleLookupStudent(): void
{
    $collegeEmail = $_GET['collegeEmail'] ?? '';

    if (empty($collegeEmail)) {
        jsonError('collegeEmail query parameter is required', 400);
        return;
    }

    if (!filter_var($collegeEmail, FILTER_VALIDATE_EMAIL)) {
        jsonError('Invalid email format', 400);
        return;
    }

    try {
        $userService = new UserService();
        $student = $userService->getUserByCollegeEmail($collegeEmail);

        if (!$student) {
            jsonError('No student account found with this college email. Please make sure you are using the email registered in the student portal.', 404);
            return;
        }

        // Return only the fields needed to pre-fill the alumni profile
        jsonResponse([
            'found' => true,
            'student' => [
                'uid' => $student['uid'] ?? $student['id'] ?? null,
                'name' => $student['name'] ?? null,
                'department' => $student['department'] ?? null,
                'graduationYear' => $student['graduationYear'] ?? null,
                'rollNumber' => $student['rollNumber'] ?? null,
                'collegeEmail' => $collegeEmail,
            ]
        ]);

    } catch (Exception $e) {
        error_log('Lookup student error: ' . $e->getMessage());
        jsonError('Failed to look up student record', 500);
    }
}

/**
 * PUT /api/auth/profile
 * Update the authenticated user's profile information
 */
function handleUpdateProfile(): void
{
    if (!verifyToken()) {
        return;
    }
    $authUser = getAuthUser();
    $body = getJsonBody();

    // Whitelist of fields a student can update
    $allowedFields = [
        'name',
        'phone',
        'department',
        'graduationYear',
        'rollNumber',
        'linkedinUrl',
        'githubUrl',
        'skills',
        'bio',
        'address',
        'cgpa',
        'semester',
        'profilePhotoUrl'
    ];

    $updates = [];
    foreach ($allowedFields as $field) {
        if (array_key_exists($field, $body)) {
            $updates[$field] = $body[$field];
        }
    }

    if (empty($updates)) {
        jsonError('No valid fields to update', 400);
        return;
    }

    try {
        $userService = new UserService();
        $userService->updateUser($authUser['uid'], $updates);

        // Re-fetch updated user
        $updatedUser = $userService->getUserById($authUser['uid']);

        jsonResponse([
            'message' => 'Profile updated successfully',
            'user' => $updatedUser
        ]);

    } catch (Exception $e) {
        error_log('Profile update error: ' . $e->getMessage());
        jsonError('Failed to update profile', 500);
    }
}

/**
 * Handle transition from student to alumni
 */
function handleTransitionToAlumni(): void
{
    if (!verifyToken()) {
        return;
    }
    $authUser = getAuthUser();
    $body = getJsonBody();

    $newEmail = $body['newEmail'] ?? '';
    $company = $body['company'] ?? '';
    $jobRole = $body['role'] ?? '';

    if (empty($newEmail) || !filter_var($newEmail, FILTER_VALIDATE_EMAIL)) {
        jsonError('Valid new email is required', 400);
        return;
    }

    try {
        $userService = new UserService();
        $studentData = $userService->getUserById($authUser['uid']);

        if (!$studentData || ($studentData['role'] ?? '') !== 'student') {
            jsonError('User is not a student', 403);
            return;
        }

        $oldCollegeEmail = $studentData['email'] ?? $authUser['email'];

        // 1. Update Firebase Auth Email via Admin SDK (bypasses verification requirement)
        $auth = FirebaseConfig::getInstance()->getAuth();
        $auth->changeUserEmail($authUser['uid'], $newEmail);

        // 2. Update Users document (role to alumni, email)
        $userUpdates = [
            'email' => $newEmail,
            // Keep old college email for reference, or if it already exists, don't overwrite
            'collegeEmail' => $studentData['collegeEmail'] ?? $oldCollegeEmail,
            'role' => 'alumni'
        ];
        $userService->updateUser($authUser['uid'], $userUpdates);

        // 3. Create Alumni Profile Document
        $firestore = db();
        $alumniData = [
            'userId' => $authUser['uid'],
            'name' => $studentData['name'] ?? '',
            'department' => $studentData['department'] ?? '',
            'graduationYear' => $studentData['graduationYear'] ?? '',
            'rollNumber' => $studentData['rollNumber'] ?? '',
            'collegeEmail' => $studentData['collegeEmail'] ?? $oldCollegeEmail,
            'email' => $newEmail,
            'company' => $company,
            'role' => $jobRole,
            'workDomain' => '',
            'isPublic' => true,
            'createdAt' => (new DateTime())->format('c'),
            'profilePhotoUrl' => $studentData['profilePhotoUrl'] ?? ''
        ];
        $firestore->setDocument('alumniProfiles', $authUser['uid'], $alumniData);

        jsonResponse([
            'message' => 'Transition successful',
            'newEmail' => $newEmail
        ]);
    } catch (Exception $e) {
        error_log('Transition error: ' . $e->getMessage());
        jsonError('Failed to transition to alumni: ' . $e->getMessage(), 500);
    }
}

/**
 * Route handler for auth endpoints
 */
function handleAuthRoutes(string $method, array $pathParts): void
{
    $action = $pathParts[2] ?? '';

    switch ($action) {
        case 'signup':
            if ($method === 'POST') {
                handleSignup();
            } else {
                jsonError('Method not allowed', 405);
            }
            break;

        case 'login':
            if ($method === 'POST') {
                handleLogin();
            } else {
                jsonError('Method not allowed', 405);
            }
            break;

        case 'me':
            if ($method === 'GET') {
                handleGetMe();
            } else {
                jsonError('Method not allowed', 405);
            }
            break;

        case 'lookup-student':
            if ($method === 'GET') {
                handleLookupStudent();
            } else {
                jsonError('Method not allowed', 405);
            }
            break;

        case 'profile':
            if ($method === 'PUT') {
                handleUpdateProfile();
            } else {
                jsonError('Method not allowed', 405);
            }
            break;

        case 'transition-to-alumni':
            if ($method === 'POST') {
                handleTransitionToAlumni();
            } else {
                jsonError('Method not allowed', 405);
            }
            break;

        default:
            jsonError('Auth endpoint not found', 404);
    }
}
