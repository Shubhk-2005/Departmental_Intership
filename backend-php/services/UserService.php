<?php
/**
 * User Service
 * Handles all user-related database operations using REST API
 */

require_once __DIR__ . '/../config/firebase.php';

class UserService
{
    private $collection = 'Users';

    /**
     * Create a new user in Firestore
     */
    public function createUser(array $userData): array
    {
        $firestore = db();
        $now = new DateTime();

        $user = array_merge($userData, [
            'createdAt' => $now->format('c'),
            'updatedAt' => $now->format('c')
        ]);

        // For users, we want to use the uid as the document ID
        // We need to create with specific ID, so we'll use a workaround
        // Create the document and store the uid
        $user['id'] = $userData['uid'];

        // Note: REST API doesn't easily support custom IDs, 
        // but we can work around by using the uid field for lookups
        return $firestore->createDocument($this->collection, $user);
    }

    /**
     * Get user by ID
     */
    public function getUserById(string $uid): ?array
    {
        $firestore = db();

        // First try to get by document ID
        $user = $firestore->getDocument($this->collection, $uid);
        if ($user) {
            return $user;
        }

        // Fallback: search by uid field
        $allUsers = $firestore->getCollection($this->collection);
        foreach ($allUsers as $u) {
            if (isset($u['uid']) && $u['uid'] === $uid) {
                return $u;
            }
        }

        return null;
    }

    /**
     * Update user profile
     */
    public function updateUser(string $uid, array $updates): void
    {
        $firestore = db();
        $updates['updatedAt'] = (new DateTime())->format('c');

        // First find the document
        $user = $this->getUserById($uid);
        if ($user && isset($user['id'])) {
            $firestore->updateDocument($this->collection, $user['id'], $updates);
        }
    }

    /**
     * Get all users by role
     */
    public function getUsersByRole(string $role): array
    {
        $firestore = db();

        // Get all documents and filter client-side
        $allUsers = $firestore->getCollection($this->collection);

        $filtered = array_filter($allUsers, function ($user) use ($role) {
            return isset($user['role']) && $user['role'] === $role;
        });

        return array_values($filtered);
    }

    /**
     * Check if user exists
     */
    public function userExists(string $uid): bool
    {
        $user = $this->getUserById($uid);
        return $user !== null;
    }

    /**
     * Get student user by college email
     * Used during alumni registration to look up and transfer student data
     */
    public function getUserByCollegeEmail(string $collegeEmail): ?array
    {
        $firestore = db();
        $allUsers = $firestore->getCollection($this->collection);

        foreach ($allUsers as $user) {
            // Check the dedicated collegeEmail field first
            if (isset($user['collegeEmail']) && strtolower($user['collegeEmail']) === strtolower($collegeEmail)) {
                return $user;
            }
            // Fallback: check if the primary email IS the college email (original student accounts)
            if (isset($user['email']) && strtolower($user['email']) === strtolower($collegeEmail)) {
                // Only return if role is student (to avoid alumni/admin conflicts)
                if (isset($user['role']) && $user['role'] === 'student') {
                    return $user;
                }
            }
        }

        return null;
    }
}
