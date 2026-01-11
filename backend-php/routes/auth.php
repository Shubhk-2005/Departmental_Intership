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

        default:
            jsonError('Auth endpoint not found', 404);
    }
}
