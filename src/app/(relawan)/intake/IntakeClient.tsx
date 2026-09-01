"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, LevelBadge, Spinner } from "@/components/ui";
import { useToast } from "@/components/Toast";
import { hitungSkor } from "@/lib/scoring";
import type { ProfilKerentanan, ProvenanceMap } from "@/lib/types";
import { 
  UserCheck, 
  AlertTriangle, 
  Users, 
  User, 
  Plus, 
  Trash2, 
  CheckCheck, 
  Mic,
  FileEdit,
  ChevronDown,
  Info,
  X
} from "lucide-react";
import { simpanKasusTerkonfirmasi } from "@/app/actions/kasus";
import type { KonfirmasiInput } from "@/lib/kasusSchema";
import { savePendingIntake } from "@/lib/idb";
import { registerBackgroundSync, notifySwPendingChanged } from "@/lib/syncClient";

const CONTOH_SINGLE = [
  {
    label: "Lansia & Diabetes",
    text: "Bapak Slamet Riyadi, usia 64 tahun, asal Kampung Cibadak. Mengalami sakit gula. Kaki lemas tidak bisa jalan. Tidak bawa obat.",
  },
  {
    label: "Ibu Hamil",
    text: "Bu Rina, 34 tahun, hamil 8 bulan, datang sama anak 2 tahun. Suami hilang belum ketemu. Tidak bawa apa-apa dari rumah.",
  },
  {
    label: "Lansia & Balita",
    text: "Bu Siti, 67 tahun, diabetes, tinggal sendiri, bawa cucu 8 bulan, rumahnya habis kena longsor, tidak bawa obat sama sekali.",
  },
];

const CONTOH_MULTI = [
  {
    label: "Rombongan Pikap (3 KK)",
    text: "Rombongan pikap evakuasi dari Kampung Babakan:\n1) Bapak Joko Riyadi 54 tahun, luka terbuka di kaki, istri sakit stroke lumpuh butuh tandu, bawa 1 anak balita 3 tahun. Tidak ada obat sama sekali.\n2) Ibu Rina 32 tahun, hamil 8 bulan bersama anak 5 tahun, mandiri tapi butuh logistik & vitamin.\n3) Kakek Sukri 71 tahun, tinggal sebatang kara, riwayat diabetes berat, tanpa persediaan obat sama sekali.",
  },
  {
    label: "Laporan RT 03 (2 KK)",
    text: "Laporan RT 03 Posko Lapangan:\nKeluarga Bapak Dedi (42th, istri dan 3 balita demam tinggi, asal Desa Cibitung). Lalu ada Ibu Halimah (65th, lansia sebatang kara sakit asma kronis sesak napas, tidak bawa obat).",
  },
];

const KOSONG: ProfilKerentanan = {
  agentThought: "",
  namaKK: null,
  usiaKK: null,
  anggotaKeluarga: [],
  kondisiMedisKritis: [],
  obatTersedia: null,
  mobilitas: null,
  asalLokasi: null,
  instansiRujukan: "DINAS_SOSIAL",
};

const KOSONG_PROVENANCE = (): ProvenanceMap => ({
  namaKK: { value: null, source: "default", sourceDetail: "input-manual", confidence: 0.0 },
  usiaKK: { value: null, source: "default", sourceDetail: "input-manual", confidence: 0.0 },
  anggotaKeluarga: { value: [], source: "default", sourceDetail: "input-manual", confidence: 0.0 },
  kondisiMedisKritis: { value: [], source: "default", sourceDetail: "input-manual", confidence: 0.0 },
  obatTersedia: { value: null, source: "default", sourceDetail: "input-manual", confidence: 0.0 },
  mobilitas: { value: null, source: "default", sourceDetail: "input-manual", confidence: 0.0 },
  asalLokasi: { value: null, source: "default", sourceDetail: "input-manual", confidence: 0.0 },
  instansiRujukan: { value: "DINAS_SOSIAL", source: "default", sourceDetail: "input-manual", confidence: 0.0 },
});

interface MultiItem {
  id: string;
  profil: ProfilKerentanan;
  saving?: boolean;
}

