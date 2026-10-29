"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ChevronLeft,
  Search,
  List,
  Map as MapIcon,
  Stethoscope,
  Building2,
  Package,
  MapPin,
  Phone,
  Navigation,
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
} from "lucide-react";

// Dynamic import for Leaflet facility map to avoid SSR issues
const FacilitiesMap = dynamic(() => import("./FacilitiesMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] bg-slate-100 flex items-center justify-center text-xs text-slate-400">
      Memuat Peta Fasilitas...
    </div>
  ),
});

export interface FacilityItem {
  id: string;
  nama: string;
  area: string;
  alamat: string;
  lat: number;
  lng: number;
  kategori: "medis" | "posko" | "bantuan";
  kategoriLabel: string;
  jarak: string;
  status: string;
  kapasitas: string;
}

interface CariBantuanClientProps {
  user: {
    name?: string | null;
    username: string;
  };
  facilities: FacilityItem[];
  initialCategory?: "semua" | "posko" | "medis" | "bantuan";
  initialView?: "daftar" | "peta";
}

export default function CariBantuanClient({
  user,
  facilities,
  initialCategory,
  initialView,
}: CariBantuanClientProps) {
  const [viewMode, setViewMode] = useState<"daftar" | "peta">(initialView || "daftar");
  const [activeCategory, setActiveCategory] = useState<"semua" | "posko" | "medis" | "bantuan">(
    initialCategory || "semua"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFacility, setSelectedFacility] = useState<FacilityItem | null>(null);

  // Filter facilities based on search and category
  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const matchCategory =
        activeCategory === "semua" || f.kategori === activeCategory;
      const matchSearch =
        !searchQuery ||
        f.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.kategoriLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [facilities, activeCategory, searchQuery]);

  return (
    <div className="w-full max-w-[480px] lg:max-w-2xl mx-auto bg-white min-h-screen flex flex-col justify-between relative pb-24">
      {/* ============================================================== */}
      {/* HEADER & SEARCH & CONTROLS                                     */}
      {/* ============================================================== */}
      <div className="px-6 pt-8 pb-4 flex-1 flex flex-col">
        {/* 1. Header */}
        <header className="flex items-center gap-3.5 mb-6">
          <Link
            href="/app"
            aria-label="Kembali ke Beranda"
            className="w-[38px] h-[38px] rounded-full bg-[#EFEFEF] hover:bg-[#E4E4E4] flex items-center justify-center text-[#3A3A3C] active:scale-95 transition-all"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-[20px] font-bold text-[#1A1A1A] tracking-tight">
            Cari Bantuan
          </h1>
        </header>

        {/* 2. Search Bar */}
        <div className="relative mb-5">
          <div className="w-full h-[54px] rounded-[18px] bg-[#F2F2F2] border border-[#E2E2E2] px-4 flex items-center gap-3 focus-within:border-slate-800 focus-within:bg-white transition">
            <Search size={20} className="text-[#686868]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari lokasi atau jenis bantuan"
              className="w-full bg-transparent text-[13px] text-[#1A1A1A] placeholder-[#8C8C8C] font-normal focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* 3. Filter Category Pills */}
        <div className="grid grid-cols-4 gap-2 mb-5" role="tablist">
          {[
            { id: "semua", label: "Semua" },
            { id: "posko", label: "Posko" },
            { id: "medis", label: "Medis" },
            { id: "bantuan", label: "Titik Bantuan" },
          ].map((pill) => {
            const isActive = activeCategory === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveCategory(pill.id as any)}
                className={`h-[34px] rounded-full text-[11px] font-semibold flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-[#0D1F2D] text-white shadow-sm"
                    : "bg-white border border-[#D4D4D4] text-[#2B2B2B] hover:border-slate-800"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* 4. Segmented Control: Daftar vs Peta */}
        <div className="bg-[#EFEFEF] p-1.5 rounded-[18px] grid grid-cols-2 gap-1.5 mb-6">
          <button
            type="button"
            onClick={() => setViewMode("daftar")}
            className={`h-[42px] rounded-[14px] flex items-center justify-center gap-2 text-[12.5px] font-semibold transition-all ${
              viewMode === "daftar"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <List size={16} />
            <span>Daftar</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("peta")}
            className={`h-[42px] rounded-[14px] flex items-center justify-center gap-2 text-[12.5px] font-semibold transition-all ${
              viewMode === "peta"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <MapIcon size={16} />
            <span>Peta</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: DAFTAR KARTU FASILITAS                                */}
        {/* ============================================================== */}
        {viewMode === "daftar" && (
          <div className="space-y-3.5 animate-fadeIn">
            {filteredFacilities.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Package size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-semibold text-slate-700">
                  Tidak ada posko atau layanan ditemukan
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Coba kata kunci lain atau ubah filter kategori.
                </p>
              </div>
            ) : (
              filteredFacilities.map((facility) => {
                const isMedis = facility.kategori === "medis";
                const isPosko = facility.kategori === "posko";

                return (
                  <button
                    key={facility.id}
                    type="button"
                    onClick={() => setSelectedFacility(facility)}
                    className="w-full text-left bg-white rounded-[18px] p-4 shadow-sm border border-slate-100 hover:border-[#15B2C6]/50 flex items-center gap-4 active:scale-98 transition-all focus:outline-none"
                  >
                    {/* Icon Container */}
                    <div
                      className={`w-[46px] h-[46px] rounded-[14px] flex items-center justify-center flex-shrink-0 ${
                        isMedis
                          ? "bg-[#DAF2F6] text-[#0098A6]"
                          : isPosko
                          ? "bg-[#FFF4D8] text-[#FFA800]"
                          : "bg-[#E4F1FA] text-[#005AE0]"
                      }`}
                    >
                      {isMedis ? (
                        <Stethoscope size={22} />
                      ) : isPosko ? (
                        <Building2 size={22} />
                      ) : (
                        <Package size={22} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h2 className="text-[14px] font-bold text-slate-900 truncate">
                          {facility.nama}
                        </h2>
                        <span className="text-[11.5px] font-semibold text-slate-400 flex-shrink-0">
                          {facility.jarak}
                        </span>
                      </div>

                      <p className="text-[12px] text-slate-500 truncate mb-1.5">
                        {facility.area}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D8F8E1] text-[#22A84B] text-[10px] font-bold">
                          <CheckCircle2 size={10} />
                          <span>{facility.status}</span>
                        </span>
                        <span className="text-[10.5px] text-slate-400">
                          {facility.kategoriLabel}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: PETA INTERAKTIF                                       */}
        {/* ============================================================== */}
        {viewMode === "peta" && (
          <div className="w-full h-[480px] rounded-[22px] overflow-hidden border border-slate-200 shadow-sm relative animate-fadeIn">
            <FacilitiesMap
              facilities={filteredFacilities}
              onSelectFacility={(fac) => setSelectedFacility(fac)}
            />
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* BOTTOM SHEET DETAIL FASILITAS                                  */}
      {/* ============================================================== */}
      {selectedFacility && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40"
            onClick={() => setSelectedFacility(null)}
          />

          {/* Bottom Sheet Drawer */}
          <div className="fixed bottom-0 left-0 right-0 max-w-[480px] lg:max-w-2xl mx-auto bg-white rounded-t-[26px] p-6 shadow-2xl border-t border-slate-100 z-50 animate-fadeUp">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E6F9FC] text-[#1294A8] text-[10.5px] font-bold uppercase tracking-wider mb-1.5">
                  {selectedFacility.kategoriLabel}
                </span>
                <h3 className="text-[18px] font-bold text-slate-900 leading-snug">
                  {selectedFacility.nama}
                </h3>
                <p className="text-[12.5px] text-slate-500 mt-1 flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#15B2C6]" />
                  <span>{selectedFacility.alamat}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedFacility(null)}
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 active:scale-95 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-5 text-center">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Jarak</span>
                <span className="text-[13px] font-bold text-slate-800">{selectedFacility.jarak}</span>
              </div>
              <div className="border-x border-slate-200">
                <span className="block text-[10px] uppercase font-bold text-slate-400">Status</span>
                <span className="text-[13px] font-bold text-[#22A84B]">{selectedFacility.status}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Kapasitas</span>
                <span className="text-[13px] font-bold text-slate-800">{selectedFacility.kapasitas}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedFacility.lat},${selectedFacility.lng}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-[16px] bg-[#0D1F2D] hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition shadow-sm"
              >
                <Navigation size={15} />
                <span>Buka Petunjuk Arah (Navigasi Rute)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setViewMode("peta");
                  setSelectedFacility(null);
                }}
                className="w-full py-3 px-4 rounded-[16px] bg-[#15B2C6] hover:bg-[#1294A8] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-98 transition"
              >
                <MapIcon size={15} />
                <span>Lihat Titik di Peta</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* FLOATING BOTTOM NAV BAR                                         */}
      {/* ============================================================== */}
      <nav
        aria-label="Navigasi Bawah"
        className="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[480px] lg:max-w-2xl px-6 z-30"
      >
        <div className="w-full bg-white rounded-[24px] shadow-lg border border-[#E6F4F6] px-4 py-3">
          <div className="grid grid-cols-4 items-center">
            <Link
              href="/app"
              className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-[#15B2C6]"
            >
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M3 10.5L12 3l9 7.5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
              </svg>
              <span className="text-[10px]">Beranda</span>
            </Link>

            <Link
              href="/app/aktivitas"
              className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-[#15B2C6]"
            >
              <Calendar className="w-[22px] h-[22px]" strokeWidth={1.9} />
              <span className="text-[10px]">Aktivitas</span>
            </Link>

            <Link
              href="/app/notifikasi"
              className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-[#15B2C6]"
            >
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="text-[10px]">Notifikasi</span>
            </Link>

            <Link
              href="/app/profil"
              className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-[#15B2C6]"
            >
              <svg className="w-[22px] h-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-[10px]">Profil</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
