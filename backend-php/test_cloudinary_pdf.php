<?php
/**
 * Test Cloudinary upload to debug empty PDF issue
 */

require_once __DIR__ . '/config/cloudinary.php';
require_once __DIR__ . '/services/StorageService.php';

// Create a test PDF file
$testPdfContent = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000115 00000 n\n0000000214 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n317\n%%EOF";

$tmpFile = tempnam(sys_get_temp_dir(), 'cloudinary_test_');
file_put_contents($tmpFile, $testPdfContent);

echo "Test PDF created at: $tmpFile\n";
echo "File size: " . filesize($tmpFile) . " bytes\n";
echo "File exists: " . (file_exists($tmpFile) ? 'YES' : 'NO') . "\n\n";

// Create a mock $_FILES array
$mockFile = [
    'name' => 'test.pdf',
    'type' => 'application/pdf',
    'tmp_name' => $tmpFile,
    'error' => UPLOAD_ERR_OK,
    'size' => filesize($tmpFile)
];

try {
    echo "Attempting upload to Cloudinary...\n\n";

    $storage = new StorageService();
    $result = $storage->uploadFile($mockFile, 'test-uploads', 'test_pdf_' . time());

    echo "✅ Upload successful!\n";
    echo "URL: " . $result['url'] . "\n";
    echo "Path: " . $result['path'] . "\n";
    echo "Size: " . $result['size'] . " bytes\n";

    // Try to fetch the file and check if it has content
    echo "\nFetching uploaded file to verify content...\n";
    $content = file_get_contents($result['url']);
    echo "Downloaded size: " . strlen($content) . " bytes\n";
    echo "Content starts with %PDF? " . (strpos($content, '%PDF') === 0 ? 'YES ✅' : 'NO ❌') . "\n";

} catch (Exception $e) {
    echo "❌ Upload failed: " . $e->getMessage() . "\n";
}

// Clean up
unlink($tmpFile);
