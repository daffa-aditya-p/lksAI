"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Users,
  Gift,
  Home,
  Bell,
  User,
  Calendar,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export type TabType = "LAPORAN" | "RELAWAN" | "DONASI";

export interface LaporanItem {
  id: string;
  kodeUnik: string;
  judul: string;
  asalLokasi: string;
  levelPrioritas: string;
  status: "Sedang di verifikasi" | "Selesai" | string;
  createdAt: string;
}

export interface RelawanItem {
  id: string;
  judul: string;
  tanggalRentang: string;
  lokasi: string;
  alamatSpesifik: string;
  posisi: string;
  waktuKegiatan: string;
  informasiTugas: string;
  kontakKordinator: string;
  status: string;
  createdAt: string;
}

export interface DonasiItem {
  id: string;
  kodeDonasi: string;
  judul: string;
  nominal: number;
  status: "Terkirim" | "Menunggu Pembayaran" | string;
  metode: string;
  createdAt: string;
}

interface AktivitasClientProps {
  initialLaporan: LaporanItem[];
  initialRelawan: RelawanItem[];
  initialDonasi: DonasiItem[];
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export default function AktivitasClient({
  initialLaporan,
  initialRelawan,
  initialDonasi,
  user,
}: AktivitasClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("LAPORAN");

  // State Modal Detail
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanItem | null>(null);
  const [selectedRelawan, setSelectedRelawan] = useState<RelawanItem | null>(null);
  const [selectedDonasi, setSelectedDonasi] = useState<DonasiItem | null>(null);

  // Fallback demo data jika database kosong agar selalu presisi dengan mockup
  const laporanList: LaporanItem[] =
    initialLaporan.length > 0
      ? initialLaporan
      : [
          {
            id: "lap-1",
            kodeUnik: "#SATU-00125",
            judul: "Banjir - Jakarta Timur",
            asalLokasi: "Kampung Melayu, Jatinegara",
            levelPrioritas: "KUNING",
            status: "Sedang di verifikasi",
            createdAt: new Date().toISOString(),
          },
          {
            id: "lap-2",
            kodeUnik: "#SATU-00120",
            judul: "Banjir - Jakarta",
            asalLokasi: "Rawajati, Pancoran",
            levelPrioritas: "HIJAU",
            status: "Selesai",
            createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
          },
        ];

  const relawanList: RelawanItem[] =
    initialRelawan.length > 0
      ? initialRelawan
      : [
          {
            id: "rel-1",
            judul: "Open Volunteer - Banjir Jakarta Timur",
            tanggalRentang: "8 - 20 Oktober 2026",
            lokasi: "Jakarta Timur",
            alamatSpesifik: "Jl. Melati No.5, Jakarta Timur",
            posisi: "Distribusi Bantuan",
            waktuKegiatan: "06.00 - 18.00 WIB",
            informasiTugas: "Membantu distribusi paket bantuan kepada pengungsi di posko RW 05",
            kontakKordinator: "08123425871667",
            status: "Terdaftar",
            createdAt: new Date().toISOString(),
          },
        ];

  const donasiList: DonasiItem[] =
    initialDonasi.length > 0
      ? initialDonasi
      : [
          {
            id: "don-1",
            kodeDonasi: "#DONASI-58219",
            judul: "Bantuan Korban Banjir Jakarta",
            nominal: 250000,
            status: "Terkirim",
            metode: "E-wallet (GoPay)",
            createdAt: new Date().toISOString(),
          },
        ];

  // Helper format tanggal: e.g. "8 Okt 2026 - 14:24"
  const formatTanggal = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day} ${month} ${year} - ${hours}:${minutes}`;
    } catch {
      return dateStr;
    }
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-appBg font-sans text-slate-800 flex flex-col items-center">
      {/* WRAPPER KONTEN */}
      <div className="w-full max-w-[480px] lg:max-w-2xl bg-white min-h-screen border-x border-gray-100/80 shadow-sm flex flex-col relative">

        {/* HEADER BAR */}
        <header className="px-5 pt-6 pb-2 bg-white">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Aktivitas
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Pantau laporan, kegiatan, dan donasi kamu
          </p>
        </header>

        {/* HORIZONTAL TAB BAR DENGAN ORANGE/AMBER ACTIVE LINE */}
        <nav className="px-5 mt-3 border-b border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setActiveTab("LAPORAN")}
            className={`pb-2.5 text-xs transition-all relative cursor-pointer ${
              activeTab === "LAPORAN"
                ? "font-bold text-slate-900 border-b-2 border-[#FFA800]"
                : "font-medium text-slate-400 hover:text-slate-600"
            }`}
          >
            Laporan Saya
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("RELAWAN")}
            className={`pb-2.5 text-xs transition-all relative cursor-pointer ${
              activeTab === "RELAWAN"
                ? "font-bold text-slate-900 border-b-2 border-[#FFA800]"
                : "font-medium text-slate-400 hover:text-slate-600"
            }`}
          >
            Aktivitas Relawan
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("DONASI")}
            className={`pb-2.5 text-xs transition-all relative cursor-pointer ${
              activeTab === "DONASI"
                ? "font-bold text-slate-900 border-b-2 border-[#FFA800]"
                : "font-medium text-slate-400 hover:text-slate-600"
            }`}
          >
            Riwayat Donasi
          </button>
        </nav>

        {/* MAIN BODY CONTAINER */}
        <main className="flex-1 px-5 py-4 pb-28 flex flex-col">

          {/* ============================================================== */}
          {/* TAB 1: LAPORAN SAYA (Layar 1 Desain)                           */}
          {/* ============================================================== */}
          {activeTab === "LAPORAN" && (
            <div className="space-y-3 flex-1">
              {laporanList.map((item) => {
                const isSelesai = item.status === "Selesai";
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedLaporan(item)}
                    className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 hover:shadow-md hover:border-[#00A9B5]/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {/* Ikon Document Light Blue */}
                      <div className="w-11 h-11 rounded-[14px] bg-[#E0F7FA] text-[#00A9B5] flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>

                      {/* Detail Laporan */}
                      <div>
                        <span className="block text-[11px] font-mono text-slate-400">
                          {item.kodeUnik}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 leading-tight">
                          {item.judul}
                        </h3>
                        <span
                          className={`inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold ${
                            isSelesai
                              ? "bg-[#FFF4E6] text-[#EA580C]"
                              : "bg-[#E8F8F0] text-[#10B981]"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    {/* Timestamp Kanan */}
                    <div className="text-[11px] text-slate-400 shrink-0 text-right">
                      {formatTanggal(item.createdAt)}
                    </div>
                  </div>
                );
              })}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/app/lapor")}
                  className="w-full py-3 rounded-[14px] border border-dashed border-[#00A9B5]/50 hover:bg-[#E0F7FA]/30 text-[#00A9B5] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>+ Buat Laporan Darurat Baru</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: AKTIVITAS RELAWAN (Layar 2 Desain)                      */}
          {/* ============================================================== */}
          {activeTab === "RELAWAN" && (
            <div className="space-y-3 flex-1">
              {relawanList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedRelawan(item)}
                  className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 hover:shadow-md hover:border-[#00A9B5]/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Ikon Users Light Blue */}
                    <div className="w-11 h-11 rounded-[14px] bg-[#E0F7FA] text-[#00A9B5] flex items-center justify-center shrink-0">
                      <Users size={20} />
                    </div>

                    {/* Detail Relawan */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {item.judul}
                      </h3>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        {item.tanggalRentang}
                      </span>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold bg-[#E0F7FA] text-[#00A9B5]">
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="text-slate-300">
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/app/relawan-join")}
                  className="w-full py-3 rounded-[14px] border border-dashed border-[#00A9B5]/50 hover:bg-[#E0F7FA]/30 text-[#00A9B5] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>+ Daftar Lowongan Relawan Lainnya</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: RIWAYAT DONASI (Layar 3 Desain)                         */}
          {/* ============================================================== */}
          {activeTab === "DONASI" && (
            <div className="space-y-3 flex-1">
              {donasiList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedDonasi(item)}
                  className="bg-white rounded-[20px] p-4 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-between gap-3 hover:shadow-md hover:border-[#00A9B5]/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {/* Ikon Gift Box Light Blue */}
                    <div className="w-11 h-11 rounded-[14px] bg-[#E0F7FA] text-[#00A9B5] flex items-center justify-center shrink-0">
                      <Gift size={20} />
                    </div>

                    {/* Detail Donasi */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {item.judul}
                      </h3>
                      <span className="block text-xs font-extrabold text-slate-800 mt-0.5">
                        {formatRupiah(item.nominal)}
                      </span>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-semibold bg-[#E8F8F0] text-[#10B981]">
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp Kanan */}
                  <div className="text-[11px] text-slate-400 shrink-0 text-right">
                    {formatTanggal(item.createdAt)}
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/app/donasi")}
                  className="w-full py-3 rounded-[14px] border border-dashed border-[#00A9B5]/50 hover:bg-[#E0F7FA]/30 text-[#00A9B5] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>+ Salurkan Donasi Baru</span>
                </button>
              </div>
            </div>
          )}

        </main>

        {/* BOTTOM NAVIGATION BAR */}
        <nav
          aria-label="Navigasi Utama"
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] lg:max-w-2xl bg-white rounded-t-[24px] shadow-bottom-nav border-t border-gray-100 px-6 py-2.5 z-40"
        >
          <div className="grid grid-cols-4 items-center">
            <button
              type="button"
              onClick={() => router.push("/app")}
              className="flex flex-col items-center justify-center py-1 gap-1 text-[#1A1A1A] hover:text-[#00A9B5] cursor-pointer"
            >
              <Home size={20} />
              <span className="text-[9.5px]">Beranda</span>
            </button>

            <button
              type="button"
              className="flex flex-col items-center justify-center py-1 gap-1 text-[#00A9B5] font-bold cursor-pointer"
            >
              <div className="relative">
                <Calendar size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFA800]" />
              </div>
              <span className="text-[9.5px]">Aktivitas</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/app/notifikasi")}
              className="flex flex-col items-center justify-center py-1 gap-1 text-[#1A1A1A] hover:text-[#00A9B5] cursor-pointer"
            >
              <Bell size={20} />
              <span className="text-[9.5px]">Notifikasi</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/app/profil")}
              className="flex flex-col items-center justify-center py-1 gap-1 text-[#1A1A1A] hover:text-[#00A9B5] cursor-pointer"
            >
              <User size={20} />
              <span className="text-[9.5px]">Profil</span>
            </button>
          </div>
        </nav>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: RINCIAN LAPORAN DARURAT SAYA                          */}
      {/* ============================================================== */}
      {selectedLaporan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[28px] sm:rounded-[28px] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#00A9B5]">
                  {selectedLaporan.kodeUnik}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedLaporan.judul}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLaporan(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Status Penanganan</span>
                <span className="font-bold text-emerald-600">
                  {selectedLaporan.status}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Lokasi Pelapor</span>
                <span className="font-bold text-slate-800">
                  {selectedLaporan.asalLokasi}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Tingkat Prioritas</span>
                <span className="font-bold text-amber-600">
                  {selectedLaporan.levelPrioritas}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Waktu Lapor</span>
                <span className="font-medium text-slate-800">
                  {formatTanggal(selectedLaporan.createdAt)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#E0F7FA]/40 rounded-xl border border-[#00A9B5]/20 flex items-center gap-2.5 text-xs text-slate-700">
              <ShieldCheck size={18} className="text-[#00A9B5] shrink-0" />
              <span>
                QR Code validasi laporan dapat ditunjukkan kepada relawan PMI saat penyaluran logistik tiba.
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedLaporan(null)}
                className="w-full py-3 rounded-xl bg-[#00A9B5] text-white font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: RINCIAN PENUGASAN RELAWAN                             */}
      {/* ============================================================== */}
      {selectedRelawan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[28px] sm:rounded-[28px] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-[#00A9B5]">
                  {selectedRelawan.status}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedRelawan.judul}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRelawan(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar size={15} className="text-[#00A9B5] shrink-0" />
                <span>Tanggal: <strong>{selectedRelawan.tanggalRentang}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Clock size={15} className="text-[#00A9B5] shrink-0" />
                <span>Waktu: <strong>{selectedRelawan.waktuKegiatan}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <MapPin size={15} className="text-[#00A9B5] shrink-0" />
                <span>Posko: <strong>{selectedRelawan.alamatSpesifik}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Phone size={15} className="text-[#00A9B5] shrink-0" />
                <span>Koordinator: <a href={`tel:${selectedRelawan.kontakKordinator}`} className="font-bold underline">{selectedRelawan.kontakKordinator}</a></span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Tugas Lapangan:</span>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {selectedRelawan.informasiTugas}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedRelawan(null)}
                className="w-full py-3 rounded-xl bg-[#0D1F2D] text-white font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: RINCIAN STRUK DONASI SAYA                             */}
      {/* ============================================================== */}
      {selectedDonasi && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[28px] sm:rounded-[28px] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-600">
                  {selectedDonasi.kodeDonasi}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Struk Donasi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDonasi(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Program</span>
                <span className="font-bold text-slate-900 text-right max-w-[200px] truncate">
                  {selectedDonasi.judul}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Metode</span>
                <span className="font-medium text-slate-800">
                  {selectedDonasi.metode}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-bold text-emerald-600">
                  {selectedDonasi.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Waktu Pembayaran</span>
                <span className="text-slate-700">
                  {formatTanggal(selectedDonasi.createdAt)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Total Donasi</span>
                <span className="text-base font-extrabold text-[#00A9B5]">
                  {formatRupiah(selectedDonasi.nominal)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
              <span>Dana telah dialokasikan secara transparan untuk pengungsi.</span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedDonasi(null)}
                className="w-full py-3 rounded-xl bg-[#00A9B5] text-white font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
