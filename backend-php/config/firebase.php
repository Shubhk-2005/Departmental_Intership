<?php
/**
 * Firebase Configuration
 * Initializes Firebase Admin SDK for PHP
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Kreait\Firebase\Factory;
use Kreait\Firebase\ServiceAccount;

class FirebaseConfig
{
    private static $instance = null;
    private $factory;
    private $firestore;
    private $auth;
    private $storage;

    private function __construct()
    {
        // Path to service account key
        $serviceAccountPath = __DIR__ . '/../serviceAccountKey.json';

        if (!file_exists($serviceAccountPath)) {
            throw new Exception('Service account key not found. Please copy serviceAccountKey.json to backend-php folder.');
        }

        // Initialize Firebase Factory
        $this->factory = (new Factory)
            ->withServiceAccount($serviceAccountPath);

        // Initialize services
        $this->firestore = $this->factory->createFirestore();
        $this->auth = $this->factory->createAuth();
        $this->storage = $this->factory->createStorage();

        error_log('✅ Firebase PHP SDK initialized successfully');
    }

    public static function getInstance(): FirebaseConfig
    {
        if (self::$instance === null) {
            self::$instance = new FirebaseConfig();
        }
        return self::$instance;
    }

    public function getFirestore()
    {
        return $this->firestore;
    }

    public function getAuth()
    {
        return $this->auth;
    }

    public function getStorage()
    {
        return $this->storage;
    }

    public function getDatabase()
    {
        return $this->firestore->database();
    }
}

// Helper function to get Firebase instance
function firebase(): FirebaseConfig
{
    return FirebaseConfig::getInstance();
}

// Helper function to get Firestore database
function db()
{
    return firebase()->getDatabase();
}

// Helper function to get Auth
function auth()
{
    return firebase()->getAuth();
}

// Helper function to get Storage
function storage()
{
    return firebase()->getStorage();
}
