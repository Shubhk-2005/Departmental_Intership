<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "Starting debug check...<br>";

try {
    echo "Loading firebase.php...<br>";
    require_once __DIR__ . '/config/firebase.php';
    echo "firebase.php loaded.<br>";

    echo "Loading auth.php...<br>";
    require_once __DIR__ . '/middleware/auth.php';
    echo "auth.php loaded.<br>";

    echo "Checking FirebaseConfig instance...<br>";
    $fb = firebase();
    echo "FirebaseConfig instance created.<br>";

    if (method_exists($fb, 'verifyIdToken')) {
        echo "verifyIdToken method exists.<br>";
    } else {
        echo "verifyIdToken method MISSING.<br>";
    }

    echo "Debug check complete. Syntax is likely OK.";

} catch (Throwable $e) {
    echo "CRITICAL ERROR: " . $e->getMessage() . "<br>";
    echo "File: " . $e->getFile() . " on line " . $e->getLine();
}
