<?php
/**
 * Storage Service
 * Handles Firebase Storage operations for file uploads
 */

require_once __DIR__ . '/../config/firebase.php';

class StorageService
{
    private $bucket;

    public function __construct()
    {
        $storage = storage();
        $this->bucket = $storage->getBucket();
    }

    /**
     * Upload a file to Firebase Storage
     * 
     * @param array $file - $_FILES array element
     * @param string $folder - Folder path in storage (e.g., 'resumes', 'profile-photos')
     * @param string|null $customName - Optional custom filename
     * @return array - Upload result with url and path
     */
    public function uploadFile(array $file, string $folder, ?string $customName = null): array
    {
        // Validate file
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('File upload error: ' . $this->getUploadErrorMessage($file['error']));
        }

        // Generate filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = $customName ?? uniqid() . '_' . time();
        $storagePath = $folder . '/' . $filename . '.' . $extension;

        // Read file content
        $content = file_get_contents($file['tmp_name']);

        // Upload to Firebase Storage
        $object = $this->bucket->upload($content, [
            'name' => $storagePath,
            'metadata' => [
                'contentType' => $file['type'],
                'metadata' => [
                    'originalName' => $file['name'],
                    'uploadedAt' => (new DateTime())->format('c')
                ]
            ]
        ]);

        // Generate signed URL (valid for 1 year)
        $url = $this->getSignedUrl($storagePath);

        return [
            'path' => $storagePath,
            'url' => $url,
            'originalName' => $file['name'],
            'size' => $file['size'],
            'type' => $file['type']
        ];
    }

    /**
     * Get a signed URL for a file
     */
    public function getSignedUrl(string $path, int $expiresInMinutes = 525600): string
    {
        $object = $this->bucket->object($path);

        $url = $object->signedUrl(
            new DateTime('+' . $expiresInMinutes . ' minutes'),
            ['version' => 'v4']
        );

        return $url;
    }

    /**
     * Get public URL for a file (if bucket is public)
     */
    public function getPublicUrl(string $path): string
    {
        $bucketName = $this->bucket->name();
        return "https://storage.googleapis.com/{$bucketName}/{$path}";
    }

    /**
     * Delete a file from storage
     */
    public function deleteFile(string $path): bool
    {
        try {
            $object = $this->bucket->object($path);
            $object->delete();
            return true;
        } catch (Exception $e) {
            error_log('Error deleting file: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if a file exists
     */
    public function fileExists(string $path): bool
    {
        $object = $this->bucket->object($path);
        return $object->exists();
    }

    /**
     * List files in a folder
     */
    public function listFiles(string $folder): array
    {
        $objects = $this->bucket->objects(['prefix' => $folder . '/']);

        $files = [];
        foreach ($objects as $object) {
            $files[] = [
                'name' => $object->name(),
                'size' => $object->info()['size'] ?? 0,
                'updated' => $object->info()['updated'] ?? null
            ];
        }

        return $files;
    }

    /**
     * Get upload error message
     */
    private function getUploadErrorMessage(int $errorCode): string
    {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'A PHP extension stopped the file upload'
        ];

        return $errors[$errorCode] ?? 'Unknown upload error';
    }

    /**
     * Validate file type
     */
    public function validateFileType(array $file, array $allowedTypes): bool
    {
        return in_array($file['type'], $allowedTypes);
    }

    /**
     * Validate file size
     */
    public function validateFileSize(array $file, int $maxSizeBytes): bool
    {
        return $file['size'] <= $maxSizeBytes;
    }
}
