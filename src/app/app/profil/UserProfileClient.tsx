"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface UserProfileClientProps {
  user: {
    id: string;
    name?: string | null;
    username: string;
    email?: string | null;
    role: string;
  };
}

export default function UserProfileClient({ user }: UserProfileClientProps) {
  // Modal State
  const [modalData, setModalData] = useState<{
    open: boolean;
    title: string;
    type: "datadiri" | "riwayat" | "aktivitas" | "donasi" | "bantuan" | "pengaturan" | "foto" | null;
  }>({
    open: false,
    title: "",
    type: null,
  });

  // Edit Data Diri Local State
  const [namaLengkap, setNamaLengkap] = useState(user.name || user.username || "James");
  const [noHp, setNoHp] = useState("0812-3456-7890");

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (text: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(text);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  const handleMenuClick = (type: "datadiri" | "riwayat" | "aktivitas" | "donasi" | "bantuan" | "pengaturan") => {
    const titles = {
      datadiri: "Data Diri Pengguna",
      riwayat: "Riwayat Laporan Mandiri",
      aktivitas: "Aktivitas Laporan Bencana",
      donasi: "Riwayat Donasi Bantuan",
      bantuan: "Bantuan & Panduan Darurat",
      pengaturan: "Pengaturan Akun",
    };
    setModalData({ open: true, title: titles[type], type });
  };

  const handleProfileClick = () => {
    setModalData({ open: true, title: "Foto Profil Pengguna", type: "foto" });
  };

  const closeModal = () => {
    setModalData((prev) => ({ ...prev, open: false, type: null }));
  };

  const displayName = namaLengkap || user.username || "James";
  const userEmail = user.email || "jamesmickel@gmail.com";

  return (
    <div className="text-[#1A1A1A] antialiased selection:bg-navTeal selection:text-white min-h-screen flex flex-col justify-between bg-white">
      {/* CONTAINER UTAMA (Responsif Mobile & Desktop, 100% Murni Sesuai Desain) */}
      <div className="w-full max-w-[480px] lg:max-w-xl mx-auto bg-white min-h-screen flex flex-col justify-between px-6 pt-7 pb-24 relative">
        {/* BAGIAN ATAS: JUDUL, KARTU USER, & KARTU DAFTAR MENU */}
        <div>
          {/* 1. HEADER JUDUL "Profil" */}
          <header className="mb-6 flex items-center justify-between">
            <h1 className="text-[28px] font-bold text-[#1E1E1E] tracking-tight leading-tight">
              Profil
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E6F4F6] text-navTeal border border-[#CDEEF2]">
              Masyarakat (USER)
            </span>
          </header>

          {/* 2. KARTU PROFIL PENGGUNA */}
          <section aria-label="Informasi Akun Pengguna" className="mb-6">
            <div className="w-full bg-white rounded-[20px] p-5 shadow-profile-card border border-gray-100/80 flex items-center gap-5">
              {/* Button Lingkaran Avatar Hitam */}
              <button
                type="button"
                onClick={handleProfileClick}
                aria-label="Ubah Foto Profil"
                className="btn-interactive w-[64px] h-[64px] rounded-full bg-black shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navTeal flex items-center justify-center text-white text-xl font-bold cursor-pointer"
              >
                <span>{displayName.slice(0, 2).toUpperCase()}</span>
              </button>

              {/* Nama & Email */}
              <div className="min-w-0 flex-1">
                <h2 className="text-[17px] font-bold text-[#1A1A1A] leading-snug truncate">
                  {displayName}
                </h2>
                <p className="text-[14.5px] font-normal text-[#2B2B2B] leading-snug truncate mt-0.5">
                  {userEmail}
                </p>
              </div>
            </div>
          </section>

          {/* 3. KARTU MENU PROFIL (6 Baris Interaktif) */}
          <section aria-label="Menu Pengaturan dan Riwayat">
            <div className="w-full bg-white rounded-[22px] py-3 px-2 shadow-menu-card border border-gray-100/80 flex flex-col">
              {/* Menu 1: Data Diri */}
              <button
                type="button"
                onClick={() => handleMenuClick("datadiri")}
                className="btn-interactive w-full px-4 py-4 rounded-[14px] hover:bg-gray-50/90 flex items-center justify-between text-left group focus:outline-none focus:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Ikon 2 Orang Kuning Emas */}
                  <span className="w-6 h-6 flex items-center justify-center text-iconGold shrink-0">
                    <svg
                      className="w-[22px] h-[22px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="7" r="3.2" />
                      <path d="M3.5 19v-1.2A3.8 3.8 0 0 1 7.3 14h3.4a3.8 3.8 0 0 1 3.8 3.8V19" />
                      <circle cx="16.5" cy="8" r="2.5" />
                      <path d="M14.5 19v-1a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v1" />
                      <line x1="2.5" y1="19" x2="21.5" y2="19" />
                    </svg>
                  </span>
                  <span className="text-[14.5px] font-normal text-[#1E1E1E]">
                    Data Diri
                  </span>
                </div>
                {/* Panah Kanan (Chevron) */}
                <svg
                  className="w-[18px] h-[18px] text-chevronGray group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              {/* Menu 2: Riwayat Laporan */}
              <button
                type="button"
                onClick={() => handleMenuClick("riwayat")}
                className="btn-interactive w-full px-4 py-4 rounded-[14px] hover:bg-gray-50/90 flex items-center justify-between text-left group focus:outline-none focus:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Ikon Dokumen Ceklis Kuning Emas */}
                  <span className="w-6 h-6 flex items-center justify-center text-iconGold shrink-0">
                    <svg
                      className="w-[21px] h-[21px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7" />
                      <path d="M14 2v6h6" />
                      <path d="M16 13V8" />
                      <line x1="8" y1="13" x2="12" y2="13" />
                      <line x1="8" y1="17" x2="11" y2="17" />
                      <polyline points="15 19 17 21 21 17" />
                    </svg>
                  </span>
                  <span className="text-[14.5px] font-normal text-[#1E1E1E]">
                    Riwayat Laporan
                  </span>
                </div>
                <svg
                  className="w-[18px] h-[18px] text-chevronGray group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              {/* Menu 3: Aktivitas Laporan */}
              <button
                type="button"
                onClick={() => handleMenuClick("aktivitas")}
                className="btn-interactive w-full px-4 py-4 rounded-[14px] hover:bg-gray-50/90 flex items-center justify-between text-left group focus:outline-none focus:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Ikon 2 Orang Kuning Emas */}
                  <span className="w-6 h-6 flex items-center justify-center text-iconGold shrink-0">
                    <svg
                      className="w-[22px] h-[22px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="9" cy="7" r="3.2" />
                      <path d="M3.5 19v-1.2A3.8 3.8 0 0 1 7.3 14h3.4a3.8 3.8 0 0 1 3.8 3.8V19" />
                      <circle cx="16.5" cy="8" r="2.5" />
                      <path d="M14.5 19v-1a3 3 0 0 1 3-3h1a3 3 0 0 1 3 3v1" />
                      <line x1="2.5" y1="19" x2="21.5" y2="19" />
                    </svg>
                  </span>
                  <span className="text-[14.5px] font-normal text-[#1E1E1E]">
                    Aktivitas Laporan
                  </span>
                </div>
                <svg
                  className="w-[18px] h-[18px] text-chevronGray group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              {/* Menu 4: Riwayat Donasi */}
              <button
                type="button"
                onClick={() => handleMenuClick("donasi")}
                className="btn-interactive w-full px-4 py-4 rounded-[14px] hover:bg-gray-50/90 flex items-center justify-between text-left group focus:outline-none focus:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Ikon Kotak Hadiah / Donasi Kuning Emas */}
                  <span className="w-6 h-6 flex items-center justify-center text-iconGold shrink-0">
                    <svg
                      className="w-[21px] h-[21px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 12 20 22 4 22 4 12"></polyline>
                      <rect x="2" y="7" width="20" height="5"></rect>
                      <line x1="12" y1="22" x2="12" y2="7"></line>
                      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                    </svg>
                  </span>
                  <span className="text-[14.5px] font-normal text-[#1E1E1E]">
                    Riwayat Donasi
                  </span>
                </div>
                <svg
                  className="w-[18px] h-[18px] text-chevronGray group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              {/* Menu 5: Bantuan & Panduan */}
              <button
                type="button"
                onClick={() => handleMenuClick("bantuan")}
                className="btn-interactive w-full px-4 py-4 rounded-[14px] hover:bg-gray-50/90 flex items-center justify-between text-left group focus:outline-none focus:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Ikon Tanda Tanya Lingkaran Kuning Emas */}
                  <span className="w-6 h-6 flex items-center justify-center text-iconGold shrink-0">
                    <svg
                      className="w-[21px] h-[21px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="9.5"></circle>
                      <path d="M9.2 9a2.8 2.8 0 0 1 5.4 1c0 1.9-2.6 2.6-2.6 2.6"></path>
                      <line x1="12" y1="16.8" x2="12.01" y2="16.8"></line>
                    </svg>
                  </span>
                  <span className="text-[14.5px] font-normal text-[#1E1E1E]">
                    Bantuan &amp; Panduan
                  </span>
                </div>
                <svg
                  className="w-[18px] h-[18px] text-chevronGray group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              {/* Menu 6: Pengaturan */}
              <button
                type="button"
                onClick={() => handleMenuClick("pengaturan")}
                className="btn-interactive w-full px-4 py-4 rounded-[14px] hover:bg-gray-50/90 flex items-center justify-between text-left group focus:outline-none focus:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  {/* Ikon Roda Gigi (Gear) Kuning Emas */}
                  <span className="w-6 h-6 flex items-center justify-center text-iconGold shrink-0">
                    <svg
                      className="w-[21px] h-[21px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                  </span>
                  <span className="text-[14.5px] font-normal text-[#1E1E1E]">
                    Pengaturan
                  </span>
                </div>
                <svg
                  className="w-[18px] h-[18px] text-chevronGray group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>

              {/* Menu 7: Keluar dari Akun (Logout) */}
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="btn-interactive w-full px-4 py-4 rounded-[14px] hover:bg-red-50/80 flex items-center justify-between text-left group focus:outline-none focus:bg-red-50 cursor-pointer transition-colors border-t border-gray-100/70"
              >
                <div className="flex items-center gap-4">
                  <span className="w-6 h-6 flex items-center justify-center text-red-500 shrink-0">
                    <svg
                      className="w-[21px] h-[21px]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </span>
                  <span className="text-[14.5px] font-semibold text-red-600">
                    Keluar dari Akun (Logout)
                  </span>
                </div>
                <svg
                  className="w-[18px] h-[18px] text-red-400 group-hover:translate-x-0.5 transition-transform"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </section>
        </div>

        {/* 4. FLOATING BOTTOM NAVIGATION BAR (Mengambang dengan Glow Cyan Lembut Sesuai Gambar) */}
        <nav
          aria-label="Navigasi Bawah"
          className="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[480px] lg:max-w-xl px-6 z-40"
        >
          <div className="w-full bg-white rounded-[24px] shadow-floating-nav border border-[#E6F4F6] px-4 py-3">
            <div className="grid grid-cols-4 items-center">
              {/* Tab 1: Beranda */}
              <Link
                href="/app"
                className="nav-btn btn-interactive flex flex-col items-center justify-center gap-1 text-[#1A1A1A] hover:text-navTeal focus:outline-none"
              >
                <svg
                  className="w-[24px] h-[24px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 10.5L12 3l9 7.5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
                  <rect x="9" y="13" width="6" height="8" rx="1" />
                  <line x1="9" y1="16" x2="15" y2="16" />
                </svg>
                <span className="text-[10.5px] font-normal tracking-tight">
                  Beranda
                </span>
              </Link>

              {/* Tab 2: Aktivitas */}
              <button
                type="button"
                onClick={() => handleMenuClick("aktivitas")}
                className="nav-btn btn-interactive flex flex-col items-center justify-center gap-1 text-[#1A1A1A] hover:text-navTeal focus:outline-none cursor-pointer"
              >
                <svg
                  className="w-[24px] h-[24px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="4" width="16" height="17" rx="3" />
                  <path d="M8 2v4M16 2v4M8 11h8M8 15h5" />
                </svg>
                <span className="text-[10.5px] font-normal tracking-tight">
                  Aktivitas
                </span>
              </button>

              {/* Tab 3: Notifikasi */}
              <Link
                href="/app/notifikasi"
                className="nav-btn btn-interactive flex flex-col items-center justify-center gap-1 text-[#1A1A1A] hover:text-navTeal focus:outline-none cursor-pointer"
              >
                <svg
                  className="w-[24px] h-[24px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span className="text-[10.5px] font-normal tracking-tight">
                  Notifikasi
                </span>
              </Link>

              {/* Tab 4: Profil (Aktif Teal Sesuai Gambar) */}
              <button
                type="button"
                className="nav-btn btn-interactive flex flex-col items-center justify-center gap-1 text-navTeal focus:outline-none cursor-pointer"
              >
                <svg
                  className="w-[24px] h-[24px]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="7.5" r="3.5"></circle>
                  <path d="M5.5 20a6.5 6.5 0 0 1 13 0"></path>
                  <line x1="4" y1="20" x2="20" y2="20"></line>
                </svg>
                <span className="text-[10.5px] font-medium tracking-tight">
                  Profil
                </span>
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* MODAL INTERAKTIF UNTUK TIAP MENU */}
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

            <div className="py-4 text-xs text-gray-600 leading-relaxed">
              {modalData.type === "datadiri" && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      value={namaLengkap}
                      onChange={(e) => setNamaLengkap(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-navTeal"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Alamat Email</label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">Nomor Telepon / WhatsApp</label>
                    <input
                      type="text"
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-navTeal"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      showToast("Data diri berhasil diperbarui!");
                    }}
                    className="w-full py-2.5 rounded-xl bg-navTeal text-white font-bold text-xs hover:bg-[#128a99] cursor-pointer mt-2"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              )}

              {modalData.type === "riwayat" && (
                <div className="space-y-3">
                  <p className="text-gray-500">Daftar laporan asesmen mandiri atau darurat yang pernah Anda ajukan:</p>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">Laporan Pengungsian Mandiri</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Terkirim</span>
                    </div>
                    <p className="text-[11px] text-gray-500">Posko RW 05 · ID: LPR-8821</p>
                  </div>
                  <Link
                    href="/mandiri"
                    className="block text-center w-full py-2.5 rounded-xl bg-navTeal text-white font-bold text-xs hover:bg-[#128a99]"
                  >
                    Buat Laporan Mandiri Baru &rarr;
                  </Link>
                </div>
              )}

              {modalData.type === "aktivitas" && (
                <div className="space-y-3">
                  <p className="text-gray-500">Status tindak lanjut laporan Anda di lapangan:</p>
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                      <p className="font-bold text-slate-900">Laporan Diterima Sistem</p>
                      <p className="text-[11px] text-slate-400">Verifikasi otomatis AI berhasil</p>
                    </div>
                    <div className="relative">
                      <span className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-navTeal border-2 border-white"></span>
                      <p className="font-bold text-slate-900">Koordinasi Relawan Lapangan</p>
                      <p className="text-[11px] text-slate-400">Tim Posko RW 05 sedang menyiapkan logistik</p>
                    </div>
                  </div>
                </div>
              )}

              {modalData.type === "donasi" && (
                <div className="space-y-3">
                  <p className="text-gray-500">Riwayat partisipasi donasi Anda untuk korban bencana:</p>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">Donasi Sembako &amp; Vitamin</p>
                      <p className="text-[11px] text-slate-400">Posko Pengungsian RW 05</p>
                    </div>
                    <span className="text-xs font-bold text-navTeal">Rp 100.000</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Terima kasih atas kontribusi kemanusiaan Anda.</p>
                </div>
              )}

              {modalData.type === "bantuan" && (
                <div className="space-y-3">
                  <p className="text-gray-500">Pusat Bantuan &amp; Panduan Keselamatan:</p>
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                    <p className="font-bold">Hotline Darurat Nasional</p>
                    <p className="text-[11px]">📞 112 (Bebas Pulsa - BPBD &amp; SAR)</p>
                    <p className="text-[11px]">🏥 (021) 7992325 (Posko Pusat PMI)</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <p className="font-bold text-slate-800">Panduan Siaga Bencana</p>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Siapkan dokumen penting, obat pribadi, air minum, dan ikuti instruksi evakuasi resmi dari relawan.
                    </p>
                  </div>
                </div>
              )}

              {modalData.type === "pengaturan" && (
                <div className="space-y-3">
                  <p className="text-gray-500">Pengaturan akun dan keamanan:</p>
                  <Link
                    href="/lupa-sandi"
                    className="block w-full py-2.5 px-3 rounded-xl border border-gray-200 text-xs font-bold text-slate-700 hover:bg-gray-50 text-center"
                  >
                    Ganti Kata Sandi (Reset Password)
                  </Link>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/login" })}
                      className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Keluar dari Akun (Logout)
                    </button>
                  </div>
                </div>
              )}

              {modalData.type === "foto" && (
                <div className="space-y-3 text-center">
                  <div className="w-20 h-20 rounded-full bg-black text-white text-2xl font-black mx-auto flex items-center justify-center shadow-lg">
                    {displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="text-xs text-gray-500">Foto profil terhubung dengan inisial nama akun Anda.</p>
                  <button
                    type="button"
                    onClick={() => {
                      closeModal();
                      showToast("Fitur unggah avatar khusus segera tersedia");
                    }}
                    className="w-full py-2 rounded-xl bg-navTeal text-white font-bold text-xs hover:bg-[#128a99] cursor-pointer"
                  >
                    Pilih Foto Baru
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={closeModal}
                className="btn-interactive px-4 py-2 rounded-xl bg-[#1A1A1A] text-white text-xs font-semibold hover:bg-black cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FEEDBACK RINGAN */}
      <div
        id="toastBanner"
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 bg-[#1A1A1A] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 ${
          toastMessage ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-navTeal shrink-0"></span>
        <span id="toastText">{toastMessage}</span>
      </div>
    </div>
  );
}
