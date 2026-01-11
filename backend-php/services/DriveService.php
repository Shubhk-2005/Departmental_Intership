<?php
/**
 * Drive Service
 * Handles all placement drive related operations
 */

require_once __DIR__ . '/../config/firebase.php';

class DriveService
{
    private $collection = 'drives';

    /**
     * Create a new drive
     */
    public function createDrive(array $driveData): array
    {
        $db = db();
        $now = new DateTime();

        $drive = array_merge($driveData, [
            'createdAt' => $now->format('c')
        ]);

        // Convert deadline to ISO format if it's a string
        if (isset($drive['deadline']) && !is_string($drive['deadline'])) {
            $drive['deadline'] = $drive['deadline']->format('c');
        }

        $docRef = $db->collection($this->collection)->newDocument();
        $docRef->set($drive);

        $drive['id'] = $docRef->id();
        return $drive;
    }

    /**
     * Get all active drives
     */
    public function getActiveDrives(): array
    {
        $db = db();
        $query = $db->collection($this->collection)
            ->where('isActive', '=', true)
            ->orderBy('deadline', 'ASC');

        $documents = $query->documents();

        $drives = [];
        foreach ($documents as $document) {
            if ($document->exists()) {
                $data = $document->data();
                $data['id'] = $document->id();
                $drives[] = $data;
            }
        }

        return $drives;
    }

    /**
     * Get all drives (admin)
     */
    public function getAllDrives(): array
    {
        $db = db();
        $query = $db->collection($this->collection)
            ->orderBy('createdAt', 'DESC');

        $documents = $query->documents();

        $drives = [];
        foreach ($documents as $document) {
            if ($document->exists()) {
                $data = $document->data();
                $data['id'] = $document->id();
                $drives[] = $data;
            }
        }

        return $drives;
    }

    /**
     * Get drive by ID
     */
    public function getDriveById(string $id): ?array
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
     * Update drive
     */
    public function updateDrive(string $id, array $updates): void
    {
        $db = db();

        // Convert deadline if present
        if (isset($updates['deadline']) && $updates['deadline'] instanceof DateTime) {
            $updates['deadline'] = $updates['deadline']->format('c');
        }

        $docRef = $db->collection($this->collection)->document($id);
        $docRef->update($this->formatUpdates($updates));
    }

    /**
     * Delete drive
     */
    public function deleteDrive(string $id): void
    {
        $db = db();
        $docRef = $db->collection($this->collection)->document($id);
        $docRef->delete();
    }

    /**
     * Mark drive as inactive
     */
    public function deactivateDrive(string $id): void
    {
        $this->updateDrive($id, ['isActive' => false]);
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
