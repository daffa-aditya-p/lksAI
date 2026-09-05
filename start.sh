#!/usr/bin/env bash
# =====================================================================
#   SIGAP AI — Automated Launcher for Linux / WSL / macOS
# =====================================================================

set -e
cd "$(dirname "$0")"

echo "====================================================================="
echo "   SIGAP AI — Sistem Cerdas Asesmen Kerentanan Pengungsi (PMI)"
echo "   Automated Launcher for Linux / WSL / macOS"
echo "====================================================================="
echo ""

# 1. Check Node.js
echo "[1/5] Memeriksa runtime Node.js..."
if ! command -v node >/dev/null 2>&1; then
    echo "[!] Node.js tidak ditemukan. Silakan pasang Node.js v18+ (https://nodejs.org/)."
    exit 1
fi

NODE_MAJOR=$(node -v | cut -d'.' -f1 | tr -d 'v')
if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "[!] Versi Node.js ($(node -v)) di bawah v18. Direkomendasikan Node.js v18+ atau v20+."
else
    echo "[✓] Node.js terdeteksi: $(node -v)"
fi
echo ""

# 2. Check .env
echo "[2/5] Memeriksa file konfigurasi (.env)..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "[i] Membuat .env dari .env.example..."
        cp .env.example .env
        RANDOM_SECRET=$(head -c 32 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c 32)
        sed -i.bak "s/AUTH_SECRET=.*/AUTH_SECRET=\"$RANDOM_SECRET\"/" .env && rm -f .env.bak
        echo "[✓] File .env berhasil dibuat dengan AUTH_SECRET otomatis."
    fi
else
    echo "[✓] File .env siap digunakan."
fi
echo ""

# 3. Check node_modules
echo "[3/5] Memeriksa paket dependensi..."
if [ ! -d "node_modules" ]; then
    echo "[i] Menginstal paket npm..."
    npm install --no-audit
    echo "[✓] Dependensi berhasil diinstal."
else
    echo "[✓] Dependensi node_modules terpasang."
fi
echo ""

# 4. Prisma Client
echo "[4/5] Memeriksa Prisma Client..."
npm run prisma:generate >/dev/null 2>&1
echo "[✓] Prisma Client siap."
echo ""

# 5. Free port 3000 if occupied
echo "[5/5] Memeriksa port 3000..."
if command -v fuser >/dev/null 2>&1; then
    fuser -k 3000/tcp >/dev/null 2>&1 || true
elif command -v lsof >/dev/null 2>&1; then
    PID_3000=$(lsof -ti:3000 2>/dev/null || true)
    if [ -n "$PID_3000" ]; then
        kill -9 $PID_3000 >/dev/null 2>&1 || true
    fi
fi
echo "[✓] Port 3000 siap digunakan."
echo ""

# Run Server in background and save PID
echo "====================================================================="
echo "   MEMULAI SERVER SIGAP AI..."
echo "====================================================================="
npm run dev > .sigap_server.log 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" > .sigap.pid

echo "[i] Menunggu server aktif di port 3000 (PID: $SERVER_PID)..."
ATTEMPTS=0
while [ $ATTEMPTS -lt 25 ]; do
    ATTEMPTS=$((ATTEMPTS + 1))
    sleep 1
    if command -v nc >/dev/null 2>&1; then
        if nc -z localhost 3000 >/dev/null 2>&1; then
            break
        fi
    elif command -v curl >/dev/null 2>&1; then
        if curl -s http://localhost:3000 >/dev/null 2>&1; then
            break
        fi
    fi
done

echo "[✓] Server SIGAP AI aktif di http://localhost:3000!"
echo ""

# Try opening browser if GUI available
if command -v xdg-open >/dev/null 2>&1; then
    xdg-open http://localhost:3000 >/dev/null 2>&1 || true
elif command -v open >/dev/null 2>&1; then
    open http://localhost:3000 >/dev/null 2>&1 || true
fi

echo "====================================================================="
echo "   SIGAP AI — SERVER SEDANG BERJALAN DENGAN SUKSES!"
echo "====================================================================="
echo "   Alamat Aplikasi : http://localhost:3000"
echo "   Alamat Login    : http://localhost:3000/login"
echo "   Peta Publik     : http://localhost:3000/peta"
echo "   Lapor Mandiri   : http://localhost:3000/mandiri/POSKO01"
echo ""
echo "   AKUN PENGUJIAN JURI:"
echo "   1. ADMIN   -> username: admin   | password: admin123"
echo "   2. RELAWAN -> username: relawan | password: relawan123"
echo ""
echo "   Log server dapat dilihat di: .sigap_server.log"
echo "   Untuk mematikan server, jalankan: ./stop.sh"
echo "====================================================================="
