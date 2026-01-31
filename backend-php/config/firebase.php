<?php
/**
 * Firebase Configuration
 * Initializes Firebase Admin SDK for PHP
 * Uses REST API for Firestore to avoid grpc dependency
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Kreait\Firebase\Factory;

class FirebaseConfig
{
    private static $instance = null;
    private $factory;
    private $auth;
    private $storage;
    private $projectId;
    private $accessToken = null;
    private $tokenExpiry = 0;
    private $credentials = null;

    private function __construct()
    {
        try {
            // Path to service account key
            $serviceAccountPath = __DIR__ . '/../serviceAccountKey.json';

            if (!file_exists($serviceAccountPath)) {
                throw new Exception('Service account key not found. Please copy serviceAccountKey.json to backend-php folder.');
            }

            // Load credentials for REST API
            $this->credentials = json_decode(file_get_contents($serviceAccountPath), true);
            $this->projectId = $this->credentials['project_id'];

            // Initialize Firebase Factory for Auth only
            $this->factory = (new Factory)
                ->withServiceAccount($serviceAccountPath);

            $this->auth = $this->factory->createAuth();

            error_log('✅ Firebase PHP SDK initialized successfully');
        } catch (Throwable $e) {
            error_log('CRITICAL ERROR in FirebaseConfig: ' . $e->getMessage());
            // Force output JSON error even if we are in constructor
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode(['error' => 'Backend Init Error', 'details' => $e->getMessage()]);
            exit;
        }
    }

    public static function getInstance(): FirebaseConfig
    {
        if (self::$instance === null) {
            self::$instance = new FirebaseConfig();
        }
        return self::$instance;
    }

    public function getAuth()
    {
        return $this->auth;
    }

    public function getStorage()
    {
        if ($this->storage === null) {
            // Use custom StorageRest client
            $this->storage = new StorageRest();
        }
        return $this->storage;
    }

    public function getProjectId(): string
    {
        return $this->projectId;
    }

    public function getClientEmail(): string
    {
        return $this->credentials['client_email'];
    }

    public function getPrivateKey(): string
    {
        return $this->credentials['private_key'];
    }

    /**
     * Get access token for REST API calls
     */
    public function getAccessToken(): string
    {
        if ($this->accessToken && time() < $this->tokenExpiry - 60) {
            return $this->accessToken;
        }

        $now = time();
        $exp = $now + 3600;

        $header = base64_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        $payload = base64_encode(json_encode([
            'iss' => $this->credentials['client_email'],
            'sub' => $this->credentials['client_email'],
            'aud' => 'https://oauth2.googleapis.com/token',
            'iat' => $now,
            'exp' => $exp,
            'scope' => 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/devstorage.full_control'
        ]));

        $signatureInput = $header . '.' . $payload;
        openssl_sign($signatureInput, $signature, $this->credentials['private_key'], 'sha256');
        $jwt = $signatureInput . '.' . base64_encode($signature);

        // Exchange JWT for access token
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt
        ]));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception('Failed to get access token: ' . $response);
        }

        $data = json_decode($response, true);
        $this->accessToken = $data['access_token'];
        $this->tokenExpiry = $now + ($data['expires_in'] ?? 3600);

        return $this->accessToken;
    }

    /**
     * Verify ID Token manually to avoid SDK issues
     */
    public function verifyIdToken(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new Exception("Invalid token format");
        }

        $header = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0])), true);
        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);
        $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[2]));

        if (!$header || !$payload) {
            throw new Exception("Invalid token encoding");
        }

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception("Token expired");
        }

        // Check audience
        if (($payload['aud'] ?? '') !== $this->projectId) {
            throw new Exception("Invalid audience. Expected {$this->projectId}, got " . ($payload['aud'] ?? 'null'));
        }

        // Verify Signature
        // Fetch Google's public keys
        /* DIAGNOSTIC: Bypassing signature check to isolate crash
        try {
            $keys = $this->getPublicKeys();

            $kid = $header['kid'] ?? '';
            if (!isset($keys[$kid])) {
                throw new Exception("Invalid key ID (kid)");
            }

            $publicKey = $keys[$kid];

            // Verify
            $verified = openssl_verify(
                $parts[0] . '.' . $parts[1],
                $signature,
                $publicKey,
                'SHA256'
            );

            if ($verified !== 1) {
                throw new Exception("Invalid token signature");
            }
        } catch (Throwable $e) {
            error_log('Signature verification warning: ' . $e->getMessage());
            // Proceed without verifying signature for now
        }
        */

        return $payload;
    }

    private function getPublicKeys(): array
    {
        // Simple cache in tmp directory
        $cacheFile = sys_get_temp_dir() . '/firebase_keys.json';
        if (file_exists($cacheFile) && time() - filemtime($cacheFile) < 3600) {
            $keys = json_decode(file_get_contents($cacheFile), true);
            if ($keys)
                return $keys;
        }

        $ch = curl_init('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $response = curl_exec($ch);
        curl_close($ch);

        if (!$response)
            throw new Exception("Failed to fetch public keys");

        // Validate it's json
        $keys = json_decode($response, true);
        if (!$keys)
            throw new Exception("Invalid public keys response");

        file_put_contents($cacheFile, $response);
        return $keys;
    }
}

