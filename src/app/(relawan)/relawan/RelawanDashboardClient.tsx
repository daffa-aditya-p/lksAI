"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mic,
  QrCode,
  MapPin,
  Package,
  Activity,
  CheckCircle2,
  Clock,
  User,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  HeartHandshake,
  Layers,
  Search,
  Wifi,
} from "lucide-react";
import { LevelBadge, Button } from "@/components/ui";
import { verifikasiLaporanLapangan, catatDistribusiLogistik } from "@/app/actions/relawan";

export interface KasusFeedItem {
  id: string;
  kodeUnik: string;
  namaKK: string | null;
  usiaKK: number | null;
  asalLokasi: string | null;
  levelPrioritas: "MERAH" | "KUNING" | "HIJAU";
  status: string;
  sumberInput: string;
  createdAt: string;
  kondisiMedisKritis: string[];
  obatTersedia: boolean | null;
}

export interface PoskoOption {
  id: string;
  namaPosko: string;
  areaPublik: string;
}

export interface DistribusiLogItem {
  id: string;
  penerima: string;
  bantuan: string[];
  waktu: string;
  posko: string;
}

interface RelawanDashboardClientProps {
  user: {
    username: string;
    role: string;
  };
  metrics: {
    totalJiwa: number;
    totalMerah: number;
    totalKuning: number;
    totalHijau: number;
    terverifikasiCount: number;
  };
  antreanKasus: KasusFeedItem[];
  poskoList: PoskoOption[];
  riwayatDistribusi: DistribusiLogItem[];
}

