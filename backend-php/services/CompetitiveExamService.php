<?php
/**
 * Competitive Exam Service
 * Handles competitive exam score operations using REST API
 */

require_once __DIR__ . '/../config/firebase.php';

class CompetitiveExamService
{
    private $collection = 'competitiveExams';

    /**
     * Create a new exam score
     */
    public function createExam(array $examData): array
    {
        $firestore = db();
        $now = new DateTime();

        $exam = array_merge($examData, [
            'createdAt' => $now->format('c'),
            'updatedAt' => $now->format('c')
        ]);

        return $firestore->createDocument($this->collection, $exam);
    }

    /**
     * Get all exams for a specific user
     */
    public function getExamsByUserId(string $userId): array
    {
        $firestore = db();

        // Get all documents and filter client-side
        $allExams = $firestore->getCollection($this->collection);

        // Filter for user's exams
        $userExams = array_filter($allExams, function ($exam) use ($userId) {
            return isset($exam['userId']) && $exam['userId'] === $userId;
        });

        // Sort by createdAt descending
        usort($userExams, function ($a, $b) {
            $dateA = $a['createdAt'] ?? '';
            $dateB = $b['createdAt'] ?? '';
            return strcmp($dateB, $dateA);
        });

        return array_values($userExams);
    }

    /**
     * Get all student exam scores (admin only)
     * Filters out alumni exams - only returns exams where userRole is 'student'
     */
    public function getStudentExams(): array
    {
        $firestore = db();

        // Get all documents and filter client-side
        $allExams = $firestore->getCollection($this->collection);

        // Filter for student exams only
        $studentExams = array_filter($allExams, function ($exam) {
            return isset($exam['userRole']) && $exam['userRole'] === 'student';
        });

        // Sort by createdAt descending
        usort($studentExams, function ($a, $b) {
            $dateA = $a['createdAt'] ?? '';
            $dateB = $b['createdAt'] ?? '';
            return strcmp($dateB, $dateA);
        });

        return array_values($studentExams);
    }

    /**
     * Get exam by ID
     */
    public function getExamById(string $id): ?array
    {
        $firestore = db();
        return $firestore->getDocument($this->collection, $id);
    }

    /**
     * Update exam score
     */
    public function updateExam(string $id, array $updates): void
    {
        $firestore = db();
        $updates['updatedAt'] = (new DateTime())->format('c');
        $firestore->updateDocument($this->collection, $id, $updates);
    }

    /**
     * Delete exam score
     */
    public function deleteExam(string $id): void
    {
        $firestore = db();
        $firestore->deleteDocument($this->collection, $id);
    }
}