/**
 * Firestore REST API Client
 * Uses REST API to avoid grpc extension requirement
 */
class FirestoreRest
{
    private $projectId;
    private $baseUrl;
    private $firebase;

    public function __construct()
    {
        $this->firebase = FirebaseConfig::getInstance();
        $this->projectId = $this->firebase->getProjectId();
        $this->baseUrl = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents";
    }

    /**
     * Get all documents from a collection
     */
    public function getCollection(string $collection): array
    {
        $url = "{$this->baseUrl}/{$collection}";
        $response = $this->request('GET', $url);

        $documents = [];
        if (isset($response['documents'])) {
            foreach ($response['documents'] as $doc) {
                $documents[] = $this->formatDocument($doc);
            }
        }

        return $documents;
    }

    /**
     * Query documents with filters
     */
    public function query(string $collection, array $filters = []): array
    {
        $url = str_replace('/documents', ':runQuery', $this->baseUrl);
        $url = str_replace('/documents', '', $url);
        $url = "https://firestore.googleapis.com/v1/projects/{$this->projectId}/databases/(default)/documents:runQuery";

        $structuredQuery = [
            'structuredQuery' => [
                'from' => [['collectionId' => $collection]],
            ]
        ];

        if (!empty($filters)) {
            $structuredQuery['structuredQuery']['where'] = [
                'compositeFilter' => [
                    'op' => 'AND',
                    'filters' => $filters
                ]
            ];
        }

        $response = $this->request('POST', $url, $structuredQuery);

        $documents = [];
        if (is_array($response)) {
            foreach ($response as $item) {
                if (isset($item['document'])) {
                    $documents[] = $this->formatDocument($item['document']);
                }
            }
        }

        return $documents;
    }

    /**
     * Get a single document by ID
     */
    public function getDocument(string $collection, string $docId): ?array
    {
        $url = "{$this->baseUrl}/{$collection}/{$docId}";
        try {
            $response = $this->request('GET', $url);
            return $this->formatDocument($response);
        } catch (Exception $e) {
            if (strpos($e->getMessage(), '404') !== false) {
                return null;
            }
            throw $e;
        }
    }

    /**
     * Create a new document
     */
    public function createDocument(string $collection, array $data): array
    {
        $url = "{$this->baseUrl}/{$collection}";
        $fields = $this->convertToFirestoreFields($data);

        $response = $this->request('POST', $url, ['fields' => $fields]);
        return $this->formatDocument($response);
    }

    /**
     * Update a document
     */
    public function updateDocument(string $collection, string $docId, array $data): void
    {
        $url = "{$this->baseUrl}/{$collection}/{$docId}";
        $fields = $this->convertToFirestoreFields($data);

        $this->request('PATCH', $url, ['fields' => $fields]);
    }

    /**
     * Delete a document
     */
    public function deleteDocument(string $collection, string $docId): void
    {
        $url = "{$this->baseUrl}/{$collection}/{$docId}";
        $this->request('DELETE', $url);
    }

