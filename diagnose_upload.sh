#!/bin/bash

echo "=== Cloudinary PDF Upload Diagnostic ==="
echo ""
echo "This script will help diagnose the empty PDF upload issue"
echo ""

# Check if PHP is available
if ! command -v /Applications/XAMPP/xamppfiles/bin/php &> /dev/null; then
    echo "❌ PHP not found at expected location"
    exit 1
fi

echo "✅ PHP found"
echo ""

# Create a test PDF
TEST_PDF="/tmp/test_upload_$(date +%s).pdf"
cat > "$TEST_PDF" << 'EOF'
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Count 1 /Kids [3 0 R] >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF Content - This should NOT be empty!) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000056 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
317
%%EOF
EOF

echo "📄 Created test PDF at: $TEST_PDF"
echo "📏 File size: $(wc -c < "$TEST_PDF") bytes"
echo ""

# Check PHP temp directory
echo "🔍 Checking PHP configuration..."
/Applications/XAMPP/xamppfiles/bin/php -r "echo 'Upload temp dir: ' . ini_get('upload_tmp_dir') . PHP_EOL; echo 'Max filesize: ' . ini_get('upload_max_filesize') . PHP_EOL;"
echo ""

echo "📋 Recent upload logs from PHP error log:"
tail -20 /Applications/XAMPP/xamppfiles/logs/php_error_log | grep -i "StorageService\|cloudinary\|upload" || echo "No recent upload logs found"
echo ""

echo "💡 NEXT STEPS:"
echo "1. Try uploading a PDF through the web interface"
echo "2. Check the terminal where ./start-dev.sh is running for these log lines:"
echo "   - 'StorageService: File size = XXX bytes'"
echo "   - 'StorageService: Cloudinary reports file size = XXX bytes'"
echo "3. If Cloudinary reports 0 bytes, the issue is in the upload"
echo "4. If Cloudinary reports >0 bytes but file is still empty, it's a viewing issue"
echo ""

# Cleanup
rm "$TEST_PDF"
