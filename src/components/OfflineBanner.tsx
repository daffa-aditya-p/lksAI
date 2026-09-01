"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { countPendingIntake } from "@/lib/idb";
import { runSyncNow } from "@/lib/syncClient";
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload } from "lucide-react";

/**
 * Banner status koneksi + sinkronisasi antrian offline.
 * - Offline  : banner kuning, data akan disimpan lokal.
 * - Online   : jika ada antrian, auto-sync (fallback utk browser tanpa
 *              Background Sync; SW tetap jalur utama saat app tertutup).
 * - Selesai  : konfirmasi hijau sebentar.
 */
export default function OfflineBanner() {
  const [mounted, setMounted] = useState(false);
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; s: string } | null>(null);

  const refreshPending = useCallback(async () => {
    try {
      setPending(await countPendingIntake());
    } catch {
      setPending(0);
    }
  }, []);

  const sync = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const { synced, failed } = await runSyncNow();
      await refreshPending();
      if (synced > 0) {
        setMsg({ t: "ok", s: `${synced} data intake tersinkron` });
      } else if (failed > 0) {
        setMsg({ t: "err", s: `${failed} data gagal disinkronkan` });
      }
    } catch (e) {
      setMsg({ t: "err", s: "Gagal sinkron. Cek koneksi." });
    } finally {
      setSyncing(false);
      setTimeout(() => setMsg(null), 4000);
    }
  }, [syncing, refreshPending]);

  const syncRef = useRef(sync);
  useEffect(() => {
    syncRef.current = sync;
  }, [sync]);

  const refreshPendingRef = useRef(refreshPending);
  useEffect(() => {
    refreshPendingRef.current = refreshPending;
  }, [refreshPending]);

  useEffect(() => {
    setMounted(true);
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const onOnline = () => {
      setOnline(true);
      setMsg(null);
      // Browser tanpa Background Sync: coba langsung saat koneksi pulih.
      syncRef.current();
    };
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    // SW memberi tahu saat antrian berubah / sync selesai.
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "PENDING_CHANGED") refreshPendingRef.current();
      if (e.data?.type === "SYNC_DONE") {
        refreshPendingRef.current();
        setMsg({ t: "ok", s: `${e.data.saved ?? 0} data tersinkron` });
        setTimeout(() => setMsg(null), 4000);
      }
    };
    navigator.serviceWorker?.addEventListener("message", onMsg);

    refreshPendingRef.current();

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      navigator.serviceWorker?.removeEventListener("message", onMsg);
    };
  }, []);

  if (!mounted || (online && pending === 0 && !msg)) return null;

  const bg = !online
    ? "bg-amber-50 border-amber-200 text-amber-800"
    : syncing
      ? "bg-sky-50 border-sky-200 text-sky-800"
      : msg?.t === "ok"
        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
        : "bg-slate-50 border-slate-200 text-slate-700";

  return (
    <div className={`fixed bottom-3 left-1/2 z-50 w-[92%] max-w-md -translate-x-1/2 rounded-xl border px-4 py-2.5 text-sm shadow-lg ${bg}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {!online ? (
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : syncing ? (
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
          ) : msg?.t === "ok" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          ) : (
            <CloudUpload className="h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span className="font-medium">
            {!online
              ? "Mode offline — data akan tersimpan lokal & sync otomatis"
              : syncing
                ? `Menyinkronkan ${pending} data...`
                : msg
                  ? msg.s
                  : `${pending} data menunggu sinkron`}
          </span>
        </div>
        {!syncing && pending > 0 && (
          <button
            onClick={sync}
            className="shrink-0 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-700"
          >
            Sync
          </button>
        )}
      </div>
    </div>
  );
}
