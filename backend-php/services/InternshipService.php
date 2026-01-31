<?php
/**
 * Internship Service
 * Handles student internship applications using REST API
 */

require_once __DIR__ . '/../config/firebase.php';

class InternshipService
{
    private $collection = 'internships';

    /**
     * Create a new internship application
     */
    public function createInternship(array $internshipData): array
    {
        $firestore = db();
        $now = new DateTime();

        $internship = array_merge($internshipData, [
            'appliedDate' => $now->format('c')
        ]);

        return $firestore->createDocument($this->collection, $internship);
    }

    /**
     * Get all internships for a specific student
     */
    public function getStudentInternships(string $studentId): array
    {
        $firestore = db();

        // Get all documents and filter client-side
        $allInternships = $firestore->getCollection($this->collection);

        // Filter for student's internships
        $studentInternships = array_filter($allInternships, function ($internship) use ($studentId) {
            return isset($internship['studentId']) && $internship['studentId'] === $studentId;
        });

        // Sort by appliedDate descending
        usort($studentInternships, function ($a, $b) {
            $dateA = $a['appliedDate'] ?? '';
            $dateB = $b['appliedDate'] ?? '';
            return strcmp($dateB, $dateA);
        });

        return array_values($studentInternships);
    }

    /**
     * Get all internships (admin only)
     */
    public function getAllInternships(): array
    {
        $firestore = db();
        $internships = $firestore->getCollection($this->collection);

        // Sort by appliedDate descending
        usort($internships, function ($a, $b) {
            $dateA = $a['appliedDate'] ?? '';
            $dateB = $b['appliedDate'] ?? '';
            return strcmp($dateB, $dateA);
        });

        return $internships;
    }

    /**
     * Get internship by ID
     */
    public function getInternshipById(string $id): ?array
    {
        $firestore = db();
        return $firestore->getDocument($this->collection, $id);
    }

    /**
     * Update internship
     */
    public function updateInternship(string $id, array $updates): void
    {
        $firestore = db();
        $firestore->updateDocument($this->collection, $id, $updates);
    }

    /**
     * Delete internship
     */
    public function deleteInternship(string $id): void
    {
        $firestore = db();
        $firestore->deleteDocument($this->collection, $id);
    }

    /**
     * Get internships by status
     */
    public function getInternshipsByStatus(string $studentId, string $status): array
    {
        $firestore = db();

        // Get all documents and filter client-side
        $allInternships = $firestore->getCollection($this->collection);

        // Filter for student's internships with specific status
        $filtered = array_filter($allInternships, function ($internship) use ($studentId, $status) {
            return isset($internship['studentId']) && $internship['studentId'] === $studentId
                && isset($internship['status']) && $internship['status'] === $status;
        });

        // Sort by appliedDate descending
        usort($filtered, function ($a, $b) {
            $dateA = $a['appliedDate'] ?? '';
            $dateB = $b['appliedDate'] ?? '';
            return strcmp($dateB, $dateA);
        });

        return array_values($filtered);
    }
}