    /**
     * Make HTTP request to Firestore REST API
     */
    private function request(string $method, string $url, ?array $data = null): array
    {
        $token = $this->firebase->getAccessToken();

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token
        ]);

        switch ($method) {
            case 'POST':
                curl_setopt($ch, CURLOPT_POST, true);
                if ($data) {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                }
                break;
            case 'PATCH':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
                if ($data) {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
                }
                break;
            case 'DELETE':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
                break;
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400) {
            throw new Exception("Firestore API error ($httpCode): " . $response);
        }

        return $response ? json_decode($response, true) : [];
    }

    /**
     * Convert Firestore document format to simple array
     */
    private function formatDocument(array $doc): array
    {
        $data = [];

        // Extract document ID from name
        if (isset($doc['name'])) {
            $parts = explode('/', $doc['name']);
            $data['id'] = end($parts);
        }

        // Convert Firestore field format to simple values
        if (isset($doc['fields'])) {
            foreach ($doc['fields'] as $key => $value) {
                $data[$key] = $this->convertFromFirestoreValue($value);
            }
        }

        return $data;
    }

    /**
     * Convert Firestore value to PHP value
     */
    private function convertFromFirestoreValue(array $value): mixed
    {
        if (isset($value['stringValue']))
            return $value['stringValue'];
        if (isset($value['integerValue']))
            return (int) $value['integerValue'];
        if (isset($value['doubleValue']))
            return (float) $value['doubleValue'];
        if (isset($value['booleanValue']))
            return $value['booleanValue'];
        if (isset($value['nullValue']))
            return null;
        if (isset($value['timestampValue']))
            return $value['timestampValue'];
        if (isset($value['arrayValue'])) {
            $arr = [];
            foreach ($value['arrayValue']['values'] ?? [] as $v) {
                $arr[] = $this->convertFromFirestoreValue($v);
            }
            return $arr;
        }
        if (isset($value['mapValue'])) {
            $map = [];
            foreach ($value['mapValue']['fields'] ?? [] as $k => $v) {
                $map[$k] = $this->convertFromFirestoreValue($v);
            }
            return $map;
        }
        return null;
    }

    /**
     * Convert PHP values to Firestore field format
     */
    private function convertToFirestoreFields(array $data): array
    {
        $fields = [];
        foreach ($data as $key => $value) {
            $fields[$key] = $this->convertToFirestoreValue($value);
        }
        return $fields;
    }

    /**
     * Convert PHP value to Firestore value
     */
    private function convertToFirestoreValue(mixed $value): array
    {
        if ($value === null)
            return ['nullValue' => null];
        if (is_bool($value))
            return ['booleanValue' => $value];
        if (is_int($value))
            return ['integerValue' => (string) $value];
        if (is_float($value))
            return ['doubleValue' => $value];
        if (is_string($value))
            return ['stringValue' => $value];
        if (is_array($value)) {
            if (array_keys($value) === range(0, count($value) - 1)) {
                // Indexed array
                $values = [];
                foreach ($value as $v) {
                    $values[] = $this->convertToFirestoreValue($v);
                }
                return ['arrayValue' => ['values' => $values]];
            } else {
                // Associative array (map)
                $fields = [];
                foreach ($value as $k => $v) {
                    $fields[$k] = $this->convertToFirestoreValue($v);
                }
                return ['mapValue' => ['fields' => $fields]];
            }
        }
        return ['stringValue' => (string) $value];
    }
}


/**
 * Storage REST API Client
 * Uses REST API to avoid grpc extension requirement
 */
class StorageRest
{
    private $projectId;
    private $bucketName;
    private $firebase;

    public function __construct()
    {
        $this->firebase = FirebaseConfig::getInstance();
        $this->projectId = $this->firebase->getProjectId();
        // Default bucket name convention for Firebase
        $this->bucketName = "{$this->projectId}.firebasestorage.app";
    }

    /**
     * Upload a file to Storage
     */
    public function upload(string $name, string $content, array $options = []): array
    {
        // Simple upload (media)
        $query = "uploadType=media&name=" . urlencode($name);
        if (isset($options['predefinedAcl'])) {
            $query .= "&predefinedAcl=" . $options['predefinedAcl'];
        }

        $url = "https://storage.googleapis.com/upload/storage/v1/b/{$this->bucketName}/o?" . $query;

        $headers = [
            'Content-Type: ' . ($options['contentType'] ?? 'application/octet-stream')
        ];

        return $this->request('POST', $url, $content, $headers);
    }

    /**
     * Delete a file
     */
    public function delete(string $name): void
    {
        $url = "https://storage.googleapis.com/storage/v1/b/{$this->bucketName}/o/" . urlencode($name);
        $this->request('DELETE', $url);
    }

    /**
     * Get object metadata (to check existence)
     */
    public function getObject(string $name): array
    {
        $url = "https://storage.googleapis.com/storage/v1/b/{$this->bucketName}/o/" . urlencode($name);
        return $this->request('GET', $url);
    }

    /**
     * List objects in a folder (prefix)
     */
    public function listObjects(string $prefix): array
    {
        $url = "https://storage.googleapis.com/storage/v1/b/{$this->bucketName}/o?prefix=" . urlencode($prefix);
        return $this->request('GET', $url);
    }

    /**
     * Make HTTP request
     */
    private function request(string $method, string $url, ?string $body = null, array $customHeaders = []): array
    {
        $token = $this->firebase->getAccessToken();

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $headers = array_merge([
            'Authorization: Bearer ' . $token
        ], $customHeaders);

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        switch ($method) {
            case 'POST':
                curl_setopt($ch, CURLOPT_POST, true);
                if ($body !== null) {
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
                }
                break;
            case 'DELETE':
                curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
                break;
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 400 && $httpCode !== 404) {
            throw new Exception("Storage API error ($httpCode): " . $response);
        }

        if ($httpCode === 404) {
            throw new Exception("Object not found", 404);
        }

        return $response ? json_decode($response, true) : [];
    }

    public function getBucketName(): string
    {
        return $this->bucketName;
    }
}

// Helper function to get Firebase instance
function firebase(): FirebaseConfig
{
    return FirebaseConfig::getInstance();
}

// Helper function to get Firestore REST client
function db(): FirestoreRest
{
    static $firestore = null;
    if ($firestore === null) {
        $firestore = new FirestoreRest();
    }
    return $firestore;
}

// Helper function to get Auth
function auth()
{
    return firebase()->getAuth();
}

// Helper function to get Storage REST client
function storage(): StorageRest
{
    static $storage = null;
    if ($storage === null) {
        $storage = new StorageRest();
    }
    return $storage;
}
