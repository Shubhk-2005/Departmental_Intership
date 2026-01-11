<?php
/**
 * Alumni Service
 * Handles alumni profile operations
 */

require_once __DIR__ . '/../config/firebase.php';

class AlumniService
{
    private $collection = 'alumni';

    /**
     * Create a new alumni profile
     */
    public function createAlumniProfile(array $profileData): array
    {
        $db = db();
        $now = new DateTime();

        $profile = array_merge($profileData, [
            'createdAt' => $now->format('c')
        ]);

        $docRef = $db->collection($this->collection)->newDocument();
        $docRef->set($profile);

        $profile['id'] = $docRef->id();
        return $profile;
    }

    /**
     * Get all public alumni profiles
     */
    public function getPublicAlumni(): array
    {
        $db = db();
        $query = $db->collection($this->collection)
            ->where('isPublic', '=', true);

        $documents = $query->documents();

        $alumni = [];
        foreach ($documents as $document) {
            if ($document->exists()) {
                $data = $document->data();
                $data['id'] = $document->id();
                $alumni[] = $data;
            }
        }

        return $alumni;
    }

    /**
     * Get alumni profile by user ID
     */
    public function getAlumniByUserId(string $userId): ?array
    {
        $db = db();
        $query = $db->collection($this->collection)
            ->where('userId', '=', $userId)
            ->limit(1);

        $documents = $query->documents();

        foreach ($documents as $document) {
            if ($document->exists()) {
                $data = $document->data();
                $data['id'] = $document->id();
                return $data;
            }
        }

        return null;
    }

    /**
     * Get alumni profile by ID
     */
    public function getAlumniById(string $id): ?array
    {
        $db = db();
        $docRef = $db->collection($this->collection)->document($id);
        $snapshot = $docRef->snapshot();

        if (!$snapshot->exists()) {
            return null;
        }

        $data = $snapshot->data();
        $data['id'] = $snapshot->id();
        return $data;
    }

    /**
     * Update alumni profile
     */
    public function updateAlumniProfile(string $id, array $updates): void
    {
        $db = db();
        $docRef = $db->collection($this->collection)->document($id);
        $docRef->update($this->formatUpdates($updates));
    }

    /**
     * Delete alumni profile
     */
    public function deleteAlumniProfile(string $id): void
    {
        $db = db();
        $docRef = $db->collection($this->collection)->document($id);
        $docRef->delete();
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
