"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ChevronLeft,
  Search,
  Crosshair,
  Navigation,
  ExternalLink,
  MapPin,
  Phone,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Utensils,
  Droplets,
  HeartPulse,
  Tent,
  Baby,
  Zap,
  Package,
  Stethoscope,
  X,
  Layers,
  List,
  Map as MapIcon,
  Car,
  Footprints,
} from "lucide-react";
import type { PoskoMapData } from "./page";

// Dynamic import Leaflet map untuk menghindari SSR mismatch
const GoogleMapLeaflet = dynamic(() => import("./GoogleMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#E5E9EC] flex flex-col items-center justify-center gap-3 text-slate-500">
      <div className="w-9 h-9 border-[3px] border-[#00A8B8] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[13px] font-semibold text-slate-600">
        Memuat Peta Satelit & Posko...
      </p>
    </div>
  ),
});

interface AppPetaClientProps {
  user: {
    name?: string | null;
    username: string;
  };
  poskoList: PoskoMapData[];
}

// Rumus Jarak Haversine Akurat (km)
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius bumi dalam km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function PetaContent({ user, poskoList }: AppPetaClientProps) {
  const searchParams = useSearchParams();
  const initialPoskoQuery = searchParams.get("posko") || "";
  const initialFilter = searchParams.get("filter") || "semua";

  // Lokasi default pengguna (Kampung Melayu, Jakarta Timur)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: -6.2245,
    lng: 106.8665,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<
    "semua" | "pengungsian" | "medis" | "logistik"
  >(
    initialFilter === "medis"
      ? "medis"
      : initialFilter === "logistik"
      ? "logistik"
      : initialFilter === "pengungsian"
      ? "pengungsian"
      : "semua"
  );
  const [viewMode, setViewMode] = useState<"peta" | "daftar">("peta");

  // Selected Posko & Route States
  const [selectedPosko, setSelectedPosko] = useState<PoskoMapData | null>(null);
  const [activeRoute, setActiveRoute] = useState<PoskoMapData | null>(null);
  const [centerTrigger, setCenterTrigger] = useState(0);

  // Ambil lokasi GPS riil jika browser mengizinkan
  const detectUserGPS = () => {
    if (typeof window === "undefined" || !navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLocating(false);
        setLocationSuccess(true);
      },
      (err) => {
        console.warn("GPS tidak aktif atau izin ditolak:", err.message);
        setIsLocating(false);
      },
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    detectUserGPS();
  }, []);

  // Tangani query param ?posko=... saat pertama kali halaman dibuka dari Beranda
  useEffect(() => {
    if (initialPoskoQuery && poskoList.length > 0) {
      const match = poskoList.find(
        (p) =>
          p.nama.toLowerCase().includes(initialPoskoQuery.toLowerCase()) ||
          initialPoskoQuery.toLowerCase().includes(p.nama.toLowerCase())
      );
      if (match) {
        setSelectedPosko(match);
        setCenterTrigger((prev) => prev + 1);
      }
    }
  }, [initialPoskoQuery, poskoList]);

  // Posko dengan jarak dinamis diurutkan dari yang paling dekat
  const poskoWithDistance = useMemo(() => {
    return poskoList.map((p) => {
      const dist = calculateDistanceKm(
        userLocation.lat,
        userLocation.lng,
        p.lat,
        p.lng
      );
      return {
        ...p,
        rawDistance: dist,
        formattedDistance:
          dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
        drivingTimeMinutes: Math.max(2, Math.round(dist * 3.5)),
        walkingTimeMinutes: Math.max(5, Math.round(dist * 12)),
      };
    });
  }, [poskoList, userLocation]);

  // Filter daftar posko berdasarkan search & kategori
  const filteredPosko = useMemo(() => {
    return poskoWithDistance
      .filter((p) => {
        const matchCategory =
          activeCategory === "semua" || p.tipe === activeCategory;
        const queryLower = searchQuery.toLowerCase().trim();
        const matchSearch =
          !queryLower ||
          p.nama.toLowerCase().includes(queryLower) ||
          p.area.toLowerCase().includes(queryLower) ||
          p.alamat.toLowerCase().includes(queryLower) ||
          p.tersedia.some((t) => t.nama.toLowerCase().includes(queryLower));
        return matchCategory && matchSearch;
      })
      .sort((a, b) => a.rawDistance - b.rawDistance);
  }, [poskoWithDistance, activeCategory, searchQuery]);

  // Posko terpilih saat ini dengan info jarak terupdate
  const activeSelectedPosko = useMemo(() => {
    if (!selectedPosko) return null;
    return (
      poskoWithDistance.find((p) => p.id === selectedPosko.id) || selectedPosko
    );
  }, [selectedPosko, poskoWithDistance]);

  // Handler Pilih Posko
  const handleSelectPosko = (posko: PoskoMapData) => {
    setSelectedPosko(posko);
    setCenterTrigger((prev) => prev + 1);
  };

  // Handler Lihat Arah Rute
  const handleToggleRoute = (posko: PoskoMapData) => {
    if (activeRoute?.id === posko.id) {
      setActiveRoute(null);
    } else {
      setActiveRoute(posko);
      setSelectedPosko(posko);
      setCenterTrigger((prev) => prev + 1);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#F4F6F8] flex flex-col overflow-hidden select-none font-sans">
      {/* ============================================================== */}
      {/* 1. FLOATING GOOGLE MAPS SEARCH HEADER & CATEGORY PILLS          */}
      {/* ============================================================== */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 sm:p-4 pointer-events-none">
        <div className="max-w-xl mx-auto space-y-2 pointer-events-auto">
          {/* Baris Pencarian Utama */}
          <div className="bg-white rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.12)] border border-gray-100/90 flex items-center px-3 py-2.5 gap-2.5 transition focus-within:ring-2 focus-within:ring-[#00A8B8]">
            <Link
              href="/app"
              aria-label="Kembali ke Beranda"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition active:scale-95 shrink-0"
            >
              <ChevronLeft size={20} />
            </Link>

            <div className="flex-1 flex items-center gap-2">
              <Search size={18} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari posko, wilayah, atau kebutuhan..."
                className="w-full text-[13.5px] font-medium text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Toggle Mode Peta / Daftar */}
            <button
              type="button"
              onClick={() =>
                setViewMode((prev) => (prev === "peta" ? "daftar" : "peta"))
              }
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11.5px] font-semibold flex items-center gap-1.5 transition shrink-0"
            >
              {viewMode === "peta" ? (
                <>
                  <List size={14} />
                  <span>Daftar</span>
                </>
              ) : (
                <>
                  <MapIcon size={14} />
                  <span>Peta</span>
                </>
              )}
            </button>
          </div>

          {/* Filter Pills Kategori Bencana */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setActiveCategory("semua")}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shadow-sm border transition flex items-center gap-1.5 ${
                activeCategory === "semua"
                  ? "bg-[#0F1E26] text-white border-[#0F1E26]"
                  : "bg-white/95 backdrop-blur-sm text-slate-700 border-gray-200 hover:bg-slate-50"
              }`}
            >
              <span>Semua Posko</span>
              <span className="text-[10px] opacity-80">
                ({poskoWithDistance.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory("pengungsian")}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shadow-sm border transition flex items-center gap-1.5 ${
                activeCategory === "pengungsian"
                  ? "bg-[#0F1E26] text-white border-[#0F1E26]"
                  : "bg-white/95 backdrop-blur-sm text-slate-700 border-gray-200 hover:bg-slate-50"
              }`}
            >
              <Tent size={13} className="text-cyan-500" />
              <span>Pengungsian</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory("medis")}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shadow-sm border transition flex items-center gap-1.5 ${
                activeCategory === "medis"
                  ? "bg-[#C8102E] text-white border-[#C8102E]"
                  : "bg-white/95 backdrop-blur-sm text-slate-700 border-gray-200 hover:bg-slate-50"
              }`}
            >
              <HeartPulse size={13} className="text-rose-500" />
              <span>Layanan Medis</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory("logistik")}
              className={`px-3 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap shadow-sm border transition flex items-center gap-1.5 ${
                activeCategory === "logistik"
                  ? "bg-[#FFA800] text-slate-900 border-[#FFA800]"
                  : "bg-white/95 backdrop-blur-sm text-slate-700 border-gray-200 hover:bg-slate-50"
              }`}
            >
              <Package size={13} className="text-amber-500" />
              <span>Logistik & Dapur</span>
            </button>
          </div>

          {/* Banner Rute Aktif (Jika pengguna sedang melihat arah rute) */}
          {activeRoute && (
            <div className="bg-[#007AFF] text-white rounded-2xl p-3 shadow-lg flex items-center justify-between gap-3 animate-fadeIn">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Navigation size={16} className="text-white animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-blue-100">
                    Petunjuk Rute Aktif Menuju:
                  </p>
                  <p className="text-[13px] font-bold truncate">
                    {activeRoute.nama}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeRoute.lat},${activeRoute.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 bg-white text-[#007AFF] text-[11px] font-bold rounded-lg hover:bg-blue-50 transition shadow-xs flex items-center gap-1"
                >
                  <ExternalLink size={12} />
                  <span>Google Maps</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActiveRoute(null)}
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. AREA UTAMA: PETA INTERAKTIF / DAFTAR POSKO                   */}
      {/* ============================================================== */}
      <div className="w-full flex-1 relative">
        {viewMode === "peta" ? (
          <GoogleMapLeaflet
            poskoList={filteredPosko}
            selectedPosko={selectedPosko}
            onSelectPosko={handleSelectPosko}
            userLocation={userLocation}
            activeRoute={activeRoute}
            centerTrigger={centerTrigger}
          />
        ) : (
          /* Mode Daftar Posko */
          <div className="w-full h-full pt-32 pb-44 px-4 overflow-y-auto max-w-xl mx-auto space-y-3">
            <p className="text-[12px] font-medium text-slate-500">
              Ditemukan {filteredPosko.length} lokasi posko di sekitarmu
            </p>
            {filteredPosko.map((posko) => (
              <div
                key={posko.id}
                onClick={() => {
                  setSelectedPosko(posko);
                  setViewMode("peta");
                  setCenterTrigger((p) => p + 1);
                }}
                className={`bg-white rounded-2xl p-4 shadow-sm border transition cursor-pointer hover:shadow-md ${
                  selectedPosko?.id === posko.id
                    ? "border-[#00A8B8] ring-2 ring-[#00A8B8]/20"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider mb-1 ${
                        posko.tipe === "medis"
                          ? "bg-rose-50 text-rose-600"
                          : posko.tipe === "logistik"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-cyan-50 text-cyan-700"
                      }`}
                    >
                      {posko.tipeLabel}
                    </span>
                    <h3 className="text-[14.5px] font-bold text-slate-900 leading-snug">
                      {posko.nama}
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-1">
                      {posko.alamat}
                    </p>
                  </div>
                  <span className="text-[13px] font-black text-[#00A8B8] shrink-0 bg-[#E8F8FA] px-2.5 py-1 rounded-full">
                    {(posko as any).formattedDistance}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11.5px] text-slate-500">
                  <span>Kapasitas: {posko.kapasitas}</span>
                  <span className="font-semibold text-slate-700">
                    {posko.tersedia.length} Layanan Tersedia →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Floating Action Button: GPS / Lokasi Saya & Reset Tampilan */}
        {viewMode === "peta" && (
          <div className="absolute right-3 sm:right-4 bottom-24 sm:bottom-28 z-20 flex flex-col gap-2.5 pointer-events-auto">
            {/* Tombol Deteksi Lokasi Saya (GPS) */}
            <button
              type="button"
              onClick={detectUserGPS}
              title="Pusatkan ke Lokasi Saya"
              className={`w-11 h-11 rounded-2xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center text-slate-700 hover:text-[#007AFF] hover:bg-blue-50 transition active:scale-95 ${
                isLocating ? "animate-spin text-blue-500" : ""
              }`}
            >
              <Crosshair size={22} className={locationSuccess ? "text-[#007AFF]" : ""} />
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. GOOGLE MAPS STYLE BOTTOM SHEET / FLOATING DETAIL CARD       */}
      {/* ============================================================== */}
      {activeSelectedPosko && (
        <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none p-2.5 sm:p-4">
          <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.18)] border border-gray-100 p-4 sm:p-5 pointer-events-auto max-h-[82vh] overflow-y-auto no-scrollbar animate-slideUp">
            {/* Header Posko & Tombol Tutup */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold uppercase tracking-wider ${
                      activeSelectedPosko.tipe === "medis"
                        ? "bg-rose-100 text-rose-700"
                        : activeSelectedPosko.tipe === "logistik"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-cyan-100 text-cyan-800"
                    }`}
                  >
                    {activeSelectedPosko.tipeLabel}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {activeSelectedPosko.status}
                  </span>
                </div>

                <h2 className="text-[17px] font-bold text-slate-900 leading-snug">
                  {activeSelectedPosko.nama}
                </h2>
                <p className="text-[12px] text-slate-500 flex items-start gap-1.5 mt-1">
                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>{activeSelectedPosko.alamat}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPosko(null)}
                aria-label="Tutup detail posko"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* KETERANGAN JARAK & ESTIMASI WAKTU TEMPUH (JARAKNYA BERAPA) */}
            <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] rounded-2xl p-3 border border-slate-100 mb-4 text-center">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Jarak
                </p>
                <p className="text-[15px] font-black text-slate-900 mt-0.5">
                  {(activeSelectedPosko as any).formattedDistance || "1,2 km"}
                </p>
              </div>
              <div className="border-x border-slate-200 px-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Car size={11} />
                  Kendaraan
                </p>
                <p className="text-[15px] font-black text-slate-900 mt-0.5">
                  ~{(activeSelectedPosko as any).drivingTimeMinutes || 4} mnt
                </p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-center gap-1">
                  <Footprints size={11} />
                  Jalan Kaki
                </p>
                <p className="text-[15px] font-black text-slate-900 mt-0.5">
                  ~{(activeSelectedPosko as any).walkingTimeMinutes || 15} mnt
                </p>
              </div>
            </div>

            {/* KETERANGAN KETERSEDIAAN LOGISTIK & BANTUAN (TERSEDIA APA) */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[12.5px] font-bold text-slate-900 flex items-center gap-1.5">
                  <Package size={15} className="text-[#00A8B8]" />
                  <span>Ketersediaan Bantuan di Lokasi Ini:</span>
                </h3>
                <span className="text-[11px] font-medium text-slate-500">
                  Kapasitas: {activeSelectedPosko.kapasitas}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {activeSelectedPosko.tersedia.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-2xs flex items-center gap-2"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#E8F8FA] text-[#00A8B8] flex items-center justify-center shrink-0">
                      {item.kategori === "makanan" ? (
                        <Utensils size={14} />
                      ) : item.kategori === "air" ? (
                        <Droplets size={14} />
                      ) : item.kategori === "medis" ? (
                        <HeartPulse size={14} />
                      ) : item.kategori === "tenda" ? (
                        <Tent size={14} />
                      ) : item.kategori === "bayi" ? (
                        <Baby size={14} />
                      ) : item.kategori === "listrik" ? (
                        <Zap size={14} />
                      ) : (
                        <CheckCircle2 size={14} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11.5px] font-bold text-slate-800 leading-tight truncate">
                        {item.nama}
                      </p>
                      <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">
                        ✓ {item.status} {item.jumlah ? `(${item.jumlah})` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Kontak PIC Posko */}
            <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between mb-4 border border-slate-200/60">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[11px] font-bold">
                  PIC
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">
                    {activeSelectedPosko.picNama}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Koordinator Tanggap Darurat
                  </p>
                </div>
              </div>
              <a
                href={`https://wa.me/62${activeSelectedPosko.picTelepon.replace(
                  /^0/,
                  ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition"
              >
                <Phone size={12} />
                <span>Hubungi</span>
              </a>
            </div>

            {/* TOMBOL LIHAT ARAH RUTE & NAVIGASI GOOGLE MAPS */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Tombol Lihat Arah Rute di Peta */}
              <button
                type="button"
                onClick={() => handleToggleRoute(activeSelectedPosko)}
                className={`h-[48px] rounded-2xl font-bold text-[13.5px] flex items-center justify-center gap-2 transition shadow-md active:scale-98 ${
                  activeRoute?.id === activeSelectedPosko.id
                    ? "bg-slate-800 text-white hover:bg-slate-900"
                    : "bg-[#007AFF] text-white hover:bg-blue-600"
                }`}
              >
                <Navigation size={17} />
                <span>
                  {activeRoute?.id === activeSelectedPosko.id
                    ? "Sembunyikan Rute"
                    : "Lihat Arah Rute"}
                </span>
              </button>

              {/* Tombol Buka di Aplikasi Google Maps Resmi */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${activeSelectedPosko.lat},${activeSelectedPosko.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-[48px] rounded-2xl bg-white border-2 border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-[13.5px] flex items-center justify-center gap-2 transition active:scale-98"
              >
                <ExternalLink size={16} className="text-slate-500" />
                <span>Buka Google Maps</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppPetaClient(props: AppPetaClientProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen bg-[#F4F6F8] flex items-center justify-center text-slate-500">
          Memuat Halaman Peta...
        </div>
      }
    >
      <PetaContent {...props} />
    </Suspense>
  );
}
