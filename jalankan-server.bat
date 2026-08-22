@echo off
title Kebab Rizki - Server & Database Panel
color 0A

echo ============================================================
echo   KEBAB RIZKI - SISTEM KASIR & OPERASIONAL OUTLET
echo   Database: SQLite 3 (kebab_rizki.db)
echo ============================================================
echo.

:: 1. Periksa apakah Node.js terinstall
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js belum terpasang di komputer Anda!
    echo Silakan download dan install Node.js dari: https://nodejs.org
    echo.
    pause
    exit /b
)

:: 2. Periksa apakah node_modules sudah ada
if not exist "node_modules\" (
    echo [INFO] Menyiapkan paket dependensi pertama kali (npm install)...
    call npm install
    echo [INFO] Instalasi dependensi selesai!
    echo.
)

:: 3. Buka browser secara otomatis ke Aplikasi & Panel Database
echo [INFO] Membuka browser ke aplikasi...
start "" "http://localhost:3000"
timeout /t 2 >nul
start "" "http://localhost:3000/panel-database.html"

echo.
echo ============================================================
echo   SERVER BERHASIL DIAKTIFKAN!
echo ============================================================
echo   - Aplikasi Kasir:        http://localhost:3000
echo   - Panel Akses Database:  http://localhost:3000/panel-database.html
echo   - File Database SQLite:  database\kebab_rizki.db
echo ============================================================
echo   Jangan tutup jendela ini selama aplikasi digunakan.
echo   Tekan Ctrl + C untuk mematikan server.
echo ============================================================
echo.

node server.js
pause
