<?php
/**
 * Storage Service
 * Handles Firebase Storage operations for file uploads
 * Uses custom StorageRest client
 */

require_once __DIR__ . '/../config/firebase.php';

class StorageService
{
    private $storage;

    public function __construct()
    {
        $this->storage = storage();
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

        // Upload to Firebase Storage using REST
        // Making file public so it can be viewed by frontend without signed URLs
        $result = $this->storage->upload($storagePath, $content, [
            'contentType' => $file['type'],
            'predefinedAcl' => 'publicRead'
        ]);

        // Get public URL
        $url = $this->getPublicUrl($storagePath);

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
     * For now, returning public URL as we are using publicRead ACL
     */
    public function getSignedUrl(string $path, int $expiresInMinutes = 525600): string
    {
        return $this->getPublicUrl($path);
    }

    /**
     * Get public URL for a file
     */
    public function getPublicUrl(string $path): string
    {
        $bucketName = $this->storage->getBucketName();
        // Allow spaces and special chars in path to be encoded, but slashes should remain
        // Actually, GCS public URLs usually have just path encoded? 
        // Let's safe encode.
        $encodedPath = implode('/', array_map('rawurlencode', explode('/', $path)));
        return "https://storage.googleapis.com/{$bucketName}/{$encodedPath}";
    }

    /**
     * Delete a file from storage
     */
    public function deleteFile(string $path): bool
    {
        try {
            $this->storage->delete($path);
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
        try {
            $this->storage->getObject($path);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * List files in a folder
     */
    public function listFiles(string $folder): array
    {
        try {
            $result = $this->storage->listObjects($folder);
            $files = [];

            if (isset($result['items'])) {
                foreach ($result['items'] as $item) {
                    $files[] = [
                        'name' => $item['name'],
                        'size' => $item['size'] ?? 0,
                        'updated' => $item['updated'] ?? null
                    ];
                }
            }
            return $files;
        } catch (Exception $e) {
            error_log('Error listing files: ' . $e->getMessage());
            return [];
        }
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
