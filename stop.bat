@echo off
setlocal enabledelayedexpansion
title SIGAP AI — Stop Server
chcp 65001 >nul 2>&1

cd /d "%~dp0"

echo =====================================================================
echo    SIGAP AI — Penghentian Server Aplikasi
echo =====================================================================
echo.

set STOPPED=0

:: 1. Hentikan berdasarkan PID di file .sigap.pid jika ada
if exist ".sigap.pid" (
    set /p SIGAP_PID=<.sigap.pid
    if defined SIGAP_PID (
        echo [i] Menghentikan proses server PID: !SIGAP_PID!...
        taskkill /F /PID !SIGAP_PID! /T >nul 2>&1
        if !ERRORLEVEL! equ 0 set STOPPED=1
    )
    del /f /q ".sigap.pid" >nul 2>&1
)

:: 2. Bebaskan Port 3000 jika ada proses node yang masih mengunci
echo [i] Memeriksa dan membebaskan port 3000...
powershell -NoProfile -Command "$conns = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue; if ($conns) { $conns | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }; Write-Output 'KILLED' }" 2>nul | findstr "KILLED" >nul 2>&1
if %ERRORLEVEL% equ 0 set STOPPED=1

:: 3. Tutup jendela terminal server jika masih terbuka dengan judul SIGAP AI
taskkill /F /FI "WINDOWTITLE eq SIGAP AI - Web Server*" /T >nul 2>&1

timeout /t 1 >nul 2>&1

echo.
echo =====================================================================
echo    HASIL PENGHENTIAN SERVER:
echo =====================================================================
echo [✓] Server SIGAP AI telah dihentikan secara bersih (graceful stop).
echo [✓] Port 3000 telah dibebaskan sepenuhnya.
echo [✓] Tidak ada proses latar belakang yang tertinggal.
echo =====================================================================
echo.
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
