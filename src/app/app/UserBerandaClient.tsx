"use client";

import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import type { UserMiniMapRef } from "@/components/user/UserMiniMap";

// Dynamic import Leaflet mini map with SSR disabled
const UserMiniMap = dynamic(() => import("@/components/user/UserMiniMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#E8ECEF] flex items-center justify-center text-xs text-slate-400 font-medium animate-pulse">
      Memuat Peta Posko...
    </div>
  ),
});

interface UserBerandaClientProps {
  user: {
    id: string;
    name?: string | null;
    username: string;
    email?: string | null;
    role: string;
  };
}

export default function UserBerandaClient({ user }: UserBerandaClientProps) {
  const router = useRouter();
  const mapRef = useRef<UserMiniMapRef>(null);

  // States
  const [activeTab, setActiveTab] = useState<"Beranda" | "Aktivitas" | "Notifikasi" | "Profil">("Beranda");
  const [poskoInfo, setPoskoInfo] = useState({
    nama: "Posko Pengungsian RW 05",
    jarak: "1,2 km Tersedia",
  });

  // Modal State
  const [modalData, setModalData] = useState<{
    open: boolean;
    title: string;
    type?: "info" | "lapor" | "profil" | "lainnya" | "arahan";
    content?: string;
  }>({
    open: false,
    title: "",
  });

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(text);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const openInfoModal = (title: string, content: string) => {
    setModalData({ open: true, title, type: "info", content });
  };

  const openLainnyaModal = () => {
    setModalData({ open: true, title: "Layanan & Akses Terpadu", type: "lainnya" });
  };

  const openArahanModal = () => {
    setModalData({ open: true, title: "Asisten Bantuan & Arahan", type: "arahan" });
  };

  const openFormModal = (type: "lapor" | "profil") => {
    const titles = {
      lapor: "Laporkan Kondisi Darurat",
      profil: "Profil Pengguna",
    };
    setModalData({ open: true, title: titles[type], type });
  };

  const closeModal = () => {
    setModalData((prev) => ({ ...prev, open: false }));
  };

  // Map Actions
  const centerMapToPosko = () => {
    mapRef.current?.centerToPosko();
  };

  const openPoskoPopup = () => {
    mapRef.current?.openPopup();
  };

  const focusToMapSection = () => {
    const el = document.getElementById("sectionPeta");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        openPoskoPopup();
      }, 450);
    }
  };

  const filterMapCategory = (kategori: string) => {
    const updated = mapRef.current?.setCategoryLocation(kategori);
    if (updated) {
      setPoskoInfo(updated);
    }
  };

  const displayName = user.name || user.username || "Cahaya";

  return (
    <div className="text-[#1C1C1E] antialiased selection:bg-relawanTeal selection:text-white min-h-screen flex flex-col justify-between bg-appBg">
      {/* WRAPPER UTAMA APLIKASI */}
      <div
        id="appWrapper"
        className="w-full max-w-[480px] lg:max-w-5xl mx-auto bg-appBg min-h-screen relative pb-28 lg:pb-12 transition-all duration-300 overflow-hidden"
      >
        {/* HEADER / PROFIL & NOTIFIKASI */}
        <header className="px-5 pt-7 pb-3 lg:px-8 lg:pt-8 lg:pb-5 flex items-center justify-between bg-appBg sticky top-0 z-30">
          <div className="flex items-center gap-3.5">
            {/* Button Avatar Profil */}
            <button
              type="button"
              onClick={() => openFormModal("profil")}
              aria-label="Profil Pengguna"
              className="btn-interactive w-[52px] h-[52px] rounded-full bg-[#D6D6D6] hover:bg-[#CCCCCC] shrink-0 flex items-center justify-center relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-laporDark shadow-inner overflow-hidden group cursor-pointer"
            >
              <span className="text-sm font-bold text-slate-700 uppercase">
                {displayName.slice(0, 2)}
              </span>
            </button>
            <div>
              <h1 className="text-[20px] lg:text-2xl font-bold tracking-tight text-[#1A1A1A] leading-snug">
                Halo, {displayName}!
              </h1>
              <p className="text-[11.5px] lg:text-sm text-[#4A4A4A] font-normal leading-tight mt-0.5">
                Semoga kamu selalu dalam keadaan aman
              </p>
            </div>
          </div>

          {/* Button Lonceng Notifikasi Atas */}
          <button
            type="button"
            onClick={() => {
              setActiveTab("Notifikasi");
              openInfoModal(
                "Notifikasi Darurat Terkini",
                "1. [Peringatan Dini] BMKG: Potensi cuaca ekstrem malam ini.\n2. [Posko Aktif] Posko RW 05 menambah kapasitas tenda darurat & stok obat.\n3. [Kebutuhan Mendesak] Selimut & popok balita dibutuhkan di posko terdekat."
              );
            }}
            aria-label="Notifikasi"
            className="btn-interactive p-2 -mr-1 rounded-full hover:bg-gray-200/60 focus:outline-none focus:ring-2 focus:ring-laporDark relative cursor-pointer"
          >
            <svg
              className="w-[23px] h-[23px] text-[#1A1A1A]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {/* Titik indikator halus */}
            <span id="notifBadge" className="w-2 h-2 rounded-full bg-amber-500 absolute top-2 right-2"></span>
          </button>
        </header>

        {/* KONTEN UTAMA (1 Kolom di Mobile, 2 Kolom Proporsional di Desktop) */}
        <main className="px-5 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-y-5 lg:gap-8">
          {/* KOLOM KIRI (Pada Desktop) / URUTAN ATAS (Pada Mobile) */}
          <div className="lg:col-span-6 space-y-5">
            {/* SECTION 1: SITUASI TERKINI (BANNER PERINGATAN) */}
            <section aria-labelledby="label-situasi-1">
              <h2
                id="label-situasi-1"
                className="text-[11px] font-medium uppercase tracking-[0.04em] text-sectionLabel mb-2"
              >
                SITUASI TERKINI
              </h2>
              <div className="bg-infoCardBg rounded-[16px] p-4 flex items-start gap-3.5 shadow-xs">
                {/* Ikon Segitiga Warning Kuning */}
                <div className="mt-1 shrink-0">
                  <svg className="w-7 h-7" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12.316 4.492c.748-1.356 2.62-1.356 3.368 0l9.39 17.024c.72 1.305-.185 2.984-1.684 2.984H4.61c-1.499 0-2.404-1.679-1.684-2.984l9.39-17.024z"
                      fill="#FDB000"
                    />
                    <path d="M14 10.5v5.2" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
                    <circle cx="14" cy="19.3" r="1.3" fill="#FFFFFF" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-[13.5px] font-semibold text-[#1E2A2F] leading-snug">
                    Informasi Terkini
                  </h3>
                  <p className="text-[11.5px] text-[#2C3A40] leading-[1.45] mt-0.5">
                    Waspada potensi hujan lebat
                    <br className="sm:hidden" /> di wilayah Jakarta dan sekitarnya
                  </p>
                  {/* Button Lihat Detail */}
                  <button
                    type="button"
                    onClick={() =>
                      openInfoModal(
                        "Detail Peringatan Cuaca",
                        "BMKG memperkirakan hujan intensitas tinggi disertai angin kencang di wilayah DKI Jakarta (Jakarta Timur, Jakarta Selatan, dan sekitarnya) pada pukul 17.00 - 22.00 WIB. Pastikan saluran air tidak tersumbat dan siapkan tas siaga bencana."
                      )
                    }
                    className="btn-interactive mt-1.5 inline-flex items-center text-[11.5px] font-medium text-infoLink hover:underline focus:outline-none cursor-pointer"
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 2: SITUASI TERKINI (DUA KARTU AKSI UTAMA) */}
            <section aria-labelledby="label-situasi-2">
              <h2
                id="label-situasi-2"
                className="text-[11px] font-medium uppercase tracking-[0.04em] text-sectionLabel mb-2"
              >
                SITUASI TERKINI
              </h2>
              <div className="grid grid-cols-2 gap-3.5">
                {/* Kartu Kiri: Laporkan Kondisi */}
                <div className="bg-laporCardBg border-[1.5px] border-laporCardBorder rounded-[16px] p-3.5 flex flex-col justify-between min-h-[192px]">
                  <div>
                    {/* Badge Ikon Orang */}
                    <div className="w-9 h-9 rounded-[9px] bg-laporDark flex items-center justify-center text-white mb-3">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <h3 className="text-[13.5px] font-bold text-[#1A1A1A] leading-snug">
                      Laporkan Kondisi
                    </h3>
                    <p className="text-[10.5px] text-[#7A868E] leading-[1.4] mt-1">
                      Laporkan keadaan darurat atau kebutuhan
                    </p>
                  </div>

                  {/* Button Lapor Sekarang */}
                  <Link
                    href="/app/lapor"
                    className="btn-interactive mt-4 w-full py-2.5 px-2 rounded-[11px] bg-laporDark hover:bg-[#1b3546] text-white text-[12px] font-semibold tracking-tight shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-laporDark cursor-pointer text-center block"
                  >
                    Lapor Sekarang
                  </Link>
                </div>

                {/* Kartu Kanan: Cari Bantuan */}
                <div className="bg-cariCardBg border-[1.5px] border-cariCardBorder rounded-[16px] p-3.5 flex flex-col justify-between min-h-[192px]">
                  <div>
                    {/* Badge Ikon Kotak Bantuan */}
                    <div className="w-9 h-9 rounded-[9px] bg-cariOrange flex items-center justify-center text-[#1A1A1A] mb-3">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 12 20 22 4 22 4 12" />
                        <rect x="2" y="7" width="20" height="5" />
                        <line x1="12" y1="22" x2="12" y2="7" />
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                      </svg>
                    </div>
                    <h3 className="text-[13.5px] font-bold text-[#1A1A1A] leading-snug">
                      Cari Bantuan
                    </h3>
                    <p className="text-[10.5px] text-[#8A8270] leading-[1.4] mt-1">
                      Temukan posko dan layanan terdekat
                    </p>
                  </div>

                  {/* Button Cari Bantuan */}
                  <Link
                    href="/app/cari"
                    className="btn-interactive mt-4 w-full py-2.5 px-2 rounded-[11px] bg-cariOrange hover:bg-[#e69700] text-[#1A1A1A] text-[12px] font-bold tracking-tight shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-cariOrange cursor-pointer text-center block"
                  >
                    Cari Bantuan
                  </Link>
                </div>
              </div>
            </section>

            {/* SECTION 3: AKSES BANTUAN (GRID 6 TOMBOL MENU) */}
            <section aria-labelledby="label-akses-bantuan">
              <h2
                id="label-akses-bantuan"
                className="text-[11px] font-medium uppercase tracking-[0.04em] text-sectionLabel mb-2"
              >
                AKSES BANTUAN
              </h2>
              <div className="bg-[#FDFDFD] border border-gray-200/80 rounded-[18px] p-3.5 shadow-xs">
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {/* Item 1: Cari Bantuan */}
                  <button
                    type="button"
                    onClick={() => router.push("/app/cari")}
                    className="btn-interactive bg-white rounded-[15px] py-3 px-1.5 shadow-soft-tile border border-gray-100/80 flex flex-col items-center justify-center gap-2 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-infoLink cursor-pointer"
                  >
                    <div className="w-[38px] h-[38px] rounded-full bg-iconCircleBlue flex items-center justify-center text-laporDark">
                      <svg
                        className="w-[18px] h-[18px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 17c-3.5-2.5-6-5.2-6-8.5a6 6 0 1 1 12 0c0 3.3-2.5 6-6 8.5z" />
                        <circle cx="12" cy="8.5" r="2" />
                        <path d="M5 20.5h14" />
                      </svg>
                    </div>
                    <span className="text-[8.5px] font-medium text-[#3A3A3C] text-center leading-tight">
                      Cari Bantuan
                    </span>
                  </button>

                  {/* Item 2: Layanan Medis */}
                  <button
                    type="button"
                    onClick={() => router.push("/app/cari?kategori=medis")}
                    className="btn-interactive bg-white rounded-[15px] py-3 px-1.5 shadow-soft-tile border border-gray-100/80 flex flex-col items-center justify-center gap-2 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-infoLink cursor-pointer"
                  >
                    <div className="w-[38px] h-[38px] rounded-full bg-iconCircleBlue flex items-center justify-center text-laporDark">
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <rect x="3" y="6" width="18" height="14" rx="2.5" fill="currentColor" />
                        <path d="M12 10v6M9 13h6" stroke="#DBECFA" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>
                    <span className="text-[8.5px] font-medium text-[#3A3A3C] text-center leading-tight">
                      Layanan Medis
                    </span>
                  </button>

                  {/* Item 3: Kebutuhan */}
                  <button
                    type="button"
                    onClick={() => router.push("/app/cari?kategori=logistik")}
                    className="btn-interactive bg-white rounded-[15px] py-3 px-1.5 shadow-soft-tile border border-gray-100/80 flex flex-col items-center justify-center gap-2 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-infoLink cursor-pointer"
                  >
                    <div className="w-[38px] h-[38px] rounded-full bg-iconCircleBlue flex items-center justify-center text-laporDark">
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.5 2.2a1 1 0 0 1 1 0l8 4.4a1 1 0 0 1 .5.87v9.06a1 1 0 0 1-.5.87l-8 4.4a1 1 0 0 1-1 0l-8-4.4a1 1 0 0 1-.5-.87V7.47a1 1 0 0 1 .5-.87l8-4.4z" />
                        <path
                          d="M3.8 7.2L12 11.8l8.2-4.6M12 11.8V21"
                          stroke="#DBECFA"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span className="text-[8.5px] font-medium text-[#3A3A3C] text-center leading-tight">
                      Kebutuhan
                    </span>
                  </button>

                  {/* Item 4: Peta */}
                  <button
                    type="button"
                    onClick={() => router.push("/app/peta")}
                    className="btn-interactive bg-white rounded-[15px] py-3 px-1.5 shadow-soft-tile border border-gray-100/80 flex flex-col items-center justify-center gap-2 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-infoLink cursor-pointer"
                  >
                    <div className="w-[38px] h-[38px] rounded-full bg-iconCircleBlue flex items-center justify-center text-laporDark">
                      <svg
                        className="w-[18px] h-[18px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                        <line x1="8" y1="2" x2="8" y2="18" />
                        <line x1="16" y1="6" x2="16" y2="22" />
                      </svg>
                    </div>
                    <span className="text-[8.5px] font-medium text-[#3A3A3C] text-center leading-tight">
                      Peta
                    </span>
                  </button>

                  {/* Item 5: Posko Terdekat */}
                  <button
                    type="button"
                    onClick={() => router.push("/app/peta?filter=pengungsian")}
                    className="btn-interactive bg-white rounded-[15px] py-3 px-1.5 shadow-soft-tile border border-gray-100/80 flex flex-col items-center justify-center gap-2 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-infoLink cursor-pointer"
                  >
                    <div className="w-[38px] h-[38px] rounded-full bg-iconCircleBlue flex items-center justify-center text-laporDark">
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.3 2.7a1 1 0 0 1 1.4 0l8 7.5A1 1 0 0 1 20 12h-2v8a1 1 0 0 1-1 1h-4v-6h-2v6H7a1 1 0 0 1-1-1v-8H4a1 1 0 0 1-.7-1.8l8-7.5z" />
                      </svg>
                    </div>
                    <span className="text-[8.5px] font-medium text-[#3A3A3C] text-center leading-tight">
                      Posko Terdekat
                    </span>
                  </button>

                  {/* Item 6: Lainnya */}
                  <button
                    type="button"
                    onClick={openLainnyaModal}
                    className="btn-interactive bg-white rounded-[15px] py-3 px-1.5 shadow-soft-tile border border-gray-100/80 flex flex-col items-center justify-center gap-2 hover:border-blue-200 focus:outline-none focus:ring-2 focus:ring-infoLink cursor-pointer"
                  >
                    <div className="w-[38px] h-[38px] rounded-full bg-iconCircleBlue flex items-center justify-center text-laporDark">
                      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="6" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="18" cy="12" r="2" />
                      </svg>
                    </div>
                    <span className="text-[8.5px] font-medium text-[#3A3A3C] text-center leading-tight">
                      Lainnya
                    </span>
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* KOLOM KANAN (Pada Desktop) / URUTAN BAWAH (Pada Mobile) */}
          <div className="lg:col-span-6 space-y-5">
            {/* SECTION 4: BANTUAN DI SEKITARMU (PETA LEAFLET + OVERLAY CARD) */}
            <section id="sectionPeta" aria-labelledby="label-bantuan-sekitar">
              <h2
                id="label-bantuan-sekitar"
                className="text-[11px] font-medium uppercase tracking-[0.04em] text-sectionLabel mb-2"
              >
                BANTUAN DI SEKITARMU
              </h2>

              <div className="bg-white rounded-[20px] shadow-card-float overflow-hidden border border-gray-100">
                {/* Kontainer Peta Leaflet JS */}
                <div className="relative w-full h-[175px] lg:h-[205px] bg-[#E8ECEF]">
                  <UserMiniMap ref={mapRef} onSelectLocation={(loc) => setPoskoInfo(loc)} />

                  {/* Tombol Shortcut Buka Peta Lengkap */}
                  <button
                    type="button"
                    onClick={() => router.push(`/app/peta?posko=${encodeURIComponent(poskoInfo.nama)}`)}
                    title="Buka Peta Navigasi Layar Penuh"
                    className="btn-interactive absolute bottom-2.5 left-2.5 z-20 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs text-[10px] font-bold text-slate-700 border border-gray-200 hover:bg-white flex items-center gap-1 cursor-pointer"
                  >
                    🗺️ Buka Peta Lengkap
                  </button>

                  {/* Tombol Kecil Reset Lokasi di Pojok Kanan Atas Peta */}
                  <button
                    type="button"
                    onClick={centerMapToPosko}
                    title="Fokus ke Posko"
                    className="btn-interactive absolute top-2.5 right-2.5 z-20 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full shadow-xs text-[10px] font-semibold text-laporDark border border-gray-200 hover:bg-white cursor-pointer"
                  >
                    📍 Reset Fokus
                  </button>
                </div>

                {/* Bar Informasi Posko di Bawah Peta (Menyatu seperti di desain) */}
                <div className="relative z-20 -mt-3 bg-white rounded-t-[18px] px-4 py-3.5 flex items-center justify-between">
                  <div>
                    <h3 id="poskoTitle" className="text-[13.5px] font-bold text-[#1A1A1A] leading-snug">
                      {poskoInfo.nama}
                    </h3>
                    <p id="poskoDist" className="text-[12.5px] font-normal text-[#3A3A3C] mt-0.5">
                      {poskoInfo.jarak}
                    </p>
                  </div>

                  {/* Button Lihat di Peta -> Navigasi ke Halaman Peta Penuh Google Maps */}
                  <button
                    type="button"
                    onClick={() => router.push(`/app/peta?posko=${encodeURIComponent(poskoInfo.nama)}`)}
                    className="btn-interactive text-[11.5px] font-bold text-[#EAA92A] hover:text-[#d19015] px-2.5 py-1.5 rounded-lg hover:bg-amber-50 focus:outline-none cursor-pointer flex items-center gap-1"
                  >
                    Lihat di Peta
                    <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 5: BANTU SESAMA (JADI RELAWAN & DONASI) */}
            <section aria-labelledby="label-bantu-sesama">
              <h2
                id="label-bantu-sesama"
                className="text-[11px] font-medium uppercase tracking-[0.04em] text-sectionLabel mb-2"
              >
                BANTU SESAMA
              </h2>
              <div className="grid grid-cols-2 gap-3.5">
                {/* Kartu Kiri: Jadi Relawan */}
                <div className="bg-relawanCardBg border-[1.5px] border-relawanCardBorder rounded-[16px] p-3.5 flex flex-col justify-between min-h-[196px]">
                  <div>
                    {/* Badge Ikon Relawan Teal */}
                    <div className="w-9 h-9 rounded-[9px] bg-relawanTeal flex items-center justify-center text-white mb-3">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <h3 className="text-[13.5px] font-bold text-[#1A1A1A] leading-snug">
                      Jadi Relawan
                    </h3>
                    <p className="text-[10.5px] text-[#738B90] leading-[1.4] mt-1">
                      Daftar untuk membantu kegiatan di lapangan
                    </p>
                  </div>

                  {/* Button JOIN */}
                  <button
                    type="button"
                    onClick={() => router.push("/app/relawan-join")}
                    className="btn-interactive mt-4 w-full py-2.5 px-2 rounded-[11px] bg-ctaTeal hover:bg-[#0e7c8d] text-white text-[12px] font-bold uppercase tracking-wide shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ctaTeal cursor-pointer"
                  >
                    JOIN
                  </button>
                </div>

                {/* Kartu Kanan: Donasi */}
                <div className="bg-relawanCardBg border-[1.5px] border-relawanCardBorder rounded-[16px] p-3.5 flex flex-col justify-between min-h-[196px]">
                  <div>
                    {/* Badge Ikon Donasi Teal */}
                    <div className="w-9 h-9 rounded-[9px] bg-relawanTeal flex items-center justify-center text-white mb-3">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 12 20 22 4 22 4 12" />
                        <rect x="2" y="7" width="20" height="5" />
                        <line x1="12" y1="22" x2="12" y2="7" />
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                      </svg>
                    </div>
                    <h3 className="text-[13.5px] font-bold text-[#1A1A1A] leading-snug">
                      Donasi
                    </h3>
                    <p className="text-[10.5px] text-[#738B90] leading-[1.4] mt-1">
                      Salurkan bantuan untuk kebutuhan yang sedang di perlukan
                    </p>
                  </div>

                  {/* Button DONASI */}
                  <button
                    type="button"
                    onClick={() => router.push("/app/donasi")}
                    className="btn-interactive mt-4 w-full py-2.5 px-2 rounded-[11px] bg-ctaTeal hover:bg-[#0e7c8d] text-white text-[12px] font-bold uppercase tracking-wide shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-ctaTeal cursor-pointer"
                  >
                    DONASI
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 6: BUTUH ARAHAN (KARTU BANTUAN INTERAKTIF) */}
            <section aria-label="Panduan Arahan">
              <div className="bg-white rounded-[18px] p-4 shadow-soft-tile border border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  {/* Ikon Tanda Tanya Dalam Lingkaran */}
                  <div className="shrink-0 text-[#1A1A1A]">
                    <svg
                      className="w-7 h-7"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-[#1A1A1A] leading-snug">
                      Butuh Arahan
                    </h3>
                    <p className="text-[10.5px] text-[#8E8E93] leading-[1.4] mt-0.5">
                      Jawab beberapa pertanyaan untuk menemukan bantuan yang sesuai
                    </p>
                  </div>
                </div>

                {/* Button Mulai */}
                <button
                  type="button"
                  onClick={openArahanModal}
                  className="btn-interactive shrink-0 text-[12px] font-semibold text-[#00A9B5] bg-[#E0F7FA] hover:bg-[#b2ebf2] px-3.5 py-1.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A9B5] cursor-pointer"
                >
                  Mulai
                </button>
              </div>
            </section>
          </div>
        </main>

        {/* BOTTOM NAVIGATION BAR (Mengambang Presisi di Bawah) */}
        <nav
          aria-label="Navigasi Utama"
          className="fixed lg:absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] lg:max-w-full bg-white rounded-t-[24px] shadow-bottom-nav border-t border-gray-100 px-6 py-2.5 z-40"
        >
          <div className="grid grid-cols-4 items-center max-w-md mx-auto">
            {/* Tab 1: Beranda */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("Beranda");
              }}
              className={`nav-tab-btn btn-interactive flex flex-col items-center justify-center py-1 gap-1 focus:outline-none cursor-pointer ${
                activeTab === "Beranda" ? "text-relawanTeal" : "text-[#1A1A1A] hover:text-relawanTeal"
              }`}
            >
              <svg
                className="w-[22px] h-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 10.5L12 3l9 7.5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
                <rect x="9" y="14" width="6" height="7" rx="1" />
              </svg>
              <span className={`text-[9.5px] tracking-tight ${activeTab === "Beranda" ? "font-medium" : "font-normal"}`}>
                Beranda
              </span>
            </button>

            {/* Tab 2: Aktivitas */}
            <button
              type="button"
              onClick={() => router.push("/app/aktivitas")}
              className={`nav-tab-btn btn-interactive flex flex-col items-center justify-center py-1 gap-1 focus:outline-none cursor-pointer ${
                activeTab === "Aktivitas" ? "text-relawanTeal" : "text-[#1A1A1A] hover:text-relawanTeal"
              }`}
            >
              <svg
                className="w-[22px] h-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="4" width="16" height="17" rx="2.5" />
                <path d="M8 2v4M16 2v4M8 11h8M8 15h5" />
              </svg>
              <span className={`text-[9.5px] tracking-tight ${activeTab === "Aktivitas" ? "font-medium" : "font-normal"}`}>
                Aktivitas
              </span>
            </button>

            {/* Tab 3: Notifikasi */}
            <Link
              href="/app/notifikasi"
              className={`nav-tab-btn btn-interactive flex flex-col items-center justify-center py-1 gap-1 focus:outline-none cursor-pointer ${
                activeTab === "Notifikasi" ? "text-relawanTeal" : "text-[#1A1A1A] hover:text-relawanTeal"
              }`}
            >
              <svg
                className="w-[22px] h-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className={`text-[9.5px] tracking-tight ${activeTab === "Notifikasi" ? "font-medium" : "font-normal"}`}>
                Notifikasi
              </span>
            </Link>

            {/* Tab 4: Profil */}
            <Link
              href="/app/profil"
              className={`nav-tab-btn btn-interactive flex flex-col items-center justify-center py-1 gap-1 focus:outline-none cursor-pointer ${
                activeTab === "Profil" ? "text-relawanTeal" : "text-[#1A1A1A] hover:text-relawanTeal"
              }`}
            >
              <svg
                className="w-[22px] h-[22px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className={`text-[9.5px] tracking-tight ${activeTab === "Profil" ? "font-medium" : "font-normal"}`}>
                Profil
              </span>
            </Link>
          </div>
        </nav>
      </div>

      {/* MODAL DIALOG INTERAKTIF */}
      {modalData.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-100 transform transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="text-base font-bold text-[#1A1A1A]">{modalData.title}</h4>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Modal Body: Custom Content depending on Type */}
            <div className="py-4 text-xs text-gray-600 leading-relaxed">
              {modalData.type === "lapor" && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">Kirim laporan cepat ke tim tanggap darurat posko terdekat:</p>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Jenis Kondisi</label>
                    <select className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-laporDark bg-white">
                      <option>Banjir / Genangan Tinggi</option>
                      <option>Butuh Evakuasi Medis / Rentan</option>
                      <option>Kekurangan Logistik & Air Bersih</option>
                      <option>Lansia / Balita Butuh Bantuan Khusus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Keterangan Lokasi</label>
                    <input
                      type="text"
                      placeholder="Contoh: Jl. Kebon Pala RT 04 / RW 05"
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-laporDark"
                    />
                  </div>
                  <div className="pt-1">
                    <Link
                      href="/mandiri"
                      className="block text-center w-full py-2 rounded-xl bg-laporDark text-white text-xs font-semibold hover:bg-slate-800"
                    >
                      Buka Form Asesmen Mandiri Lengkap &rarr;
                    </Link>
                  </div>
                </div>
              )}

              {modalData.type === "lainnya" && (
                <div className="space-y-2.5">
                  <p className="text-xs text-gray-500 mb-2">
                    Akses cepat ke seluruh layanan dan modul terpadu SATU AI:
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      router.push("/app/donasi");
                    }}
                    className="w-full p-3 rounded-2xl border border-gray-200 hover:border-[#00A9B5] hover:bg-[#E0F7FA]/30 flex items-center gap-3 transition-all text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E0F7FA] text-[#00A9B5] flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900">Salurkan Donasi Bencana</h4>
                      <p className="text-[10.5px] text-gray-500">Bantu korban banjir dan gempa secara transparan via QRIS & VA</p>
                    </div>
                    <span className="text-slate-400 font-bold">&rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      router.push("/app/relawan-join");
                    }}
                    className="w-full p-3 rounded-2xl border border-gray-200 hover:border-[#00A9B5] hover:bg-[#E0F7FA]/30 flex items-center gap-3 transition-all text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FFF4E6] text-[#FFA800] flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900">Gabung Jadi Relawan (Open Volunteer)</h4>
                      <p className="text-[10.5px] text-gray-500">Daftarkan diri di tim distribusi logistik, dapur umum, atau medis</p>
                    </div>
                    <span className="text-slate-400 font-bold">&rarr;</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      router.push("/app/aktivitas");
                    }}
                    className="w-full p-3 rounded-2xl border border-gray-200 hover:border-[#00A9B5] hover:bg-[#E0F7FA]/30 flex items-center gap-3 transition-all text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] text-[#10B981] flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900">Aktivitas & Riwayat Saya</h4>
                      <p className="text-[10.5px] text-gray-500">Pantau progres laporan, tugas relawan, dan tanda terima donasi</p>
                    </div>
                    <span className="text-slate-400 font-bold">&rarr;</span>
                  </button>

                  <a
                    href="tel:112"
                    className="w-full p-3 rounded-2xl border border-red-200 bg-red-50/60 hover:bg-red-50 flex items-center gap-3 transition-all text-left cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-red-700">Panggilan Darurat Bebas Pulsa (112)</h4>
                      <p className="text-[10.5px] text-red-500">Hubungkan segera ke Call Center Kedaruratan BNPB & Pemprov</p>
                    </div>
                    <span className="text-red-400 font-bold">&rarr;</span>
                  </a>
                </div>
              )}

              {modalData.type === "arahan" && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#E0F7FA]/40 rounded-2xl border border-[#00A9B5]/20">
                    <p className="text-xs font-bold text-[#007A85]">
                      Apa kondisi atau kebutuhan utama Anda saat ini?
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      Pilih salah satu panduan di bawah untuk diarahkan langsung ke solusi tercepat:
                    </p>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        router.push("/app/lapor");
                      }}
                      className="w-full p-3 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 hover:bg-rose-50/50 flex items-center gap-3 text-left transition cursor-pointer"
                    >
                      <span className="text-xl">🚨</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-rose-800">Darurat Evakuasi & Medis Kritis</h4>
                        <p className="text-[10.5px] text-rose-600">Butuh pertolongan SAR, perahu karet, atau luka parah segera</p>
                      </div>
                      <span className="text-rose-500 text-xs font-bold bg-rose-100 px-2.5 py-1 rounded-lg">Lapor &rarr;</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        router.push("/app/peta?filter=pengungsian");
                      }}
                      className="w-full p-3 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 flex items-center gap-3 text-left transition cursor-pointer"
                    >
                      <span className="text-xl">🏕️</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-amber-900">Tempat Pengungsian / Posko Aman</h4>
                        <p className="text-[10.5px] text-amber-700">Cari shelter terdekat dengan info kapasitas warga</p>
                      </div>
                      <span className="text-amber-700 text-xs font-bold bg-amber-100 px-2.5 py-1 rounded-lg">Peta &rarr;</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        router.push("/app/cari?kategori=logistik");
                      }}
                      className="w-full p-3 rounded-2xl bg-white border border-sky-200 hover:border-sky-400 hover:bg-sky-50/50 flex items-center gap-3 text-left transition cursor-pointer"
                    >
                      <span className="text-xl">📦</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-sky-900">Sembako, Air Bersih, & Obat-obatan</h4>
                        <p className="text-[10.5px] text-sky-700">Cari titik dapur umum dan fasilitas logistik terdekat</p>
                      </div>
                      <span className="text-sky-700 text-xs font-bold bg-sky-100 px-2.5 py-1 rounded-lg">Cari &rarr;</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        router.push("/app/donasi");
                      }}
                      className="w-full p-3 rounded-2xl bg-white border border-teal-200 hover:border-teal-400 hover:bg-teal-50/50 flex items-center gap-3 text-left transition cursor-pointer"
                    >
                      <span className="text-xl">🤲</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-teal-900">Ingin Berdonasi atau Membantu</h4>
                        <p className="text-[10.5px] text-teal-700">Donasi dana darurat atau daftarkan diri sebagai relawan</p>
                      </div>
                      <span className="text-teal-700 text-xs font-bold bg-teal-100 px-2.5 py-1 rounded-lg">Bantu &rarr;</span>
                    </button>
                  </div>
                </div>
              )}

              {modalData.type === "profil" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="text-[11px] text-slate-500">Nama Akun</p>
                    <p className="text-sm font-bold text-slate-900">{displayName}</p>
                    <p className="text-[11px] text-slate-500 mt-2">Email</p>
                    <p className="text-xs font-medium text-slate-700">{user.email || "-"}</p>
                    <p className="text-[11px] text-slate-500 mt-2">Peran Akses</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F8FA] text-[#00AFBF] border border-[#00AFBF]/30">
                      Masyarakat (USER)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        router.push("/app/profil");
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-[#00A9B5] text-white font-bold text-xs hover:bg-[#0e7c8d] transition-colors cursor-pointer"
                    >
                      Buka Profil Lengkap
                    </button>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="py-2.5 px-3 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}

              {modalData.type === "info" && (
                <div className="whitespace-pre-line text-xs text-gray-600 leading-relaxed">
                  {modalData.content}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={closeModal}
                className="btn-interactive px-4 py-2 rounded-xl bg-laporDark text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK RINGAN */}
      <div
        id="toastBox"
        className={`fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 bg-[#10222E] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 ${
          toastMessage ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-relawanTeal shrink-0"></span>
        <span id="toastText">{toastMessage}</span>
      </div>
    </div>
  );
}
