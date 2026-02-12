#!/bin/bash
# Start both frontend and backend servers for development

echo "🚀 Starting Internship Portal Development Servers..."
echo ""

# Start PHP backend in background
echo "📦 Starting PHP Backend on http://127.0.0.1:8000..."
cd "$(dirname "$0")/backend-php"
/Applications/XAMPP/xamppfiles/bin/php -S 127.0.0.1:8000 router.php &
PHP_PID=$!
echo "✅ PHP Backend started (PID: $PHP_PID)"
echo ""

# Wait a moment for backend to start
sleep 2

# Start frontend
echo "⚛️  Starting React Frontend on http://localhost:8080..."
cd "$(dirname "$0")/frontend"
npm run dev

# When frontend is stopped (Ctrl+C), also stop backend
echo ""
echo "⏹  Stopping servers..."
kill $PHP_PID 2>/dev/null
echo "✅ Servers stopped"