export default function IntakeClient() {
  const { show } = useToast();
  const [intakeMode, setIntakeMode] = useState<"single" | "multi">("single");
  const [teks, setTeks] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Single state
  const [profil, setProfil] = useState<ProfilKerentanan | null>(null);
  const [kondisiInput, setKondisiInput] = useState("");
  const [showRincian, setShowRincian] = useState(false);
  const [tersimpan, setTersimpan] = useState<{ kode: string; level: string } | null>(null);

  // Multi state
  const [multiList, setMultiList] = useState<MultiItem[]>([]);
  const [multiKondisiInput, setMultiKondisiInput] = useState<Record<string, string>>({});
  const [tersimpanBatch, setTersimpanBatch] = useState<Array<{ kode: string; level: string; namaKK: string | null }>>([]);

  const [listening, setListening] = useState(false);
  const [modelMode, setModelMode] = useState<"auto" | "deberta" | "llm">("auto");
  const recogRef = useRef<any>(null);

  const skorSingle = useMemo(() => (profil ? hitungSkor(profil) : null), [profil]);

  function isProfilEmpty(p: ProfilKerentanan): boolean {
    return (
      !p.namaKK &&
      p.usiaKK === null &&
      (!p.kondisiMedisKritis || p.kondisiMedisKritis.length === 0) &&
      (!p.anggotaKeluarga || p.anggotaKeluarga.length === 0)
    );
  }

  const statsMulti = useMemo(() => {
    if (multiList.length === 0) return null;
    let merah = 0, kuning = 0, hijau = 0;
    multiList.forEach((item) => {
      const s = hitungSkor(item.profil);
      if (s.level === "MERAH") merah++;
      else if (s.level === "KUNING") kuning++;
      else hijau++;
    });
    return { total: multiList.length, merah, kuning, hijau };
  }, [multiList]);

  async function analisis() {
    if (teks.trim().length < 3) {
      show("Masukkan catatan kondisi pengungsi terlebih dahulu", "error");
      return;
    }
    setLoading(true);
    setTersimpan(null);
    setTersimpanBatch([]);
    try {
      const res = await fetch("/api/agent/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          teks, 
          mode: intakeMode === "multi" ? "auto" : modelMode, 
          intakeMode 
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        show(data.error ?? "Gagal mengekstrak data", "error");
        if (intakeMode === "single") {
          setProfil({ ...KOSONG, provenance: KOSONG_PROVENANCE() });
        }
        return;
      }

      if (data.intakeMode === "multi") {
        const items: MultiItem[] = (data.items || []).map((it: { profil: ProfilKerentanan }) => ({
          id: crypto.randomUUID(),
          profil: it.profil,
        }));
        setMultiList(items);
        setProfil(null);
        show(`${items.length} keluarga terdeteksi dari teks`, "success");
      } else {
        setProfil(data.profil as ProfilKerentanan);
        setMultiList([]);
        show("Data pengungsi berhasil diekstrak", "success");
      }
    } catch {
      show("Koneksi gagal (offline). Form manual dibuka.", "error");
      if (intakeMode === "single") {
        setProfil({ ...KOSONG, provenance: KOSONG_PROVENANCE() });
      } else {
        setMultiList((prev) =>
          prev.length > 0
            ? prev
            : [{ id: crypto.randomUUID(), profil: { ...KOSONG, provenance: KOSONG_PROVENANCE() } }]
        );
        setProfil(null);
      }
    } finally {
      setLoading(false);
    }
  }

  function isiManual() {
    if (intakeMode === "single") {
      setProfil({ ...KOSONG, provenance: KOSONG_PROVENANCE() });
      setMultiList([]);
      setTersimpan(null);
    } else {
      setMultiList((prev) => [
        ...prev,
        { id: crypto.randomUUID(), profil: { ...KOSONG, provenance: KOSONG_PROVENANCE() } }
      ]);
      setProfil(null);
    }
  }

  useEffect(() => {
    return () => {
      try {
        if (recogRef.current) {
          recogRef.current.abort?.();
          recogRef.current.stop?.();
        }
      } catch {}
    };
  }, []);

  function toggleVoice() {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      show("Browser tidak mendukung input suara", "error");
      return;
    }
    if (listening) {
      recogRef.current?.stop();
      setListening(false);
      return;
    }
    const recog = new SR();
    recog.lang = "id-ID";
    recog.interimResults = false;
    recog.continuous = false;
    recog.onresult = (e: any) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setTeks((prev) => (prev ? prev + " " : "") + t);
    };
    recog.onerror = (e: any) => {
      setListening(false);
      show(`Gagal merekam suara: ${e?.error || "Terjadi kesalahan mikrofon"}`, "error");
    };
    recog.onend = () => setListening(false);
    recogRef.current = recog;
    try {
      recog.start();
      setListening(true);
    } catch {
      setListening(false);
      show("Tidak dapat memulai mikrofon", "error");
    }
  }

  function patchSingle(p: Partial<ProfilKerentanan>) {
    setProfil((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...p };
      const newProv = { ...(prev.provenance || KOSONG_PROVENANCE()) };
      Object.keys(p).forEach((key) => {
        newProv[key] = {
          value: (p as any)[key],
          source: "human",
          sourceDetail: "manual",
          confidence: 1.0,
        };
      });
      updated.provenance = newProv;
      return updated;
    });
  }

  function patchMulti(id: string, p: Partial<ProfilKerentanan>) {
    setMultiList((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item.profil, ...p };
        const newProv = { ...(item.profil.provenance || KOSONG_PROVENANCE()) };
        Object.keys(p).forEach((key) => {
          newProv[key] = {
            value: (p as any)[key],
            source: "human",
            sourceDetail: "manual",
            confidence: 1.0,
          };
        });
        updated.provenance = newProv;
        return { ...item, profil: updated };
      })
    );
  }

  function tambahKondisiMulti(itemId: string) {
    const val = (multiKondisiInput[itemId] || "").trim();
    if (!val) return;
    const item = multiList.find((it) => it.id === itemId);
    if (!item) return;
    patchMulti(itemId, { kondisiMedisKritis: [...item.profil.kondisiMedisKritis, val] });
    setMultiKondisiInput((prev) => ({ ...prev, [itemId]: "" }));
  }

  async function simpanSingle() {
    if (!profil) return;
    setSaving(true);
    const payload: KonfirmasiInput = {
      agentThought: profil.agentThought || "",
      namaKK: profil.namaKK?.trim() || null,
      usiaKK: profil.usiaKK,
      anggotaKeluarga: profil.anggotaKeluarga,
      kondisiMedisKritis: profil.kondisiMedisKritis,
      obatTersedia: profil.obatTersedia,
      mobilitas: profil.mobilitas,
      asalLokasi: profil.asalLokasi,
      instansiRujukan: profil.instansiRujukan,
      provenance: profil.provenance,
    };

    // 1. Jika device sedang offline, langsung simpan ke IndexedDB
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      try {
        const id = crypto.randomUUID();
        await savePendingIntake({ id, kasus: payload, createdAt: new Date().toISOString() });
        await registerBackgroundSync();
        notifySwPendingChanged();
        show("Tersimpan offline — akan disinkronkan otomatis saat online", "success");
        setProfil(null);
        setTeks("");
      } catch (err) {
        show("Gagal menyimpan ke penyimpanan offline lokal", "error");
      } finally {
        setSaving(false);
      }
      return;
    }

    // 2. Jika online, coba kirim ke server. Jika putus di tengah jalan, fallback ke offline
    try {
      const res = await simpanKasusTerkonfirmasi(payload);
      if (!res.ok) {
        // Cek jika status koneksi offline mendadak
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          const id = crypto.randomUUID();
          await savePendingIntake({ id, kasus: payload, createdAt: new Date().toISOString() });
          await registerBackgroundSync();
          notifySwPendingChanged();
          show("Koneksi terputus — tersimpan offline & akan sync otomatis", "success");
          setProfil(null);
          setTeks("");
          return;
        }
        show(res.error, "error");
        return;
      }
      setTersimpan({ kode: res.kodeUnik, level: res.level });
      show(`Tersimpan: ${res.kodeUnik} (${res.level})`, "success");
      setProfil(null);
      setTeks("");
    } catch (err) {
      // Network drop / fetch failure saat panggil Server Action
      try {
        const id = crypto.randomUUID();
        await savePendingIntake({ id, kasus: payload, createdAt: new Date().toISOString() });
        await registerBackgroundSync();
        notifySwPendingChanged();
        show("Koneksi gagal — data diamankan di penyimpanan offline lokal", "success");
        setProfil(null);
        setTeks("");
      } catch {
        show("Gagal menyimpan data (server dan offline tidak dapat diakses)", "error");
      }
    } finally {
      setSaving(false);
    }
  }

  async function simpanMultiItem(id: string) {
    const item = multiList.find((it) => it.id === id);
    if (!item) return;

    setMultiList((prev) => prev.map((it) => (it.id === id ? { ...it, saving: true } : it)));
    const payload: KonfirmasiInput = {
      agentThought: item.profil.agentThought || "",
      namaKK: item.profil.namaKK?.trim() || null,
      usiaKK: item.profil.usiaKK,
      anggotaKeluarga: item.profil.anggotaKeluarga,
      kondisiMedisKritis: item.profil.kondisiMedisKritis,
      obatTersedia: item.profil.obatTersedia,
      mobilitas: item.profil.mobilitas,
      asalLokasi: item.profil.asalLokasi,
      instansiRujukan: item.profil.instansiRujukan,
      provenance: item.profil.provenance,
    };

    // 1. Jika device offline
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      try {
        const offlineId = crypto.randomUUID();
        await savePendingIntake({ id: offlineId, kasus: payload, createdAt: new Date().toISOString() });
        await registerBackgroundSync();
        notifySwPendingChanged();
        show(`Tersimpan offline: ${item.profil.namaKK || "Keluarga"}`, "success");
        setMultiList((prev) => prev.filter((it) => it.id !== id));
      } catch {
        show("Gagal menyimpan offline", "error");
        setMultiList((prev) => prev.map((it) => (it.id === id ? { ...it, saving: false } : it)));
      }
      return;
    }

    // 2. Jika online, kirim ke server dengan fallback
    try {
      const res = await simpanKasusTerkonfirmasi(payload);
      if (!res.ok) {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          const offlineId = crypto.randomUUID();
          await savePendingIntake({ id: offlineId, kasus: payload, createdAt: new Date().toISOString() });
          await registerBackgroundSync();
          notifySwPendingChanged();
          show(`Tersimpan offline: ${item.profil.namaKK || "Keluarga"}`, "success");
          setMultiList((prev) => prev.filter((it) => it.id !== id));
          return;
        }
        show(res.error, "error");
        setMultiList((prev) => prev.map((it) => (it.id === id ? { ...it, saving: false } : it)));
        return;
      }

      show(`Tersimpan: ${res.kodeUnik} (${res.level})`, "success");
      setTersimpanBatch((prev) => [...prev, { kode: res.kodeUnik, level: res.level, namaKK: item.profil.namaKK }]);
      setMultiList((prev) => prev.filter((it) => it.id !== id));
    } catch {
      // Fallback offline saat network error
      try {
        const offlineId = crypto.randomUUID();
        await savePendingIntake({ id: offlineId, kasus: payload, createdAt: new Date().toISOString() });
        await registerBackgroundSync();
        notifySwPendingChanged();
        show(`Koneksi terputus — tersimpan offline: ${item.profil.namaKK || "Keluarga"}`, "success");
        setMultiList((prev) => prev.filter((it) => it.id !== id));
      } catch {
        show("Gagal menyimpan data", "error");
        setMultiList((prev) => prev.map((it) => (it.id === id ? { ...it, saving: false } : it)));
      }
    }
  }

  async function simpanSemuaBatch() {
    if (multiList.length === 0) return;
    setSaving(true);
    const hasilList: Array<{ kode: string; level: string; namaKK: string | null }> = [];
    let gagalCount = 0;
    const remaining: MultiItem[] = [];

    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

    for (const item of multiList) {
      const payload: KonfirmasiInput = {
        agentThought: item.profil.agentThought || "",
        namaKK: item.profil.namaKK?.trim() || null,
        usiaKK: item.profil.usiaKK,
        anggotaKeluarga: item.profil.anggotaKeluarga,
        kondisiMedisKritis: item.profil.kondisiMedisKritis,
        obatTersedia: item.profil.obatTersedia,
        mobilitas: item.profil.mobilitas,
        asalLokasi: item.profil.asalLokasi,
        instansiRujukan: item.profil.instansiRujukan,
        provenance: item.profil.provenance,
      };

      if (isOffline) {
        try {
          const offlineId = crypto.randomUUID();
          await savePendingIntake({ id: offlineId, kasus: payload, createdAt: new Date().toISOString() });
          hasilList.push({ kode: "OFFLINE", level: hitungSkor(item.profil).level, namaKK: item.profil.namaKK });
        } catch {
          gagalCount++;
          remaining.push(item);
        }
        continue;
      }

      try {
        const res = await simpanKasusTerkonfirmasi(payload);
        if (!res.ok) {
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            const offlineId = crypto.randomUUID();
            await savePendingIntake({ id: offlineId, kasus: payload, createdAt: new Date().toISOString() });
            hasilList.push({ kode: "OFFLINE", level: hitungSkor(item.profil).level, namaKK: item.profil.namaKK });
          } else {
            gagalCount++;
            remaining.push(item);
          }
        } else {
          hasilList.push({ kode: res.kodeUnik, level: res.level, namaKK: item.profil.namaKK });
        }
      } catch {
        // Network drop during batch iteration
        try {
          const offlineId = crypto.randomUUID();
          await savePendingIntake({ id: offlineId, kasus: payload, createdAt: new Date().toISOString() });
          hasilList.push({ kode: "OFFLINE", level: hitungSkor(item.profil).level, namaKK: item.profil.namaKK });
        } catch {
          gagalCount++;
          remaining.push(item);
        }
      }
    }

    const hadOfflineItems = hasilList.some((h) => h.kode === "OFFLINE");
    if (hadOfflineItems) {
      await registerBackgroundSync();
      notifySwPendingChanged();
    }

    setSaving(false);
    setMultiList(remaining);
    setTersimpanBatch((prev) => [...prev, ...hasilList]);

    if (gagalCount === 0) {
      show(`${hasilList.length} keluarga berhasil disimpan`, "success");
      setTeks("");
    } else {
      show(`${hasilList.length} tersimpan, ${gagalCount} tertunda`, "info");
    }
  }

  const contohList = intakeMode === "multi" ? CONTOH_MULTI : CONTOH_SINGLE;

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* ====== INPUT CONTAINER ====== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all">
        
        {/* Header & Segmented Pill Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setIntakeMode("single");
                setMultiList([]);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                intakeMode === "single"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              1 Keluarga
            </button>
            <button
              type="button"
              onClick={() => {
                setIntakeMode("multi");
                setModelMode("auto");
                setProfil(null);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                intakeMode === "multi"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Rombongan / Multi-KK
            </button>
          </div>

          {/* Quick Examples */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Contoh:</span>
            {contohList.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setTeks(c.text)}
                className="rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 active:scale-95 transition-all"
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Textarea Input */}
        <div className="relative">
          <textarea
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            rows={intakeMode === "multi" ? 5 : 4}
            placeholder={
              intakeMode === "multi"
                ? "Tulis narasi rombongan atau laporan RT (misal: 3 keluarga tiba naik pikap, sebutkan nama, usia, kondisi medis, dan obat)..."
                : "Tuliskan keluhan atau kondisi keluarga pengungsi (nama, usia, kondisi sakit, obat, kebutuhan khusus)..."
            }
            className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-pmi focus:ring-2 focus:ring-pmi/20 outline-none transition-all resize-y"
          />
        </div>

        {/* Toolbar Bawah */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Voice Button */}
            <button
              type="button"
              onClick={toggleVoice}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                listening 
                  ? "border-red-400 bg-red-50 text-red-600 animate-pulse" 
                  : "border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700"
              }`}
            >
              <Mic className="h-3.5 w-3.5 text-pmi" />
              {listening ? "Mendengarkan..." : "Suara"}
            </button>

            {/* Model Mode Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
              <span className="text-[11px] text-slate-500">Model:</span>
              <select
                value={intakeMode === "multi" ? "gemini" : modelMode}
                disabled={intakeMode === "multi"}
                onChange={(e) => setModelMode(e.target.value as any)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-pmi disabled:bg-slate-100 disabled:text-slate-700 cursor-pointer"
              >
                {intakeMode === "multi" ? (
                  <option value="gemini">Gemini 3.6 Flash (Akurat)</option>
                ) : (
                  <>
                    <option value="auto">Auto (Qwen Groq)</option>
                    <option value="deberta">GLiNER (Cepat)</option>
                    <option value="llm">LLM (Akurat)</option>
                  </>
                )}
              </select>
            </div>

            {/* Manual Entry Button */}
            <button
              type="button"
              onClick={isiManual}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
            >
              <FileEdit className="h-3.5 w-3.5 text-slate-500" />
              Form Kosong
            </button>
          </div>

          {/* Primary Action Button */}
          <Button
            onClick={analisis}
            loading={loading}
            className="rounded-xl bg-pmi text-white hover:bg-pmi-dark px-6 py-2.5 text-xs font-black shadow-sm active:scale-95 transition-all"
          >
            {loading ? "Mengekstrak..." : intakeMode === "multi" ? "Proses Rombongan" : "Ekstrak Informasi"}
          </Button>
        </div>
      </div>

      {/* ====== NOTIFIKASI TERSIMPAN (SUCCESS BANNER) ====== */}
      {tersimpan && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <UserCheck className="h-5 w-5 text-emerald-700 shrink-0" />
            <div>
              <p className="text-sm font-bold">Kasus Berhasil Disimpan ({tersimpan.kode})</p>
              <p className="text-xs text-emerald-800">Data telah masuk ke antrean triage posko.</p>
            </div>
          </div>
          <LevelBadge level={tersimpan.level as any} />
        </div>
      )}

      {tersimpanBatch.length > 0 && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-xs">
          <div className="flex items-center gap-2 mb-2 font-bold text-sm">
            <CheckCheck className="h-4 w-4 text-emerald-700" />
            {tersimpanBatch.length} Keluarga Berhasil Disimpan
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {tersimpanBatch.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-lg bg-white border border-emerald-200 p-2 text-xs">
                <span className="font-bold text-slate-800 truncate mr-2">{item.namaKK || "Tanpa Nama"}</span>
                <LevelBadge level={item.level as any} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====== KARTU KONFIRMASI SINGLE ====== */}
      {profil && skorSingle && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          
          {/* Header Kartu */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-5">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {profil.namaKK ? `Keluarga ${profil.namaKK}` : "Konfirmasi Data Pengungsi"}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Verifikasi Lapis-1 oleh Relawan Lapangan</p>
            </div>
            <div className="flex items-center gap-2">
              {isProfilEmpty(profil) ? (
                <span className="rounded-full bg-slate-100 border border-slate-300 px-3 py-1 text-xs font-bold text-slate-600">
                  Draf (Belum Diisi)
                </span>
              ) : (
                <>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    Skor: {skorSingle.skor}
                  </span>
                  <LevelBadge level={skorSingle.level} />
                </>
              )}
            </div>
          </div>

          {/* AI Note Callout */}
          {profil.agentThought && (
            <div className="mb-5 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 flex items-start gap-2">
              <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <p className="italic font-medium">{profil.agentThought}</p>
            </div>
          )}

          {/* 2-Column Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nama Kepala Keluarga</label>
              <input
                value={profil.namaKK ?? ""}
                onChange={(e) => patchSingle({ namaKK: e.target.value || null })}
                placeholder="Nama lengkap"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-pmi focus:ring-1 focus:ring-pmi"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Usia KK (Tahun)</label>
              <input
                type="number"
                value={profil.usiaKK ?? ""}
                onChange={(e) => patchSingle({ usiaKK: e.target.value === "" ? null : Number(e.target.value) })}
                placeholder="Usia (contoh: 45)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-pmi focus:ring-1 focus:ring-pmi"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ketersediaan Obat Rutin</label>
              <select
                value={profil.obatTersedia === null ? "" : profil.obatTersedia ? "ya" : "tidak"}
                onChange={(e) => patchSingle({ obatTersedia: e.target.value === "" ? null : e.target.value === "ya" })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-pmi focus:ring-1 focus:ring-pmi bg-white"
              >
                <option value="">Belum Ditanyakan</option>
                <option value="ya">Ada / Terbawa</option>
                <option value="tidak">Habis / Tidak Terbawa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tingkat Mobilitas</label>
              <select
                value={profil.mobilitas ?? ""}
                onChange={(e) => patchSingle({ mobilitas: (e.target.value || null) as ProfilKerentanan["mobilitas"] })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-pmi focus:ring-1 focus:ring-pmi bg-white"
              >
                <option value="">Belum Ditentukan</option>
                <option value="mandiri">Mandiri (Bisa berjalan)</option>
                <option value="bantuan">Perlu Bantuan / Dipapah</option>
                <option value="tidak_bisa">Tidak Bisa Bergerak / Butuh Tandu</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Asal Lokasi / Desa</label>
              <input
                value={profil.asalLokasi ?? ""}
                onChange={(e) => patchSingle({ asalLokasi: e.target.value || null })}
                placeholder="Desa / RW asal"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-pmi focus:ring-1 focus:ring-pmi"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instansi Rujukan Utama</label>
              <select
                value={profil.instansiRujukan}
                onChange={(e) => patchSingle({ instansiRujukan: e.target.value as ProfilKerentanan["instansiRujukan"] })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-pmi focus:ring-1 focus:ring-pmi bg-white"
              >
                <option value="DINAS_KESEHATAN">Dinas Kesehatan (Medis)</option>
                <option value="DINAS_SOSIAL">Dinas Sosial (Logistik & Dapur)</option>
                <option value="BPBD">BPBD (Evakuasi & Tenda)</option>
              </select>
            </div>
          </div>

          {/* Kondisi Medis Kritis */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kondisi Medis / Penyakit Kronis</label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2 min-h-[30px]">
              {profil.kondisiMedisKritis.map((k, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-bold text-red-700">
                  {k}
                  <button
                    type="button"
                    onClick={() => patchSingle({ kondisiMedisKritis: profil.kondisiMedisKritis.filter((_, j) => j !== i) })}
                    className="text-red-400 hover:text-red-700 ml-0.5 font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))}
              {profil.kondisiMedisKritis.length === 0 && (
                <span className="text-xs text-slate-400 italic">Belum ada kondisi medis tercatat.</span>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={kondisiInput}
                onChange={(e) => setKondisiInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && kondisiInput.trim()) {
                    e.preventDefault();
                    patchSingle({ kondisiMedisKritis: [...profil.kondisiMedisKritis, kondisiInput.trim()] });
                    setKondisiInput("");
                  }
                }}
                placeholder="+ Tambah kondisi medis (tekan Enter)"
                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-pmi focus:ring-1 focus:ring-pmi"
              />
              <button
                type="button"
                onClick={() => {
                  if (kondisiInput.trim()) {
                    patchSingle({ kondisiMedisKritis: [...profil.kondisiMedisKritis, kondisiInput.trim()] });
                    setKondisiInput("");
                  }
                }}
                className="rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
              >
                + Tambah
              </button>
            </div>
          </div>

          {/* Anggota Keluarga */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700">
                Anggota Keluarga Terdampak ({profil.anggotaKeluarga.length})
              </label>
              <button
                type="button"
                onClick={() => patchSingle({ anggotaKeluarga: [...profil.anggotaKeluarga, { hubungan: "", usia: null, kondisiKhusus: null }] })}
                className="text-xs font-bold text-pmi hover:text-pmi-dark inline-flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah Anggota
              </button>
            </div>
            <div className="space-y-2">
              {profil.anggotaKeluarga.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <input
                    value={a.hubungan}
                    onChange={(e) => {
                      const arr = [...profil.anggotaKeluarga];
                      arr[i] = { ...a, hubungan: e.target.value };
                      patchSingle({ anggotaKeluarga: arr });
                    }}
                    placeholder="Hubungan (istri/anak)"
                    className="w-32 rounded border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-pmi"
                  />
                  <input
                    type="number"
                    value={a.usia ?? ""}
                    onChange={(e) => {
                      const arr = [...profil.anggotaKeluarga];
                      arr[i] = { ...a, usia: e.target.value === "" ? null : Number(e.target.value) };
                      patchSingle({ anggotaKeluarga: arr });
                    }}
                    placeholder="Usia"
                    className="w-16 rounded border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-pmi"
                  />
                  <input
                    value={a.kondisiKhusus ?? ""}
                    onChange={(e) => {
                      const arr = [...profil.anggotaKeluarga];
                      arr[i] = { ...a, kondisiKhusus: e.target.value || null };
                      patchSingle({ anggotaKeluarga: arr });
                    }}
                    placeholder="Kondisi khusus / disabilitas / balita (opsional)"
                    className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-pmi"
                  />
                  <button
                    type="button"
                    onClick={() => patchSingle({ anggotaKeluarga: profil.anggotaKeluarga.filter((_, j) => j !== i) })}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Rincian Skor Collapsible */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowRincian(!showRincian)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900"
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${showRincian ? "rotate-180" : ""}`} />
              {showRincian ? "Sembunyikan Rincian Skor" : "Lihat Rincian Perhitungan Skor Triage"}
            </button>
            {showRincian && (
              <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 space-y-1 border border-slate-200">
                {skorSingle.rincian.map((r, i) => (
                  <div key={i} className="flex justify-between border-b border-slate-200/60 pb-1">
                    <span>{r.label}</span>
                    <span className="font-bold text-slate-900">+{r.poin}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1 font-black text-slate-900 text-sm">
                  <span>Total Skor</span>
                  <span>{skorSingle.skor} Poin ({skorSingle.level})</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setProfil(null)}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <Button
              onClick={simpanSingle}
              loading={saving}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 text-xs shadow-sm active:scale-95 transition-all"
            >
              <UserCheck className="h-4 w-4 mr-1.5" />
              Konfirmasi & Simpan
            </Button>
          </div>
        </div>
      )}

      {/* ====== KARTU KONFIRMASI MULTI-BATCH ====== */}
      {multiList.length > 0 && (
        <div className="flex flex-col gap-4">
          
          {/* Summary Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-900 text-white p-4 shadow-sm">
            <div>
              <h3 className="text-sm font-black">Daftar {statsMulti?.total} Keluarga Pengungsi</h3>
              <p className="text-xs text-slate-400">Verifikasi setiap keluarga di bawah sebelum disimpan</p>
            </div>
            {statsMulti && (
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="rounded-md bg-red-500/30 border border-red-500/40 px-2.5 py-1 text-red-300">
                  {statsMulti.merah} Merah
                </span>
                <span className="rounded-md bg-amber-500/30 border border-amber-500/40 px-2.5 py-1 text-amber-300">
                  {statsMulti.kuning} Kuning
                </span>
                <span className="rounded-md bg-emerald-500/30 border border-emerald-500/40 px-2.5 py-1 text-emerald-300">
                  {statsMulti.hijau} Hijau
                </span>
              </div>
            )}
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {multiList.map((item, index) => {
              const skor = hitungSkor(item.profil);
              const isItemEmpty = isProfilEmpty(item.profil);

              return (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-800 border border-slate-200">
                        {index + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">
                          {item.profil.namaKK || `Keluarga #${index + 1} (Tanpa Nama)`}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          RUJUKAN: {item.profil.instansiRujukan}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isItemEmpty ? (
                        <span className="rounded-full bg-slate-100 border border-slate-300 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                          Draf
                        </span>
                      ) : (
                        <LevelBadge level={skor.level} />
                      )}
                      <button
                        type="button"
                        onClick={() => setMultiList((prev) => prev.filter((it) => it.id !== item.id))}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Hapus kartu ini"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Nama Kepala Keluarga</label>
                      <input
                        value={item.profil.namaKK ?? ""}
                        onChange={(e) => patchMulti(item.id, { namaKK: e.target.value || null })}
                        placeholder="Nama KK"
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-pmi"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Usia KK (Tahun)</label>
                      <input
                        type="number"
                        value={item.profil.usiaKK ?? ""}
                        onChange={(e) => patchMulti(item.id, { usiaKK: e.target.value === "" ? null : Number(e.target.value) })}
                        placeholder="Usia"
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-pmi"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Obat Rutin</label>
                      <select
                        value={item.profil.obatTersedia === null ? "" : item.profil.obatTersedia ? "ya" : "tidak"}
                        onChange={(e) => patchMulti(item.id, { obatTersedia: e.target.value === "" ? null : e.target.value === "ya" })}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-pmi bg-white"
                      >
                        <option value="">Belum Ditanyakan</option>
                        <option value="ya">Ada</option>
                        <option value="tidak">Tidak Ada / Habis</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Mobilitas</label>
                      <select
                        value={item.profil.mobilitas ?? ""}
                        onChange={(e) => patchMulti(item.id, { mobilitas: (e.target.value || null) as ProfilKerentanan["mobilitas"] })}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-pmi bg-white"
                      >
                        <option value="">Belum Ditentukan</option>
                        <option value="mandiri">Mandiri</option>
                        <option value="bantuan">Perlu Bantuan</option>
                        <option value="tidak_bisa">Tidak Bisa Jalan / Tandu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Asal Lokasi</label>
                      <input
                        value={item.profil.asalLokasi ?? ""}
                        onChange={(e) => patchMulti(item.id, { asalLokasi: e.target.value || null })}
                        placeholder="Desa / Wilayah"
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-pmi"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Rujukan Instansi</label>
                      <select
                        value={item.profil.instansiRujukan}
                        onChange={(e) => patchMulti(item.id, { instansiRujukan: e.target.value as ProfilKerentanan["instansiRujukan"] })}
                        className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-pmi bg-white"
                      >
                        <option value="DINAS_KESEHATAN">Dinas Kesehatan</option>
                        <option value="DINAS_SOSIAL">Dinas Sosial</option>
                        <option value="BPBD">BPBD</option>
                      </select>
                    </div>
                  </div>

                  {/* Medical Conditions with Input Box */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <label className="block text-slate-700 font-bold text-xs mb-1.5">
                      Kondisi Medis / Penyakit Kronis:
                    </label>
                    <div className="flex flex-wrap items-center gap-1.5 mb-2 min-h-[26px]">
                      {item.profil.kondisiMedisKritis.map((k, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-md bg-red-50 border border-red-200 px-2 py-0.5 text-xs font-bold text-red-700">
                          {k}
                          <button
                            type="button"
                            onClick={() => patchMulti(item.id, { kondisiMedisKritis: item.profil.kondisiMedisKritis.filter((_, j) => j !== i) })}
                            className="text-red-400 hover:text-red-700 ml-0.5 font-bold"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                      {item.profil.kondisiMedisKritis.length === 0 && (
                        <span className="text-xs text-slate-400 italic">Tidak ada kondisi kritis.</span>
                      )}
                    </div>
                    {/* Input Box for adding condition */}
                    <div className="flex gap-2">
                      <input
                        value={multiKondisiInput[item.id] || ""}
                        onChange={(e) => setMultiKondisiInput((prev) => ({ ...prev, [item.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            tambahKondisiMulti(item.id);
                          }
                        }}
                        placeholder="Tambah kondisi medis (contoh: diabetes, asma), tekan Enter"
                        className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-pmi"
                      />
                      <button
                        type="button"
                        onClick={() => tambahKondisiMulti(item.id)}
                        className="rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors"
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>

                  {/* Family Members Editor in Multi Card */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        Anggota Keluarga Terdampak ({item.profil.anggotaKeluarga.length})
                      </label>
                      <button
                        type="button"
                        onClick={() => patchMulti(item.id, { anggotaKeluarga: [...item.profil.anggotaKeluarga, { hubungan: "", usia: null, kondisiKhusus: null }] })}
                        className="text-xs font-bold text-pmi hover:text-pmi-dark inline-flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Tambah Anggota
                      </button>
                    </div>
                    {item.profil.anggotaKeluarga.length > 0 && (
                      <div className="space-y-1.5 mb-2">
                        {item.profil.anggotaKeluarga.map((a, i) => (
                          <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                            <input
                              value={a.hubungan}
                              onChange={(e) => {
                                const arr = [...item.profil.anggotaKeluarga];
                                arr[i] = { ...a, hubungan: e.target.value };
                                patchMulti(item.id, { anggotaKeluarga: arr });
                              }}
                              placeholder="Hubungan (istri/anak)"
                              className="w-28 rounded border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-pmi"
                            />
                            <input
                              type="number"
                              value={a.usia ?? ""}
                              onChange={(e) => {
                                const arr = [...item.profil.anggotaKeluarga];
                                arr[i] = { ...a, usia: e.target.value === "" ? null : Number(e.target.value) };
                                patchMulti(item.id, { anggotaKeluarga: arr });
                              }}
                              placeholder="Usia"
                              className="w-14 rounded border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-pmi"
                            />
                            <input
                              value={a.kondisiKhusus ?? ""}
                              onChange={(e) => {
                                const arr = [...item.profil.anggotaKeluarga];
                                arr[i] = { ...a, kondisiKhusus: e.target.value || null };
                                patchMulti(item.id, { anggotaKeluarga: arr });
                              }}
                              placeholder="Kondisi khusus (balita/disabilitas)"
                              className="flex-1 rounded border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-pmi"
                            />
                            <button
                              type="button"
                              onClick={() => patchMulti(item.id, { anggotaKeluarga: item.profil.anggotaKeluarga.filter((_, j) => j !== i) })}
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      {isItemEmpty ? "Status: Draf" : `Skor Triase: ${skor.skor}`}
                    </span>
                    <Button
                      onClick={() => simpanMultiItem(item.id)}
                      loading={item.saving}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 text-xs shadow-sm active:scale-95 transition-all"
                    >
                      <UserCheck className="h-3.5 w-3.5 mr-1" />
                      Simpan Keluarga Ini
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sticky Bottom Batch Bar */}
          <div className="sticky bottom-4 z-40 rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-xl border border-slate-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={isiManual}
                className="rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 text-xs font-bold text-slate-800 transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" /> Tambah KK Manual
              </button>
              <button
                type="button"
                onClick={() => setMultiList([])}
                className="rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors"
              >
                Batal Semua
              </button>
            </div>

            <Button
              onClick={simpanSemuaBatch}
              loading={saving}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCheck className="h-4 w-4" />
              Simpan Semua ({multiList.length} Keluarga)
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-2.5 py-8 text-xs font-bold text-slate-600">
          <Spinner className="text-pmi" />
          <span>Memproses data dengan AI...</span>
        </div>
      )}
    </div>
  );
}
