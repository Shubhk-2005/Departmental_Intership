<?php
/**
 * Authentication Middleware
 * Verifies Firebase ID tokens and extracts user information
 */

require_once __DIR__ . '/../config/firebase.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../services/UserService.php';

// Global variable to store authenticated user
$authenticatedUser = null;

/**
 * Verify Firebase ID token and set authenticated user
 */
function verifyToken(): bool
{
    global $authenticatedUser;

    $token = getBearerToken();

    if (!$token) {
        jsonError('No token provided', 401);
        return false;
    }

    try {
        $auth = auth();
        $verifiedToken = $auth->verifyIdToken($token);

        $uid = $verifiedToken->claims()->get('sub');
        $email = $verifiedToken->claims()->get('email');

        // Get user from Firestore
        $userService = new UserService();
        $user = $userService->getUserById($uid);

        // If user doesn't exist in Firestore, create them
        if (!$user) {
            error_log("Creating user document for $email");

            // Get role from custom claims or default to 'student'
            $role = $verifiedToken->claims()->get('role') ?? 'student';
            $name = $verifiedToken->claims()->get('name') ?? explode('@', $email)[0];

            $user = $userService->createUser([
                'uid' => $uid,
                'email' => $email,
                'name' => $name,
                'role' => $role
            ]);
        }

        $authenticatedUser = [
            'uid' => $user['uid'],
            'email' => $user['email'],
            'role' => $user['role']
        ];

        return true;

    } catch (Exception $e) {
        error_log('Authentication error: ' . $e->getMessage());
        jsonError('Invalid or expired token', 403);
        return false;
    }
}

/**
 * Get the authenticated user
 */
function getAuthUser(): ?array
{
    global $authenticatedUser;
    return $authenticatedUser;
}

/**
 * Check if user has required role
 */
function requireRole(...$allowedRoles): bool
{
    global $authenticatedUser;

    if (!$authenticatedUser) {
        jsonError('Authentication required', 401);
        return false;
    }

    if (!in_array($authenticatedUser['role'], $allowedRoles)) {
        jsonError('Access denied. Required role: ' . implode(' or ', $allowedRoles), 403);
        return false;
    }

    return true;
}

/**
 * Combined middleware: verify token and check role
 */
function authWithRole(...$roles): bool
{
    if (!verifyToken()) {
        return false;
    }

    if (!empty($roles) && !requireRole(...$roles)) {
        return false;
    }

    return true;
}
