<?php
/**
 * Storage Service
 * Handles file uploads to Cloudinary
 */

require_once __DIR__ . '/../config/cloudinary.php';

class StorageService
{
    /**
     * Upload a file to Cloudinary
     * 
     * @param array $file - $_FILES array element
     * @param string $folder - Folder path in Cloudinary (e.g., 'resumes', 'profile-photos')
     * @param string|null $customName - Optional custom public_id
     * @return array - Upload result with url and path
     */
    public function uploadFile(array $file, string $folder, ?string $customName = null): array
    {
        // Validate file
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('File upload error: ' . $this->getUploadErrorMessage($file['error']));
        }

        // Validate credentials are loaded
        if (empty(CLOUDINARY_CLOUD_NAME) || empty(CLOUDINARY_API_KEY) || empty(CLOUDINARY_API_SECRET)) {
            error_log('StorageService: Cloudinary credentials are missing!');
            error_log('  CLOUD_NAME: ' . (CLOUDINARY_CLOUD_NAME ?: '(empty)'));
            error_log('  API_KEY: ' . (CLOUDINARY_API_KEY ?: '(empty)'));
            error_log('  API_SECRET: ' . (CLOUDINARY_API_SECRET ?: '(empty)'));
            throw new Exception('Cloudinary credentials not configured. Check .env file.');
        }

        // Generate public_id
        $publicId = $customName ?? uniqid() . '_' . time();

        // Determine resource type based on file type
        // Images use 'image', everything else (PDFs, docs) uses 'raw'
        $isImage = strpos($file['type'], 'image/') === 0;
        $resourceType = $isImage ? 'image' : 'raw';

        // Prepare upload parameters (only params that need to be signed)
        // NOTE: resource_type is NOT signed - it's only in the URL and POST data
        $timestamp = time();
        $params = [
            'timestamp' => $timestamp,
            'folder' => $folder,
            'public_id' => $publicId,
        ];

        // Generate signature
        $signature = cloudinarySignature($params);

        // Log upload attempt with file details
        error_log("StorageService: Uploading file '{$file['name']}' (type: {$file['type']}) as resource_type '$resourceType' to folder '$folder' with public_id '$publicId'");
        error_log("StorageService: File size = " . $file['size'] . " bytes, tmp_name = " . $file['tmp_name']);
        error_log("StorageService: File exists in temp? " . (file_exists($file['tmp_name']) ? 'YES' : 'NO'));

        // Read file content and encode as base64 data URI
        // This is more reliable than CURLFile with PHP's built-in server
        $fileContent = file_get_contents($file['tmp_name']);
        if ($fileContent === false || strlen($fileContent) === 0) {
            throw new Exception('Failed to read uploaded file content');
        }

        $base64Content = base64_encode($fileContent);
        $dataUri = 'data:' . $file['type'] . ';base64,' . $base64Content;

        error_log("StorageService: File content read = " . strlen($fileContent) . " bytes, base64 length = " . strlen($base64Content));
        error_log("StorageService: Upload URL = " . cloudinaryUploadUrl($resourceType));

        // Prepare POST data with base64 data URI instead of CURLFile
        $postData = [
            'file' => $dataUri,
            'api_key' => CLOUDINARY_API_KEY,
            'timestamp' => $timestamp,
            'folder' => $folder,
            'public_id' => $publicId,
            'signature' => $signature,
        ];

        // Upload to Cloudinary using cURL
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, cloudinaryUploadUrl($resourceType));
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60); // 60 second timeout

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        // Log response for debugging
        error_log("StorageService: HTTP response code = $httpCode");
        error_log("StorageService: Response body = " . ($response ?: '(empty)'));

        if ($curlError) {
            error_log("StorageService: cURL error = $curlError");
            throw new Exception('Cloudinary upload failed: ' . $curlError);
        }

        $result = json_decode($response, true);

        if ($httpCode !== 200 || isset($result['error'])) {
            $errorMessage = $result['error']['message'] ?? 'Unknown Cloudinary error';
            error_log('StorageService: Cloudinary error: ' . $errorMessage);
            error_log('StorageService: Full error response: ' . $response);
            throw new Exception('Cloudinary upload failed: ' . $errorMessage);
        }

        // Check the actual file size uploaded to Cloudinary
        $uploadedBytes = $result['bytes'] ?? 0;
        error_log("StorageService: Upload successful! URL = " . ($result['secure_url'] ?? 'N/A'));
        error_log("StorageService: Cloudinary reports file size = $uploadedBytes bytes");

        if ($uploadedBytes === 0) {
            error_log("StorageService: WARNING - Cloudinary received 0 bytes! File was uploaded empty!");
        }

        return [
            'path' => $result['public_id'] ?? ($folder . '/' . $publicId),
            'url' => $result['secure_url'] ?? $result['url'],
            'originalName' => $file['name'],
            'size' => $file['size'],
            'type' => $file['type'],
            'cloudinaryId' => $result['public_id'] ?? null,
        ];
    }

    /**
     * Get public URL for a file (Cloudinary URLs are already public)
     */
    public function getPublicUrl(string $path): string
    {
        // For Cloudinary, the path is the public_id
        // We can construct the URL, but it's better to store the full URL
        // Use 'raw' for PDFs and other files, 'image' for images
        return 'https://res.cloudinary.com/' . CLOUDINARY_CLOUD_NAME . '/raw/upload/' . $path;
    }

    /**
     * Get signed URL (Cloudinary URLs are public by default)
     */
    public function getSignedUrl(string $path, int $expiresInMinutes = 525600): string
    {
        return $this->getPublicUrl($path);
    }

    /**
     * Delete a file from Cloudinary
     */
    public function deleteFile(string $publicId): bool
    {
        try {
            // Determine resource type from the path
            // PDFs and documents are stored as 'raw', images as 'image'
            // Check if path contains typical PDF/document indicators
            $resourceType = 'raw'; // Default to raw for off-campus placement docs

            $timestamp = time();
            $params = [
                'public_id' => $publicId,
                'timestamp' => $timestamp,
            ];

            $signature = cloudinarySignature($params);

            $postData = [
                'public_id' => $publicId,
                'api_key' => CLOUDINARY_API_KEY,
                'timestamp' => $timestamp,
                'signature' => $signature,
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, cloudinaryDestroyUrl($resourceType));
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $response = curl_exec($ch);
            curl_close($ch);

            $result = json_decode($response, true);
            return isset($result['result']) && $result['result'] === 'ok';

        } catch (Exception $e) {
            error_log('Error deleting file from Cloudinary: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if a file exists (not directly supported by Cloudinary, returns true)
     */
    public function fileExists(string $path): bool
    {
        // Cloudinary doesn't have a simple "exists" check via REST
        // For now, assume it exists if we have a path
        return !empty($path);
    }

    /**
     * List files in a folder (limited support in Cloudinary free tier)
     */
    public function listFiles(string $folder): array
    {
        // Cloudinary Admin API requires higher tier for listing
        // Return empty for now
        return [];
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