export default function RelawanDashboardClient({
  user,
  metrics,
  antreanKasus,
  poskoList,
  riwayatDistribusi,
}: RelawanDashboardClientProps) {
  const router = useRouter();
  const [selectedPosko, setSelectedPosko] = useState<string>(
    poskoList[0]?.namaPosko || "Posko Pengungsian RW 05 Kampung Melayu"
  );
  const [filterLevel, setFilterLevel] = useState<"ALL" | "MERAH" | "KUNING" | "HIJAU">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Modal Distribusi
  const [modalDistribusiOpen, setModalDistribusiOpen] = useState(false);
  const [distribusiForm, setDistribusiForm] = useState<{
    namaPenerima: string;
    kasusId?: string;
    itemBantuan: string[];
    catatan: string;
  }>({
    namaPenerima: "",
    itemBantuan: ["Paket Pangan Siap Santap"],
    catatan: "",
  });
  const [distribusiLoading, setDistribusiLoading] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter antrean
  const filteredAntrean = antreanKasus.filter((item) => {
    const matchLevel = filterLevel === "ALL" || item.levelPrioritas === filterLevel;
    const matchSearch =
      !searchQuery ||
      (item.namaKK && item.namaKK.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.asalLokasi && item.asalLokasi.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.kodeUnik.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLevel && matchSearch;
  });

  const handleVerifikasi = async (kasusId: string) => {
    setActionLoadingId(kasusId);
    try {
      const res = await verifikasiLaporanLapangan(kasusId);
      if (res.ok) {
        showToast(res.message || "Laporan berhasil diverifikasi lapangan!", "success");
        router.refresh();
      } else {
        showToast(res.error || "Gagal memverifikasi laporan", "error");
      }
    } catch {
      showToast("Terjadi kendala jaringan saat memverifikasi", "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openDistribusiModal = (namaKK?: string | null, kasusId?: string) => {
    setDistribusiForm({
      namaPenerima: namaKK || "",
      kasusId: kasusId || undefined,
      itemBantuan: ["Paket Pangan Siap Santap"],
      catatan: "",
    });
    setModalDistribusiOpen(true);
  };

  const toggleItemBantuan = (item: string) => {
    setDistribusiForm((prev) => {
      const exists = prev.itemBantuan.includes(item);
      return {
        ...prev,
        itemBantuan: exists ? prev.itemBantuan.filter((i) => i !== item) : [...prev.itemBantuan, item],
      };
    });
  };

  const handleSimpanDistribusi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distribusiForm.namaPenerima.trim() || distribusiForm.itemBantuan.length === 0) {
      showToast("Nama penerima dan minimal 1 jenis bantuan wajib dipilih", "error");
      return;
    }

    setDistribusiLoading(true);
    try {
      const res = await catatDistribusiLogistik({
        namaPenerima: distribusiForm.namaPenerima,
        poskoNama: selectedPosko,
        kasusId: distribusiForm.kasusId,
        itemBantuan: distribusiForm.itemBantuan,
        catatan: distribusiForm.catatan,
      });

      if (res.ok) {
        showToast(res.message || "Penyaluran bantuan berhasil dicatat!", "success");
        setModalDistribusiOpen(false);
        router.refresh();
      } else {
        showToast(res.error || "Gagal mencatat penyaluran bantuan", "error");
      }
    } catch {
      showToast("Terjadi kendala koneksi saat mencatat", "error");
    } finally {
      setDistribusiLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeUp">
      {/* 1. HEADER OPERASIONAL LAPANGAN */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E6F9FC] text-pmi border border-pmi/30">
              <span className="w-2 h-2 rounded-full bg-pmi animate-pulse" />
              Relawan Lapangan
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Wifi className="w-3 h-3" />
              Online
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-2">
            Pusat Komando Relawan
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Selamat bertugas, <span className="font-bold text-slate-800">{user.username}</span>. Kelola intake, scan QR, dan koordinasi penyaluran bantuan.
          </p>
        </div>

        {/* Dropdown Posko Tugas */}
        <div className="flex flex-col gap-1 min-w-[260px]">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-pmi" />
            Posko Penugasan:
          </label>
          <select
            value={selectedPosko}
            onChange={(e) => setSelectedPosko(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 hover:bg-white px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-pmi focus:ring-2 focus:ring-pmi/20 transition-all cursor-pointer"
          >
            {poskoList.map((p) => (
              <option key={p.id} value={p.namaPosko}>
                {p.namaPosko} ({p.areaPublik})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. RINGKASAN METRIK OPERASIONAL (KPI CARDS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Card 1: Total Pengungsi */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Korban Terdata</span>
            <span className="w-7 h-7 rounded-lg bg-blue-50 text-pmi flex items-center justify-center">
              <User className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900 mt-2">{metrics.totalJiwa}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Tercatat di sistem terpadu</span>
        </div>

        {/* Card 2: Kasus Kritis (MERAH) */}
        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-800">Prioritas Kritis</span>
            <span className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
              MERAH
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-red-700 mt-2">{metrics.totalMerah}</p>
          <span className="text-[11px] text-red-600/80 mt-1 block">Wajib rujukan & tindakan medis</span>
        </div>

        {/* Card 3: Prioritas KUNING */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800">Prioritas Sedang</span>
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
              KUNING
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-amber-800 mt-2">{metrics.totalKuning}</p>
          <span className="text-[11px] text-amber-700/80 mt-1 block">Lansia, balita & obat kronis</span>
        </div>

        {/* Card 4: Terverifikasi Lapangan */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">Terverifikasi</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl md:text-3xl font-black text-emerald-800 mt-2">{metrics.terverifikasiCount}</p>
          <span className="text-[11px] text-emerald-700/80 mt-1 block">Sudah dikonfirmasi relawan</span>
        </div>
      </div>

      {/* 3. MENU AKSI CEPAT RELAWAN (4 TILES OPERASIONAL) */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-pmi" />
          Aksi Cepat Lapangan
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Tile 1: Intake Triage AI */}
          <Link
            href="/intake"
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-pmi/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-pmi text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-pmi transition-colors">
                Intake Triage AI
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Input narasi suara/teks untuk ekstraksi &amp; auto-skor cepat
              </p>
            </div>
            <span className="text-[11px] font-bold text-pmi mt-3 inline-flex items-center gap-1">
              Buka Form Intake &rarr;
            </span>
          </Link>

          {/* Tile 2: Scan QR Korban */}
          <Link
            href="/admin/scan"
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-pmi/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-pmi text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-pmi transition-colors">
                Scan QR Korban
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Pindai kartu barcode mandiri warga di pintu masuk posko
              </p>
            </div>
            <span className="text-[11px] font-bold text-pmi mt-3 inline-flex items-center gap-1">
              Buka Kamera Scanner &rarr;
            </span>
          </Link>

          {/* Tile 3: Salurkan Logistik (Modal) */}
          <button
            type="button"
            onClick={() => openDistribusiModal()}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-cariOrange hover:shadow-md transition-all flex flex-col justify-between text-left cursor-pointer"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cariOrange text-slate-900 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform font-bold">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-amber-600 transition-colors">
                Distribusi Logistik
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Catat serah terima sembako, selimut, air &amp; paket bayi
              </p>
            </div>
            <span className="text-[11px] font-bold text-amber-600 mt-3 inline-flex items-center gap-1">
              Catat Pembagian &rarr;
            </span>
          </button>

          {/* Tile 4: Peta Posko & Rujukan */}
          <Link
            href="/peta/instansi"
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-xs hover:border-pmi/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mt-3 group-hover:text-slate-700 transition-colors">
                Peta Situasi &amp; Posko
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Cek stok kebutuhan agregat &amp; ketersediaan faskes sekitar
              </p>
            </div>
            <span className="text-[11px] font-bold text-slate-700 mt-3 inline-flex items-center gap-1">
              Lihat Peta Lapangan &rarr;
            </span>
          </Link>
        </div>
      </div>

      {/* 4. ANTREAN LAPORAN DARURAT WARGA (LIVE QUEUE) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Header Antrean & Filter */}
        <div className="p-4 md:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">
                Antrean Laporan Lapangan &amp; Warga
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pmi/10 text-pmi border border-pmi/20">
                {filteredAntrean.length} Kasus
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Laporan masuk dari aplikasi masyarakat &amp; posko terdekat yang siap ditindaklanjuti.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari KK / Lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:border-pmi"
              />
            </div>
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60 text-xs font-bold">
              {(["ALL", "MERAH", "KUNING", "HIJAU"] as const).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterLevel === lvl ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {lvl === "ALL" ? "Semua" : lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List Kasus */}
        <div className="divide-y divide-slate-100">
          {filteredAntrean.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada antrean laporan yang cocok.</p>
              <p className="text-xs text-slate-400 mt-0.5">Semua data di kategori ini telah selesai ditangani.</p>
            </div>
          ) : (
            filteredAntrean.map((item) => (
              <div
                key={item.id}
                className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                {/* Info Utama Kasus */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="mt-1">
                    <LevelBadge level={item.levelPrioritas} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 leading-snug">
                        {item.namaKK || "Tanpa Nama KK"}
                      </h4>
                      <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        #{item.kodeUnik}
                      </span>
                      {item.status === "terverifikasi" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" />
                          Menunggu Validasi
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                      {item.usiaKK && <span>Usia KK: {item.usiaKK} th</span>}
                      {item.asalLokasi && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-pmi shrink-0" />
                          {item.asalLokasi}
                        </span>
                      )}
                      <span className="text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Badge Kondisi Medis */}
                    {item.kondisiMedisKritis && item.kondisiMedisKritis.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.kondisiMedisKritis.map((k, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-red-50 text-red-700 border border-red-200"
                          >
                            <Activity className="w-2.5 h-2.5" />
                            {k}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tombol Aksi Lapangan */}
                <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {item.status !== "terverifikasi" && (
                    <Button
                      variant="primary"
                      className="!min-h-[34px] !py-1.5 !px-3 text-xs"
                      loading={actionLoadingId === item.id}
                      onClick={() => handleVerifikasi(item.id)}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verifikasi
                    </Button>
                  )}

                  <Button
                    variant="secondary"
                    className="!min-h-[34px] !py-1.5 !px-3 text-xs"
                    onClick={() => openDistribusiModal(item.namaKK, item.id)}
                  >
                    <Package className="w-3.5 h-3.5" />
                    Salurkan Logistik
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. RIWAYAT PENYALURAN BANTUAN TERAKHIR */}
      {riwayatDistribusi.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-pmi" />
            Riwayat Penyerahan Bantuan Terakhir di Posko
          </h3>
          <div className="divide-y divide-slate-100">
            {riwayatDistribusi.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                <div>
                  <span className="font-bold text-slate-800">{log.penerima}</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Item: {log.bantuan.join(", ")}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(log.waktu).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">Tersalurkan ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL SERAH TERIMA LOGISTIK */}
      {modalDistribusiOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeUp"
          onClick={() => setModalDistribusiOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl p-5 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-cariOrange text-slate-950 flex items-center justify-center font-bold">
                  <Package className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Serah Terima Bantuan</h3>
                  <p className="text-xs text-slate-500">Posko: {selectedPosko}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalDistribusiOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimpanDistribusi} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kepala Keluarga / Penerima *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bpk. Sugiono / Ibu Rahma"
                  value={distribusiForm.namaPenerima}
                  onChange={(e) => setDistribusiForm({ ...distribusiForm, namaPenerima: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-pmi"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Item Bantuan yang Diserahkan *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    "Paket Pangan Siap Santap",
                    "Paket Sembako & Air Galon",
                    "Selimut & Matras Tidur",
                    "Paket Bayi (Popok & Bubur)",
                    "P3K & Obat Darurat",
                    "Pakaian Kering Layak Pakai",
                  ].map((item) => {
                    const isChecked = distribusiForm.itemBantuan.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => toggleItemBantuan(item)}
                        className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
                          isChecked
                            ? "bg-[#E6F9FC] border-pmi text-pmi shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <span className="mr-1.5">{isChecked ? "☑" : "☐"}</span>
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan Khusus (Opsional)</label>
                <input
                  type="text"
                  placeholder="Misal: Sudah jatah hari ke-2 / Butuh popok ukuran L"
                  value={distribusiForm.catatan}
                  onChange={(e) => setDistribusiForm({ ...distribusiForm, catatan: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-pmi"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 !min-h-[38px] text-xs"
                  onClick={() => setModalDistribusiOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1 !min-h-[38px] text-xs font-bold"
                  loading={distribusiLoading}
                >
                  Konfirmasi Serah Terima
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK */}
      {toastMessage && (
        <div
          className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-2 animate-fadeUp ${
            toastMessage.type === "success" ? "bg-slate-900 border border-pmi" : "bg-red-700"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${toastMessage.type === "success" ? "bg-pmi" : "bg-white"}`} />
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
