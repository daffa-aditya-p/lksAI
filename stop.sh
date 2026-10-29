#!/usr/bin/env bash
# =====================================================================
#   SATU AI — Server Stopper for Linux / WSL / macOS
# =====================================================================

cd "$(dirname "$0")"

echo "====================================================================="
echo "   SATU AI — Menghentikan Server Aplikasi"
echo "====================================================================="

if [ -f ".satu.pid" ]; then
    PID=$(cat .satu.pid)
    if [ -n "$PID" ]; then
        echo "[i] Menghentikan proses server PID: $PID..."
        kill -9 "$PID" >/dev/null 2>&1 || true
    fi
    rm -f .satu.pid
fi

# Kill any process on port 3000
if command -v fuser >/dev/null 2>&1; then
    fuser -k 3000/tcp >/dev/null 2>&1 || true
elif command -v lsof >/dev/null 2>&1; then
    PID_3000=$(lsof -ti:3000 2>/dev/null || true)
    if [ -n "$PID_3000" ]; then
        kill -9 $PID_3000 >/dev/null 2>&1 || true
    fi
fi

# Kill remaining next-server or next dev processes
pkill -f "next dev" >/dev/null 2>&1 || true

echo "[✓] Server SATU AI telah dihentikan secara bersih."
echo "[✓] Port 3000 telah dibebaskan sepenuhnya."
echo "====================================================================="
