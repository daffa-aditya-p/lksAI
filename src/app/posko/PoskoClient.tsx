"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  MapPin,
  Clock,
  Phone,
  Home,
  Plus,
  Truck,
  Package,
  Map as MapIcon,
  Navigation,
  ExternalLink,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { jarakMeter } from "@/lib/peta";

export interface PoskoItem {
  id: string;
  nama: string;
  tipe: "pengungsian" | "medis" | "logistik" | "lainnya";
  badge: string;
  badgeType: "tersedia" | "medis" | "logistik";
  iconType: "home" | "medis" | "ambulans" | "logistik";
  jarakKm: number;
  jarakDisplay: string;
  gambar: string;
  alamat: string;
  areaPublik: string;
  jamLayanan: string;
  kontak: string;
  kodePosko: string;
  lat: number;
  lng: number;
}

interface PoskoClientProps {
  initialPosko: PoskoItem[];
}

export default function PoskoClient({ initialPosko }: PoskoClientProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("semua");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Modal detail / aksi
  const [activeModalPosko, setActiveModalPosko] = useState<PoskoItem | null>(null);
  const [modalMode, setModalMode] = useState<"aplikasi" | "peta" | null>(null);

  // Request browser geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocError("Peramban Anda tidak mendukung geolokasi.");
      return;
    }
    setLocating(true);
    setLocError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setLocError("Gagal mendeteksi lokasi. Pastikan izin GPS aktif.");
        setLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Hitung ulang jarak dinamis jika lokasi terdeteksi
  const computedList = useMemo(() => {
    return initialPosko.map((item) => {
      if (userLocation && item.lat && item.lng) {
        const meter = jarakMeter(userLocation.lat, userLocation.lng, item.lat, item.lng);
        const km = meter / 1000;
        const formatted = km < 1 ? `${Math.round(meter)} m` : `${km.toFixed(1).replace(".", ",")} km`;
        return {
          ...item,
          jarakKm: km,
          jarakDisplay: formatted,
        };
      }
      return item;
    });
  }, [initialPosko, userLocation]);

  // Urutkan dan filter
  const filteredList = useMemo(() => {
    const q = search.trim().toLowerCase();
    return computedList
      .filter((p) => {
        const matchSearch =
          !q ||
          p.nama.toLowerCase().includes(q) ||
          p.alamat.toLowerCase().includes(q) ||
          p.areaPublik.toLowerCase().includes(q) ||
          p.badge.toLowerCase().includes(q);

        const matchType =
          filterType === "semua" ||
          (filterType === "pengungsian" && p.tipe === "pengungsian") ||
          (filterType === "medis" && p.tipe === "medis") ||
          (filterType === "logistik" && p.tipe === "logistik");

        return matchSearch && matchType;
      })
      .sort((a, b) => a.jarakKm - b.jarakKm);
  }, [computedList, search, filterType]);

  const renderIcon = (type: PoskoItem["iconType"]) => {
    switch (type) {
      case "home":
        return (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0B1F4B] flex items-center justify-center shrink-0 shadow-sm">
            <Home className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white" />
          </div>
        );
      case "medis":
        return (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#EF4444] flex items-center justify-center shrink-0 shadow-sm">
            <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[3.5]" />
          </div>
        );
      case "ambulans":
        return (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#F59E0B] flex items-center justify-center shrink-0 shadow-sm">
            <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        );
      case "logistik":
        return (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#10B981] flex items-center justify-center shrink-0 shadow-sm">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        );
      default:
        return (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0B1F4B] flex items-center justify-center shrink-0 shadow-sm">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        );
    }
  };

  const renderBadge = (badge: string, badgeType: PoskoItem["badgeType"]) => {
    switch (badgeType) {
      case "tersedia":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E8F8EE] text-[#16A34A] border border-[#BBF7D0]">
            {badge}
          </span>
        );
      case "medis":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
            {badge}
          </span>
        );
      case "logistik":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
            {badge}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {badge}
          </span>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      {/* Top Header & Search Bar Row */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pusat Informasi Posko
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
              {filteredList.length} Titik
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Daftar posko penampungan, fasilitas kesehatan darurat, dan titik bantuan resmi.
          </p>
        </div>

        {/* Search input - pill style sesuai desain */}
        <div className="w-full md:w-auto flex items-center gap-2.5">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Lokasi"
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Bersihkan pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filter and GPS bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200/70 pb-4">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {[
            { id: "semua", label: "Semua Posko" },
            { id: "pengungsian", label: "Posko Pengungsian" },
            { id: "medis", label: "Layanan Medis" },
            { id: "logistik", label: "Dapur & Logistik" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                filterType === tab.id
                  ? "bg-[#0B1F4B] text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={locating}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all active:scale-95 ${
              userLocation
                ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${locating ? "animate-spin text-teal-600" : "text-teal-600"}`} />
            {locating ? "Mencari GPS..." : userLocation ? "Lokasi Aktif" : "Deteksi Lokasi Saya"}
          </button>

          <Link
            href="/peta"
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-95"
          >
            <MapIcon className="w-3.5 h-3.5" />
            Mode Peta
          </Link>
        </div>
      </div>

      {locError && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{locError}</span>
        </div>
      )}

      {/* Cards Grid — Desain persis screenshot user */}
      {filteredList.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <MapPin className="mx-auto w-10 h-10 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">Tidak Ada Posko Ditemukan</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ada posko yang cocok dengan kata kunci &ldquo;{search}&rdquo;. Coba ganti kata pencarian atau pilih kategori lain.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFilterType("semua");
            }}
            className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Reset Pencarian
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredList.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-[26px] p-6 sm:p-7 shadow-[0_10px_35px_rgba(11,31,75,0.06)] border border-slate-100 hover:shadow-[0_14px_45px_rgba(11,31,75,0.1)] transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header Card: Icon + Title + Distance + Badge */}
                <div className="flex items-start gap-3.5">
                  {renderIcon(item.iconType)}
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug truncate">
                      {item.nama}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs font-bold text-slate-800">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        {item.jarakDisplay}
                      </span>
                      {renderBadge(item.badge, item.badgeType)}
                    </div>
                  </div>
                </div>

                {/* Body Card: Photo Thumbnail + Address */}
                <div className="mt-4 flex items-start gap-4">
                  <div className="w-[130px] h-[78px] sm:w-[150px] sm:h-[86px] rounded-xl overflow-hidden shrink-0 relative bg-slate-100 border border-slate-100 shadow-sm">
                    <Image
                      src={item.gambar}
                      alt={item.nama}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Alamat</span>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-slate-600 line-clamp-3">
                      {item.alamat}
                    </p>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                  <div className="grid grid-cols-2 divide-x divide-slate-100">
                    {/* Jam Layanan */}
                    <div className="flex items-start gap-2.5 pr-2">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          Jam Layanan
                        </div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5">
                          {item.jamLayanan}
                        </div>
                      </div>
                    </div>

                    {/* Kontak */}
                    <div className="flex items-start gap-2.5 pl-3">
                      <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                          Kontak
                        </div>
                        <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                          {item.kontak}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Lihat Peta & Buka Aplikasi */}
              <div className="mt-5 grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModalPosko(item);
                    setModalMode("peta");
                  }}
                  className="w-full py-2.5 px-3 rounded-full border-[1.5px] border-[#0B1F4B] text-[#0B1F4B] hover:bg-slate-50 active:scale-95 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
                >
                  Lihat Peta
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModalPosko(item);
                    setModalMode("aplikasi");
                  }}
                  className="w-full py-2.5 px-3 rounded-full bg-[#FFA90A] hover:bg-[#F09500] text-white active:scale-95 text-xs font-bold shadow-md shadow-amber-500/20 transition-all text-center flex items-center justify-center gap-1.5"
                >
                  Buka Aplikasi
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Interaktif Saat Tombol Ditekan */}
      {activeModalPosko && modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
            <button
              type="button"
              onClick={() => {
                setActiveModalPosko(null);
                setModalMode(null);
              }}
              className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {modalMode === "peta" ? (
              <div>
                <div className="flex items-center gap-3">
                  {renderIcon(activeModalPosko.iconType)}
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {activeModalPosko.nama}
                    </h3>
                    <p className="text-xs text-slate-500">{activeModalPosko.alamat}</p>
                  </div>
                </div>

                <div className="my-5 space-y-2.5">
                  <Link
                    href={`/peta`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 hover:border-slate-400 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-blue-50 p-2 text-blue-600">
                        <MapIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Buka di Peta Interaktif SATU
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Lihat sebaran area & kebutuhan lintas posko
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${activeModalPosko.nama} ${activeModalPosko.alamat}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 hover:border-slate-400 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600">
                        <Navigation className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Buka Google Maps (Navigasi GPS)
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Petunjuk arah jalan langsung ke lokasi
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModalPosko(null);
                    setModalMode(null);
                  }}
                  className="w-full rounded-full bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3">
                  {renderIcon(activeModalPosko.iconType)}
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Akses Layanan {activeModalPosko.nama}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Pilih layanan yang ingin Anda akses di posko ini
                    </p>
                  </div>
                </div>

                <div className="my-5 space-y-2.5">
                  <Link
                    href={`/mandiri/${activeModalPosko.kodePosko || "POSKO01"}`}
                    className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50/50 p-3.5 hover:bg-amber-50 hover:border-amber-300 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-amber-500 p-2 text-white shadow-sm">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          Digital Check-In & Lapor Mandiri
                        </div>
                        <div className="text-[11px] text-slate-600">
                          Pendataan mandiri warga pengungsi via QR Code
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-600" />
                  </Link>

                  <Link
                    href="/intake"
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 hover:border-slate-400 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-slate-100 p-2 text-slate-700">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Intake Relawan Lapangan
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Khusus petugas untuk pencatatan kasus pengungsi
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <a
                    href={`tel:${activeModalPosko.kontak.replace(/[^0-9]/g, "")}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5 hover:border-slate-400 hover:bg-slate-50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-teal-50 p-2 text-teal-600">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">
                          Hubungi Posko ({activeModalPosko.kontak})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Telepon darurat koordinasi petugas
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActiveModalPosko(null);
                    setModalMode(null);
                  }}
                  className="w-full rounded-full bg-slate-100 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
