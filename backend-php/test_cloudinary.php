<?php
/**
 * Cloudinary Connection Test Script
 * 
 * Run this to verify your Cloudinary credentials and connection are working:
 *   php test_cloudinary.php
 */

ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "======================================\n";
echo "  Cloudinary Connection Test\n";
echo "======================================\n\n";

// Step 1: Load config
echo "[1/5] Loading cloudinary config...\n";
require_once __DIR__ . '/config/cloudinary.php';
echo "  ✓ Config loaded\n\n";

// Step 2: Check credentials
echo "[2/5] Checking credentials...\n";
$cloudName = CLOUDINARY_CLOUD_NAME;
$apiKey = CLOUDINARY_API_KEY;
$apiSecret = CLOUDINARY_API_SECRET;

echo "  Cloud Name: " . ($cloudName ?: '❌ EMPTY') . "\n";
echo "  API Key:    " . ($apiKey ? substr($apiKey, 0, 8) . '...' : '❌ EMPTY') . "\n";
echo "  API Secret: " . ($apiSecret ? substr($apiSecret, 0, 4) . '****' : '❌ EMPTY') . "\n\n";

if (empty($cloudName) || empty($apiKey) || empty($apiSecret)) {
    echo "❌ FAIL: One or more credentials are missing!\n";
    echo "  Check your .env file at: " . realpath(__DIR__ . '/../../.env') . "\n";
    echo "  Make sure these lines exist:\n";
    echo "    CLOUDINARY_CLOUD_NAME=your_cloud_name\n";
    echo "    CLOUDINARY_API_KEY=your_api_key\n";
    echo "    CLOUDINARY_API_SECRET=your_api_secret\n";
    exit(1);
}
echo "  ✓ All credentials present\n\n";

// Step 3: Test signature generation
echo "[3/5] Testing signature generation...\n";
$testParams = [
    'timestamp' => time(),
    'folder' => 'test',
    'public_id' => 'test_connection_' . time(),
];
$signature = cloudinarySignature($testParams);
echo "  Signature: " . substr($signature, 0, 12) . "...\n";
echo "  ✓ Signature generated (length: " . strlen($signature) . ")\n\n";

// Step 4: Test API connectivity (ping Cloudinary)
echo "[4/5] Testing API connectivity...\n";
$uploadUrl = cloudinaryUploadUrl();
echo "  Upload URL: $uploadUrl\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.cloudinary.com/v1_1/$cloudName/resources/image");
curl_setopt($ch, CURLOPT_USERPWD, "$apiKey:$apiSecret");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo "  ❌ FAIL: cURL error — $curlError\n";
    echo "  Possible causes:\n";
    echo "    - No internet connection\n";
    echo "    - SSL certificate issues (try curl_setopt CURLOPT_SSL_VERIFYPEER false)\n";
    echo "    - Firewall blocking outbound HTTPS\n";
    exit(1);
}

echo "  HTTP Status: $httpCode\n";
if ($httpCode === 200) {
    echo "  ✓ API connection successful!\n\n";
} elseif ($httpCode === 401) {
    echo "  ❌ FAIL: Authentication failed (401). Check your API key and secret.\n";
    exit(1);
} else {
    echo "  ⚠ Unexpected status code: $httpCode\n";
    echo "  Response: $response\n\n";
}

// Step 5: Test actual upload with a tiny test file
echo "[5/5] Testing file upload with a small test file...\n";

// Create a temporary test file
$testContent = "Cloudinary upload test - " . date('Y-m-d H:i:s');
$tmpFile = tempnam(sys_get_temp_dir(), 'cloudinary_test_');
file_put_contents($tmpFile, $testContent);

$timestamp = time();
$testPublicId = 'connection_test_' . $timestamp;
$params = [
    'timestamp' => $timestamp,
    'folder' => 'test',
    'public_id' => $testPublicId,
];
$sig = cloudinarySignature($params);

$postData = [
    'file' => new CURLFile($tmpFile, 'text/plain', 'test.txt'),
    'api_key' => $apiKey,
    'timestamp' => $timestamp,
    'folder' => 'test',
    'public_id' => $testPublicId,
    'signature' => $sig,
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, cloudinaryUploadUrl());
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Cleanup temp file
unlink($tmpFile);

if ($curlError) {
    echo "  ❌ FAIL: Upload cURL error — $curlError\n";
    exit(1);
}

$result = json_decode($response, true);

if ($httpCode === 200 && isset($result['secure_url'])) {
    echo "  ✓ Upload successful!\n";
    echo "  URL: " . $result['secure_url'] . "\n";
    echo "  Public ID: " . $result['public_id'] . "\n\n";

    // Clean up: delete the test file from Cloudinary
    echo "  Cleaning up test file...\n";
    $delTimestamp = time();
    $delParams = [
        'public_id' => $result['public_id'],
        'timestamp' => $delTimestamp,
    ];
    $delSig = cloudinarySignature($delParams);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, cloudinaryDestroyUrl());
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, [
        'public_id' => $result['public_id'],
        'api_key' => $apiKey,
        'timestamp' => $delTimestamp,
        'signature' => $delSig,
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $delResponse = curl_exec($ch);
    curl_close($ch);
    echo "  ✓ Test file cleanup done\n\n";
} else {
    echo "  ❌ FAIL: Upload failed (HTTP $httpCode)\n";
    if (isset($result['error'])) {
        echo "  Error: " . $result['error']['message'] . "\n";
    }
    echo "  Full response: $response\n";
    exit(1);
}

echo "======================================\n";
echo "  ✅ ALL TESTS PASSED!\n";
echo "  Cloudinary connection is working.\n";
echo "======================================\n";
