<?php
/**
 * Alumni Service
 * Handles alumni profile operations using REST API
 */

require_once __DIR__ . '/../config/firebase.php';

class AlumniService
{
    private $collection = 'alumniProfiles';

    /**
     * Create a new alumni profile
     */
    public function createAlumniProfile(array $profileData): array
    {
        $firestore = db();
        $now = new DateTime();

        $profile = array_merge($profileData, [
            'createdAt' => $now->format('c')
        ]);

        return $firestore->createDocument($this->collection, $profile);
    }

    /**
     * Get all public alumni profiles
     */
    public function getPublicAlumni(): array
    {
        $firestore = db();

        // Get all documents and filter client-side
        // (REST API filtering requires composite indexes in Firestore)
        $allAlumni = $firestore->getCollection($this->collection);

        // Filter for public profiles
        $publicAlumni = array_filter($allAlumni, function ($alumni) {
            return isset($alumni['isPublic']) && $alumni['isPublic'] === true;
        });

        return array_values($publicAlumni);
    }

    /**
     * Get all alumni profiles (admin only)
     */
    public function getAllAlumni(): array
    {
        $firestore = db();
        $allAlumni = $firestore->getCollection($this->collection);

        // Sort by createdAt descending
        usort($allAlumni, function ($a, $b) {
            $dateA = $a['createdAt'] ?? '';
            $dateB = $b['createdAt'] ?? '';
            return strcmp($dateB, $dateA);
        });

        return $allAlumni;
    }

    /**
     * Search alumni profiles
     */
    public function searchAlumni(string $query): array
    {
        $firestore = db();
        $allAlumni = $firestore->getCollection($this->collection);

        // Filter for public profiles that match search query
        $filtered = array_filter($allAlumni, function ($alumni) use ($query) {
            if (!isset($alumni['isPublic']) || $alumni['isPublic'] !== true) {
                return false;
            }

            $query = strtolower($query);
            $name = strtolower($alumni['name'] ?? '');
            $company = strtolower($alumni['company'] ?? '');
            $role = strtolower($alumni['role'] ?? '');
            $year = $alumni['graduationYear'] ?? '';

            return strpos($name, $query) !== false ||
                strpos($company, $query) !== false ||
                strpos($role, $query) !== false ||
                strpos($year, $query) !== false;
        });

        return array_values($filtered);
    }

    /**
     * Get alumni profile by user ID
     */
    public function getAlumniByUserId(string $userId): ?array
    {
        $firestore = db();

        // Get all documents and filter client-side
        $allAlumni = $firestore->getCollection($this->collection);

        foreach ($allAlumni as $alumni) {
            if (isset($alumni['userId']) && $alumni['userId'] === $userId) {
                return $alumni;
            }
        }

        return null;
    }

    /**
     * Get alumni profile by ID
     */
    public function getAlumniById(string $id): ?array
    {
        $firestore = db();
        return $firestore->getDocument($this->collection, $id);
    }

    /**
     * Update alumni profile
     */
    public function updateAlumniProfile(string $id, array $updates): void
    {
        $firestore = db();
        $firestore->updateDocument($this->collection, $id, $updates);
    }

    /**
     * Delete alumni profile
     */
    public function deleteAlumniProfile(string $id): void
    {
        $firestore = db();
        $firestore->deleteDocument($this->collection, $id);
    }
}
