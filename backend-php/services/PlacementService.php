<?php
/**
 * Placement Service
 * Handles placement statistics operations
 */

require_once __DIR__ . '/../config/firebase.php';

class PlacementService
{
    private $collection = 'placementStats';

    /**
     * Get all placement statistics
     */
    public function getAllStats(): array
    {
        $db = db();
        $query = $db->collection($this->collection)
            ->orderBy('year', 'DESC');

        $documents = $query->documents();

        $stats = [];
        foreach ($documents as $document) {
            if ($document->exists()) {
                $data = $document->data();
                $data['id'] = $document->id();
                $stats[] = $data;
            }
        }

        return $stats;
    }

    /**
     * Get latest placement statistics
     */
    public function getLatestStats(): ?array
    {
        $db = db();
        $query = $db->collection($this->collection)
            ->orderBy('year', 'DESC')
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
     * Get placement statistics by year
     */
    public function getStatsByYear(string $year): ?array
    {
        $db = db();
        $docRef = $db->collection($this->collection)->document($year);
        $snapshot = $docRef->snapshot();

        if (!$snapshot->exists()) {
            return null;
        }

        $data = $snapshot->data();
        $data['id'] = $snapshot->id();
        return $data;
    }

    /**
     * Create or update placement statistics
     */
    public function upsertPlacementStats(array $statsData): void
    {
        $db = db();
        $year = $statsData['year'];

        $docRef = $db->collection($this->collection)->document($year);
        $docRef->set($statsData, ['merge' => true]);
    }

    /**
     * Delete placement statistics for a year
     */
    public function deleteStats(string $year): void
    {
        $db = db();
        $docRef = $db->collection($this->collection)->document($year);
        $docRef->delete();
    }
}
