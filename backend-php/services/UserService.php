<?php
/**
 * User Service
 * Handles all user-related database operations
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
        $db = db();
        $now = new DateTime();

        $user = array_merge($userData, [
            'createdAt' => $now->format('c'),
            'updatedAt' => $now->format('c')
        ]);

        $docRef = $db->collection($this->collection)->document($userData['uid']);
        $docRef->set($user);

        return $user;
    }

    /**
     * Get user by ID
     */
    public function getUserById(string $uid): ?array
    {
        $db = db();
        $docRef = $db->collection($this->collection)->document($uid);
        $snapshot = $docRef->snapshot();

        if (!$snapshot->exists()) {
            return null;
        }

        return $snapshot->data();
    }

    /**
     * Update user profile
     */
    public function updateUser(string $uid, array $updates): void
    {
        $db = db();
        $updates['updatedAt'] = (new DateTime())->format('c');

        $docRef = $db->collection($this->collection)->document($uid);
        $docRef->update($this->formatUpdates($updates));
    }

    /**
     * Get all users by role
     */
    public function getUsersByRole(string $role): array
    {
        $db = db();
        $query = $db->collection($this->collection)->where('role', '=', $role);
        $documents = $query->documents();

        $users = [];
        foreach ($documents as $document) {
            if ($document->exists()) {
                $users[] = $document->data();
            }
        }

        return $users;
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
     * Format updates for Firestore update operation
     */
    private function formatUpdates(array $updates): array
    {
        $formatted = [];
        foreach ($updates as $key => $value) {
            $formatted[] = ['path' => $key, 'value' => $value];
        }
        return $formatted;
    }
}
