@echo off
setlocal enabledelayedexpansion
title SIGAP AI — Server Launcher
chcp 65001 >nul 2>&1

cd /d "%~dp0"

echo =====================================================================
echo    SIGAP AI — Sistem Cerdas Asesmen Kerentanan Pengungsi (PMI)
echo    Production-Grade Automated Launcher for Evaluators & Judges
echo =====================================================================
echo.

:: 1. Cek & Berikan Izin Eksekusi PowerShell / NPM Script
echo [1/6] Memeriksa kebijakan izin eksekusi script Windows...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force -ErrorAction SilentlyContinue } catch {}" >nul 2>&1
echo [✓] Kebijakan eksekusi PowerShell & NPM siap.
echo.

:: 2. Cek Instalasi Node.js & Versi
echo [2/6] Memeriksa runtime Node.js...
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [!] Node.js tidak ditemukan di sistem ini.
    where winget >nul 2>&1
    if !ERRORLEVEL! equ 0 (
        echo [i] Menginstal Node.js LTS secara otomatis via Windows Package Manager (winget)...
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        if !ERRORLEVEL! equ 0 (
            echo [✓] Node.js berhasil diinstal. Memuat ulang path environment...
            call refreshenv >nul 2>&1
        ) else (
            echo [!] Gagal menginstal via winget. Silakan pasang Node.js v18+ dari https://nodejs.org/
            pause
            exit /b 1
        )
    ) else (
        echo [!] Winget tidak tersedia. Silakan unduh dan pasang Node.js LTS (v18+) dari https://nodejs.org/
        start https://nodejs.org/
        pause
        exit /b 1
    )
)

for /f "tokens=1,2,3 delims=.v " %%a in ('node -v 2^>nul') do set NODE_VER_MAJOR=%%a
if not defined NODE_VER_MAJOR (
    echo [!] Gagal membaca versi Node.js.
) else (
    if %NODE_VER_MAJOR% lss 18 (
        echo [!] Versi Node.js terdeteksi v%NODE_VER_MAJOR%. Next.js 15 merekomendasikan Node.js v18.18+ atau v20+.
    ) else (
        for /f "tokens=*" %%v in ('node -v') do echo [✓] Node.js terdeteksi: %%v
    )
)
echo.

:: 3. Cek File Konfigurasi Environment (.env)
echo [3/6] Memeriksa file konfigurasi environment (.env)...
if not exist ".env" (
    if exist ".env.example" (
        echo [i] File .env belum ada. Menyalin dari .env.example...
        copy .env.example .env >nul
        powershell -NoProfile -Command "$sec = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_}); (Get-Content .env) -replace 'AUTH_SECRET=.*', ('AUTH_SECRET=\"' + $sec + '\"') | Set-Content .env" >nul 2>&1
        echo [✓] File .env berhasil dibuat dengan AUTH_SECRET otomatis.
    ) else (
        echo [!] Peringatan: .env dan .env.example tidak ditemukan.
    )
) else (
    echo [✓] File .env ditemukan dan siap digunakan.
)
echo.

:: 4. Cek Dependensi node_modules
echo [4/6] Memeriksa paket dependensi proyek...
if not exist "node_modules" (
    echo [i] Direktori node_modules belum ada. Menjalankan 'npm install'...
    call npm install --no-audit
    if !ERRORLEVEL! neq 0 (
        echo [!] Gagal menginstal dependensi npm.
        pause
        exit /b 1
    )
    echo [✓] Dependensi berhasil diinstal.
) else (
    echo [✓] Dependensi node_modules terpasang.
)
echo.

:: 5. Inisialisasi Prisma ORM Client
echo [5/6] Memeriksa Prisma Client...
call npm run prisma:generate >nul 2>&1
echo [✓] Prisma Client siap.
echo.

:: 6. Bebaskan Port 3000 Jika Sedang Terpakai
echo [6/6] Memeriksa ketersediaan port 3000...
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
timeout /t 1 >nul 2>&1
echo [✓] Port 3000 siap digunakan.
echo.

:: Menjalankan Server Web SIGAP AI
echo =====================================================================
echo    MEMULAI SERVER SIGAP AI (NEXT.JS)...
echo =====================================================================
echo.

if exist ".sigap.pid" del /f /q ".sigap.pid" >nul 2>&1

start "SIGAP AI - Web Server" cmd.exe /k "npm run dev"

echo [i] Menunggu server siap di port 3000...
set /a ATTEMPTS=0
:WAIT_LOOP
set /a ATTEMPTS+=1
timeout /t 2 >nul 2>&1
powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue) -ne $null" | findstr /i "True" >nul 2>&1
if %ERRORLEVEL% equ 0 goto SERVER_READY
if %ATTEMPTS% geq 20 goto SERVER_TIMEOUT
goto WAIT_LOOP

:SERVER_TIMEOUT
echo [!] Server memerlukan waktu lebih lama untuk inisialisasi. Melanjutkan...
goto LAUNCH_BROWSER

:SERVER_READY
powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1 | Out-File -Encoding ascii -FilePath '.sigap.pid'" >nul 2>&1
echo [✓] Server SIGAP AI aktif di http://localhost:3000!

:LAUNCH_BROWSER
echo [i] Membuka web browser...
start http://localhost:3000

cls
echo =====================================================================
echo    SIGAP AI — SERVER SEDANG BERJALAN DENGAN SUKSES!
echo =====================================================================
echo.
echo    Alamat Aplikasi : http://localhost:3000
echo    Alamat Login    : http://localhost:3000/login
echo    Peta Publik     : http://localhost:3000/peta
echo    Lapor Mandiri   : http://localhost:3000/mandiri/POSKO01
echo.
echo  -------------------------------------------------------------------
echo    AKUN PENGUJIAN JURI (PRE-CONFIGURED):
echo  -------------------------------------------------------------------
echo    1. KOORDINATOR / ADMIN (Akses Penuh):
echo       - Username : admin
echo       - Password : admin123
echo       - Fitur    : Dashboard Triase, Verifikasi Medis Kasus Merah,
echo                    Scan QR Korban, Export CSV/XLSX Dinkes, Kelola Posko.
echo.
echo    2. RELAWAN LAPANGAN (Intake & Offline-First):
echo       - Username : relawan
echo       - Password : relawan123
echo       - Fitur    : Ekstraksi Catatan Wawancara (Single & Multi-KK),
echo                    Offline PWA Mode (simpan saat sinyal hilang),
echo                    Auto-Sync ke database saat online kembali.
echo  -------------------------------------------------------------------
echo.
echo    CATATAN:
echo    - Jendela terminal server aktif di latar belakang (title: SIGAP AI - Web Server).
echo    - Untuk mematikan server dengan bersih, cukup jalankan 'stop.bat'.
echo.
echo =====================================================================
echo  Tekan tombol apa saja untuk menutup jendela launcher ini.
echo  (Server SIGAP AI akan tetap berjalan sampai Anda menjalankan stop.bat)
echo =====================================================================
pause >nul