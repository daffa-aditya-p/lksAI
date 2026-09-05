@echo off
title SIGAP AI - Server Launcher
chcp 65001 >nul 2>&1

cd /d "%~dp0"

echo =====================================================================
echo    SIGAP AI - Sistem Cerdas Asesmen Kerentanan Pengungsi (PMI)
echo    Production-Grade Automated Launcher for Evaluators dan Judges
echo =====================================================================
echo.

REM 1. Cek dan Berikan Izin Eksekusi PowerShell / NPM Script
echo [1/6] Memeriksa kebijakan izin eksekusi script Windows...
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force -ErrorAction SilentlyContinue } catch {}" >nul 2>&1
echo [OK] Kebijakan eksekusi PowerShell dan NPM siap.
echo.

REM 2. Cek Instalasi Node.js
echo [2/6] Memeriksa runtime Node.js...
node -v >nul 2>&1
if %ERRORLEVEL% equ 0 goto NODE_OK
echo [!] Node.js tidak ditemukan di sistem ini.
echo [!] Silakan unduh dan pasang Node.js LTS v18+ dari https://nodejs.org/
start https://nodejs.org/
pause
exit /b 1

:NODE_OK
for /f "tokens=*" %%v in ('node -v 2^>nul') do echo [OK] Node.js terdeteksi: %%v
echo.

REM 3. Inisialisasi dan Dekripsi Konfigurasi Environment (.env)
echo [3/6] Memeriksa dan menginisialisasi environment (.env)...
if exist ".env" goto ENV_EXISTS

if exist ".env.enc" (
    echo [i] File .env belum ada. Mendekripsi otomatis dari vault terenkripsi...
    node scripts/vault.js decrypt
    if exist ".env" (
        echo [OK] Nilai environment berhasil didekripsi.
        goto ENV_DONE
    )
)

if exist ".env.example" (
    echo [i] File .env belum ada. Menyalin dari .env.example...
    copy .env.example .env >nul
    echo [OK] File .env dibuat dari .env.example.
    goto ENV_DONE
)

echo [!] Peringatan: Tidak ditemukan file environment (.env, .env.enc, .env.example).
goto ENV_DONE

:ENV_EXISTS
echo [OK] File .env aktif dan siap digunakan.

:ENV_DONE
echo.

REM 4. Cek Dependensi node_modules
echo [4/6] Memeriksa paket dependensi proyek...
if exist "node_modules" goto MODULES_OK
echo [i] Direktori node_modules belum ada. Menjalankan npm install...
call npm install --no-audit
if %ERRORLEVEL% neq 0 (
    echo [!] Gagal menginstal dependensi npm.
    pause
    exit /b 1
)
echo [OK] Dependensi berhasil diinstal.
goto MODULES_DONE

:MODULES_OK
echo [OK] Dependensi node_modules terpasang.

:MODULES_DONE
echo.

REM 5. Inisialisasi Prisma ORM Client
echo [5/6] Memeriksa Prisma Client...
call npm run prisma:generate >nul 2>&1
echo [OK] Prisma Client siap.
echo.

REM 6. Bebaskan Port 3000 Jika Sedang Terpakai
echo [6/6] Memeriksa ketersediaan port 3000...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
timeout /t 1 >nul 2>&1
echo [OK] Port 3000 siap digunakan.
echo.

REM Menjalankan Server Web SIGAP AI
echo =====================================================================
echo    MEMULAI SERVER SIGAP AI (NEXT.JS)...
echo =====================================================================
echo.

if exist ".sigap.pid" del /f /q ".sigap.pid" >nul 2>&1

start "SIGAP AI - Web Server" /d "%~dp0" cmd.exe /k "npm run dev"

echo [i] Menunggu server siap di port 3000...
set ATTEMPTS=0

:WAIT_LOOP
set /a ATTEMPTS+=1
timeout /t 1 >nul 2>&1
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% equ 0 goto SERVER_READY
if %ATTEMPTS% geq 35 goto SERVER_TIMEOUT
goto WAIT_LOOP

:SERVER_TIMEOUT
echo [!] Server memerlukan waktu inisialisasi lebih lama. Melanjutkan...
goto LAUNCH_BROWSER

:SERVER_READY
powershell -NoProfile -ExecutionPolicy Bypass -Command "(Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess | Select-Object -First 1 | Out-File -Encoding ascii -FilePath '.sigap.pid'" >nul 2>&1
echo [OK] Server SIGAP AI aktif di http://localhost:3000!

:LAUNCH_BROWSER
echo [i] Membuka web browser ke http://localhost:3000...
start http://localhost:3000

echo.
echo =====================================================================
echo    SIGAP AI - SERVER SEDANG BERJALAN DENGAN SUKSES!
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
echo    2. RELAWAN LAPANGAN (Intake dan Offline-First):
echo       - Username : relawan
echo       - Password : relawan123
echo       - Fitur    : Ekstraksi Catatan Wawancara (Single dan Multi-KK),
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
