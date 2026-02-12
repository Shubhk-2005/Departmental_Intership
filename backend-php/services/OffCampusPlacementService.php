<?php
/**
 * Off-Campus Placement Service
 * Handles off-campus placement operations using REST API
 */

require_once __DIR__ . '/../config/firebase.php';

class OffCampusPlacementService
{
    private $collection = 'offCampusPlacements';

    /**
     * Create a new off-campus placement record
     */
    public function createPlacement(array $placementData): array
    {
        $firestore = db();
        $now = new DateTime();

        $placement = array_merge($placementData, [
            'submittedAt' => $now->format('c'),
            'status' => 'approved' // Auto-approve as per requirements
        ]);

        return $firestore->createDocument($this->collection, $placement);
    }

    /**
     * Get all off-campus placements (admin only)
     */
    public function getAllPlacements(): array
    {
        $firestore = db();
        $placements = $firestore->getCollection($this->collection);

        // Sort by submission date descending
        usort($placements, function ($a, $b) {
            $dateA = $a['submittedAt'] ?? '';
            $dateB = $b['submittedAt'] ?? '';
            return strcmp($dateB, $dateA);
        });

        return $placements;
    }

    /**
     * Get placements by alumni user ID
     */
    public function getPlacementsByAlumni(string $userId): array
    {
        $firestore = db();
        $allPlacements = $firestore->getCollection($this->collection);

        // Filter for specific user
        $userPlacements = array_filter($allPlacements, function ($placement) use ($userId) {
            return isset($placement['userId']) && $placement['userId'] === $userId;
        });

        // Sort by submission date descending
        usort($userPlacements, function ($a, $b) {
            $dateA = $a['submittedAt'] ?? '';
            $dateB = $b['submittedAt'] ?? '';
            return strcmp($dateB, $dateA);
        });

        return array_values($userPlacements);
    }

    /**
     * Get placement by ID
     */
    public function getPlacementById(string $id): ?array
    {
        $firestore = db();
        return $firestore->getDocument($this->collection, $id);
    }

    /**
     * Update placement
     */
    public function updatePlacement(string $id, array $updates): void
    {
        $firestore = db();
        $firestore->updateDocument($this->collection, $id, $updates);
    }

    /**
     * Delete placement
     */
    public function deletePlacement(string $id): void
    {
        $firestore = db();
        $firestore->deleteDocument($this->collection, $id);
    }

    /**
     * Export placements to CSV format
     * Returns CSV content as string
     */
    public function exportToCSV(): string
    {
        $placements = $this->getAllPlacements();

        // CSV headers
        $headers = [
            'Alumni Name',
            'Graduation Year',
            'Company Name',
            'Company Location',
            'Job Role',
            'Package (LPA)',
            'Joining Date',
            'Employment Type',
            'Company ID Card URL',
            'Submission Date',
            'Status'
        ];

        // Start CSV content
        $csv = [];
        $csv[] = $headers;

        // Add data rows
        foreach ($placements as $placement) {
            $csv[] = [
                $placement['alumniName'] ?? '',
                $placement['graduationYear'] ?? '',
                $placement['companyName'] ?? '',
                $placement['companyLocation'] ?? '',
                $placement['jobRole'] ?? '',
                $placement['package'] ?? 'N/A',
                $placement['joiningDate'] ?? '',
                $placement['employmentType'] ?? '',
                $placement['companyIdCardUrl'] ?? '',
                $placement['submittedAt'] ?? '',
                $placement['status'] ?? 'approved'
            ];
        }

        // Convert to CSV string
        $output = fopen('php://temp', 'r+');
        foreach ($csv as $row) {
            fputcsv($output, $row);
        }
        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        return $csvContent;
    }
}
