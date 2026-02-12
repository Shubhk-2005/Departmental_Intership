@echo off
setlocal

echo ===================================================
echo    Internship Portal Development Servers (Windows)
echo ===================================================
echo.

:: --- Step 1: Check for PHP ---
where php >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK] PHP found in PATH.
    set PHP_CMD=php
) else (
    echo [INFO] PHP not in PATH. Checking common locations...
    if exist "C:\xampp\php\php.exe" (
        echo [OK] PHP found at C:\xampp\php\php.exe
        set PHP_CMD="C:\xampp\php\php.exe"
    ) else (
        echo [ERROR] PHP not found! Please install XAMPP or add PHP to your PATH.
        pause
        exit /b 1
    )
)

:: --- Step 2: Start Backend ---
echo.
echo [BACKEND] Starting PHP server on http://127.0.0.1:8000...
cd "backend-php"
start "Internship Portal Backend" %PHP_CMD% -S 127.0.0.1:8000 router.php
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start PHP server.
    pause
    exit /b 1
)
cd ..

:: --- Step 3: Start Frontend ---
echo.
echo [FRONTEND] Starting React dev server...
cd "frontend"
echo [INFO] Running 'npm run dev'...
call npm run dev

:: --- Cleanup ---
:: The backend window will remain open. You can close it manually.
echo.
echo [INFO] Frontend server stopped.
echo [INFO] Note: The backend server window is still running. Please close it manually.
pause
