<?php
/**
 * Internship Service
 * Handles student internship applications
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
        $db = db();
        $now = new DateTime();

        $internship = array_merge($internshipData, [
            'appliedDate' => $now->format('c')
        ]);

        $docRef = $db->collection($this->collection)->newDocument();
        $docRef->set($internship);

        $internship['id'] = $docRef->id();
        return $internship;
    }

    /**
     * Get all internships for a specific student
     */
    public function getStudentInternships(string $studentId): array
    {
        $db = db();
        $query = $db->collection($this->collection)
            ->where('studentId', '=', $studentId)
            ->orderBy('appliedDate', 'DESC');

        $documents = $query->documents();

        $internships = [];
        foreach ($documents as $document) {
            if ($document->exists()) {
                $data = $document->data();
                $data['id'] = $document->id();
                $internships[] = $data;
            }
        }

        return $internships;
    }

    /**
     * Get all internships (admin only)
     */
    public function getAllInternships(): array
    {
        $db = db();
        $query = $db->collection($this->collection)
            ->orderBy('appliedDate', 'DESC');

        $documents = $query->documents();

        $internships = [];
        foreach ($documents as $document) {
            if ($document->exists()) {
                $data = $document->data();
                $data['id'] = $document->id();
                $internships[] = $data;
            }
        }

        return $internships;
    }

    /**
     * Get internship by ID
     */
    public function getInternshipById(string $id): ?array
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
     * Update internship
     */
    public function updateInternship(string $id, array $updates): void
    {
        $db = db();
        $docRef = $db->collection($this->collection)->document($id);
        $docRef->update($this->formatUpdates($updates));
    }

    /**
     * Delete internship
     */
    public function deleteInternship(string $id): void
    {
        $db = db();
        $docRef = $db->collection($this->collection)->document($id);
        $docRef->delete();
    }

    /**
     * Get internships by status
     */
    public function getInternshipsByStatus(string $studentId, string $status): array
    {
        $db = db();
        $query = $db->collection($this->collection)
            ->where('studentId', '=', $studentId)
            ->where('status', '=', $status)
            ->orderBy('appliedDate', 'DESC');

        $documents = $query->documents();

        $internships = [];
        foreach ($documents as $document) {
            if ($document->exists()) {
                $data = $document->data();
                $data['id'] = $document->id();
                $internships[] = $data;
            }
        }

        return $internships;
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
