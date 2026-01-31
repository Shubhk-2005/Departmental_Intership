<?php
/**
 * Drive Service
 * Handles all placement drive related operations using REST API
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
        $firestore = db();
        $now = new DateTime();

        $drive = array_merge($driveData, [
            'createdAt' => $now->format('c')
        ]);

        // Convert deadline to ISO format if it's a DateTime object
        if (isset($drive['deadline']) && $drive['deadline'] instanceof DateTime) {
            $drive['deadline'] = $drive['deadline']->format('c');
        }

        return $firestore->createDocument($this->collection, $drive);
    }

    /**
     * Get all active drives
     */
    public function getActiveDrives(): array
    {
        $firestore = db();

        // Get all documents and filter client-side
        $allDrives = $firestore->getCollection($this->collection);

        // Filter for active drives
        $activeDrives = array_filter($allDrives, function ($drive) {
            return isset($drive['isActive']) && $drive['isActive'] === true;
        });

        // Sort by deadline ascending
        usort($activeDrives, function ($a, $b) {
            $deadlineA = $a['deadline'] ?? '';
            $deadlineB = $b['deadline'] ?? '';
            return strcmp($deadlineA, $deadlineB);
        });

        return array_values($activeDrives);
    }

    /**
     * Get all drives (admin)
     */
    public function getAllDrives(): array
    {
        $firestore = db();
        $drives = $firestore->getCollection($this->collection);

        // Sort by createdAt descending
        usort($drives, function ($a, $b) {
            $createdA = $a['createdAt'] ?? '';
            $createdB = $b['createdAt'] ?? '';
            return strcmp($createdB, $createdA);
        });

        return $drives;
    }

    /**
     * Get drive by ID
     */
    public function getDriveById(string $id): ?array
    {
        $firestore = db();
        return $firestore->getDocument($this->collection, $id);
    }

    /**
     * Update drive
     */
    public function updateDrive(string $id, array $updates): void
    {
        $firestore = db();

        // Convert deadline if present
        if (isset($updates['deadline']) && $updates['deadline'] instanceof DateTime) {
            $updates['deadline'] = $updates['deadline']->format('c');
        }

        $firestore->updateDocument($this->collection, $id, $updates);
    }

    /**
     * Delete drive
     */
    public function deleteDrive(string $id): void
    {
        $firestore = db();
        $firestore->deleteDocument($this->collection, $id);
    }

    /**
     * Mark drive as inactive
     */
    public function deactivateDrive(string $id): void
    {
        $this->updateDrive($id, ['isActive' => false]);
    }
}
