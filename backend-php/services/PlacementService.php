<?php
/**
 * Placement Service
 * Handles placement statistics operations using REST API
 */

require_once __DIR__ . '/../config/firebase.php';

class PlacementService
{
    private $collection = 'placement_stats_yearly';

    /**
     * Get all placement statistics
     */
    public function getAllStats(): array
    {
        $firestore = db();
        $stats = $firestore->getCollection($this->collection);

        // Sort by year descending
        usort($stats, function ($a, $b) {
            $yearA = $a['year'] ?? '';
            $yearB = $b['year'] ?? '';
            return strcmp($yearB, $yearA);
        });

        return $stats;
    }

    /**
     * Get latest placement statistics
     */
    public function getLatestStats(): ?array
    {
        $stats = $this->getAllStats();
        return !empty($stats) ? $stats[0] : null;
    }

    /**
     * Get placement statistics by year
     */
    public function getStatsByYear(string $year): ?array
    {
        $firestore = db();
        return $firestore->getDocument($this->collection, $year);
    }

    /**
     * Create or update placement statistics
     */
    public function upsertPlacementStats(array $statsData): void
    {
        $firestore = db();
        $year = $statsData['year'];

        // Check if document exists
        $existing = $firestore->getDocument($this->collection, $year);

        if ($existing) {
            // Update existing document
            $firestore->updateDocument($this->collection, $year, $statsData);
        } else {
            // Create new document with specific ID is not directly supported by our REST API
            // We'll create a workaround by including the year in the document
            $firestore->createDocument($this->collection, $statsData);
        }
    }

    /**
     * Delete placement statistics for a year
     */
    public function deleteStats(string $year): void
    {
        $firestore = db();
        $firestore->deleteDocument($this->collection, $year);
    }
}
