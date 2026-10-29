"use client";

import React, { useState } from "react";
import Link from "next/link";

export type NotificationCategory = "semua" | "laporan" | "relawan" | "donasi";

export interface NotificationItem {
  id: string;
  category: "laporan" | "relawan" | "donasi";
  title: string;
  subtitle: string;
  timeAgo: string;
  dateStr: string;
  iconType: "doc" | "volunteer" | "donation" | "warning";
  read: boolean;
  details: {
    referenceCode?: string;
    statusBadge?: string;
    location?: string;
    description: string;
    nextSteps?: string[];
    actionLabel?: string;
    actionUrl?: string;
  };
}

interface NotificationClientProps {
  user: {
    id?: string;
    name?: string | null;
    username?: string;
    email?: string | null;
    role?: string;
  };
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    category: "laporan",
    title: "Laporan diperbarui",
    subtitle: "Laporan #SATU-00125 sedang diverifikasi",
    timeAgo: "2 Jam lalu",
    dateStr: "Hari ini, 10:24 WIB",
    iconType: "doc",
    read: false,
    details: {
      referenceCode: "SATU-00125",
      statusBadge: "Sedang Diverifikasi",
      location: "Kampung Melayu, RT 04 / RW 02",
      description:
        "Laporan darurat mandiri Anda telah diterima oleh Tim Triage Reaksi Cepat PMI Jakarta. Petugas sedang memverifikasi kebutuhan perahu karet dan pasokan logistik darurat.",
      nextSteps: [
        "Petugas PMI sedang menuju titik koordinat untuk asesmen cepat.",
        "Pastikan keluarga berada di titik kumpul aman atau posko evakuasi terdekat.",
        "Pemberitahuan berikutnya akan dikirim begitu verifikasi lapangan selesai.",
      ],
      actionLabel: "Buka Peta & Lokasi Posko",
      actionUrl: "/app",
    },
  },
  {
    id: "notif-2",
    category: "relawan",
    title: "Relawan diterima",
    subtitle: "Kamu terdaftar dalam kegiatan relawan",
    timeAgo: "8 Jam lalu",
    dateStr: "Hari ini, 04:15 WIB",
    iconType: "volunteer",
    read: false,
    details: {
      referenceCode: "REL-2026-089",
      statusBadge: "Terdaftar Aktif",
      location: "Posko Induk PMI Jakarta Timur",
      description:
        "Selamat! Pendaftaran Anda sebagai Relawan Tanggap Darurat Siaga Banjir telah disetujui oleh Koordinator Lapangan. Anda ditempatkan di Divisi Dapur Umum & Distribusi Logistik.",
      nextSteps: [
        "Ikuti sesi pengarahan (briefing) singkat sebelum penugasan lapangan.",
        "Gunakan rompi relawan dan bawa perlengkapan identitas pribadi.",
        "Hubungi koordinator posko di Pos Utama bila membutuhkan transportasi penjemputan.",
      ],
      actionLabel: "Lihat Profil & Riwayat",
      actionUrl: "/app/profil",
    },
  },
  {
    id: "notif-3",
    category: "donasi",
    title: "Update donasi",
    subtitle: "Donasi kamu telah disalurkan",
    timeAgo: "2 Hari lalu",
    dateStr: "26 Okt 2026, 14:00 WIB",
    iconType: "donation",
    read: true,
    details: {
      referenceCode: "DNS-4491-ID",
      statusBadge: "Tersalurkan 100%",
      location: "Pos Pengungsian SDN 01 Kampung Melayu",
      description:
        "Paket bantuan logistik makanan siap saji dan selimut hangat yang Anda donasikan telah sukses disalurkan langsung kepada 42 kepala keluarga terdampak banjir luapan kali.",
      nextSteps: [
        "Laporan pertanggungjawaban penyaluran telah ditandatangani oleh Ketua RW setempat.",
        "Terima kasih atas kepedulian tulus Anda dalam meringankan beban sesama.",
      ],
      actionLabel: "Cek Riwayat Donasi",
      actionUrl: "/app/profil",
    },
  },
  {
    id: "notif-4",
    category: "laporan",
    title: "Situasi Terkini",
    subtitle: "Ada pembaruan kondisi darurat di wilayah tertentu",
    timeAgo: "5 Hari lalu",
    dateStr: "23 Okt 2026, 09:30 WIB",
    iconType: "warning",
    read: true,
    details: {
      referenceCode: "ALERT-BMKG-JKT",
      statusBadge: "Siaga Waspada",
      location: "Bantaran Ciliwung, Jakarta Timur & Jakarta Selatan",
      description:
        "Pintu Air Manggarai dan Katulampa mencatat kenaikan debit air status Siaga 2. Warga di sepanjang bantaran sungai diimbau waspada dan memindahkan barang berharga ke tempat aman.",
      nextSteps: [
        "Jalur evakuasi utama: Jl. Otista Raya menuju GOR Gelanggang Remaja.",
        "Nomor darurat Call Center 112 atau PMI 021-3907028.",
        "Hindari menyentuh kabel listrik yang terendam air.",
      ],
      actionLabel: "Lihat Peta Siaga Bencana",
      actionUrl: "/app",
    },
  },
];

export default function NotificationClient({ user }: NotificationClientProps) {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("semua");
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null);

  // Filter list
  const filteredNotifications = notifications.filter((notif) => {
    if (activeCategory === "semua") return true;
    return notif.category === activeCategory;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleCardClick = (item: NotificationItem) => {
    // Mark as read
    if (!item.read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
      );
    }
    setSelectedNotif(item);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="w-full min-h-screen bg-white text-[#1A1A1A] antialiased selection:bg-navTeal selection:text-white flex flex-col justify-between">
      {/* CONTAINER UTAMA (Responsif Mobile & Desktop, 100% Murni Sesuai Desain Figma) */}
      <div className="w-full max-w-[480px] lg:max-w-xl mx-auto bg-white min-h-screen flex flex-col justify-between px-6 pt-7 pb-28 relative">
        {/* BAGIAN ATAS: HEADER, 4 PILL FILTER BUTTONS, & DAFTAR KARTU NOTIFIKASI */}
        <div>
          {/* 1. HEADER JUDUL & SUBJUDUL */}
          <header className="mb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[28px] font-bold text-[#111111] tracking-tight leading-tight">
                  Notifikasi
                </h1>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-navTeal/15 text-navTeal border border-navTeal/30">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <p className="text-[13.5px] font-normal text-subGray mt-1 leading-snug">
                Informasi terbaru tentang aktivitas kamu
              </p>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="btn-interactive text-[11.5px] font-medium text-navTeal hover:text-navyActive hover:underline mt-1.5 focus:outline-none cursor-pointer"
              >
                Tandai dibaca
              </button>
            )}
          </header>

          {/* 2. BARIS 4 FILTER PILL (Semua, Laporan, Relawan, Donasi) */}
          <div
            className="grid grid-cols-4 gap-2.5 mb-6"
            role="tablist"
            aria-label="Filter Kategori Notifikasi"
          >
            {/* Tab 1: Semua */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "semua"}
              onClick={() => setActiveCategory("semua")}
              className={`filter-pill-btn btn-interactive h-[36px] rounded-full text-[12.5px] font-medium flex items-center justify-center border transition-all cursor-pointer focus:outline-none ${
                activeCategory === "semua"
                  ? "bg-navyActive text-white shadow-pill-active border-navyActive"
                  : "bg-white text-[#1E1E1E] hover:border-navyActive shadow-pill-inactive border-[#C6C6C8]"
              }`}
            >
              Semua
            </button>

            {/* Tab 2: Laporan */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "laporan"}
              onClick={() => setActiveCategory("laporan")}
              className={`filter-pill-btn btn-interactive h-[36px] rounded-full text-[12.5px] font-medium flex items-center justify-center border transition-all cursor-pointer focus:outline-none ${
                activeCategory === "laporan"
                  ? "bg-navyActive text-white shadow-pill-active border-navyActive"
                  : "bg-white text-[#1E1E1E] hover:border-navyActive shadow-pill-inactive border-[#C6C6C8]"
              }`}
            >
              Laporan
            </button>

            {/* Tab 3: Relawan */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "relawan"}
              onClick={() => setActiveCategory("relawan")}
              className={`filter-pill-btn btn-interactive h-[36px] rounded-full text-[12.5px] font-medium flex items-center justify-center border transition-all cursor-pointer focus:outline-none ${
                activeCategory === "relawan"
                  ? "bg-navyActive text-white shadow-pill-active border-navyActive"
                  : "bg-white text-[#1E1E1E] hover:border-navyActive shadow-pill-inactive border-[#C6C6C8]"
              }`}
            >
              Relawan
            </button>

            {/* Tab 4: Donasi */}
            <button
              type="button"
              role="tab"
              aria-selected={activeCategory === "donasi"}
              onClick={() => setActiveCategory("donasi")}
              className={`filter-pill-btn btn-interactive h-[36px] rounded-full text-[12.5px] font-medium flex items-center justify-center border transition-all cursor-pointer focus:outline-none ${
                activeCategory === "donasi"
                  ? "bg-navyActive text-white shadow-pill-active border-navyActive"
                  : "bg-white text-[#1E1E1E] hover:border-navyActive shadow-pill-inactive border-[#C6C6C8]"
              }`}
            >
              Donasi
            </button>
          </div>

          {/* 3. DAFTAR KARTU NOTIFIKASI */}
          <section id="notificationList" aria-label="Daftar Notifikasi" className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-[18px] border border-dashed border-gray-200">
                <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </div>
                <h3 className="text-[14px] font-semibold text-[#1A1A1A]">Belum Ada Notifikasi</h3>
                <p className="text-[12px] text-subGray mt-1">
                  Tidak ada pemberitahuan baru di kategori &ldquo;{activeCategory}&rdquo;.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  data-category={notif.category}
                  onClick={() => handleCardClick(notif)}
                  className="btn-interactive notif-card-item w-full text-left bg-white rounded-[18px] px-4 py-4 shadow-notif-card border border-gray-100/90 hover:border-gray-200 flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-navTeal cursor-pointer relative transition-all"
                >
                  {/* Indicator unread dot */}
                  {!notif.read && (
                    <span
                      aria-label="Belum dibaca"
                      className="absolute top-4 right-4 w-2 h-2 rounded-full bg-navTeal ring-4 ring-navTeal/20"
                    />
                  )}

                  {/* ICON AVATAR CIRCLE */}
                  {notif.iconType === "doc" && (
                    <div className="w-[46px] h-[46px] rounded-full bg-iconCircleBlue flex items-center justify-center flex-shrink-0 text-[#1A1A1A]">
                      <svg
                        className="w-[22px] h-[22px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5z" />
                        <path d="M14 2v5h5" />
                        <line x1="9" y1="13" x2="15" y2="13" />
                        <line x1="9" y1="17" x2="15" y2="17" />
                      </svg>
                    </div>
                  )}

                  {notif.iconType === "volunteer" && (
                    <div className="w-[46px] h-[46px] rounded-full bg-iconCircleBlue flex items-center justify-center flex-shrink-0 text-iconTeal">
                      <svg className="w-[23px] h-[23px]" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="8.5" r="3.2" />
                        <path d="M3.5 18.5c0-2.6 2.5-4.5 5.5-4.5s5.5 1.9 5.5 4.5v.5h-11v-.5z" />
                        <circle cx="16.2" cy="9.5" r="2.6" />
                        <path d="M14.2 19v-.4c0-1.7-.6-3.1-1.7-4.1.9-.3 2-.5 3.2-.5 2.7 0 4.8 1.6 4.8 3.8V19h-6.3z" />
                      </svg>
                    </div>
                  )}

                  {notif.iconType === "donation" && (
                    <div className="w-[46px] h-[46px] rounded-full bg-iconCircleBlue flex items-center justify-center flex-shrink-0 text-iconTeal">
                      <svg
                        className="w-[22px] h-[22px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 12 20 21 4 21 4 12" />
                        <rect x="2" y="7" width="20" height="5" rx="1" />
                        <line x1="12" y1="21" x2="12" y2="7" />
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                      </svg>
                    </div>
                  )}

                  {notif.iconType === "warning" && (
                    <div className="w-[46px] h-[46px] rounded-full bg-warningAmber flex items-center justify-center flex-shrink-0 text-[#1A1A1A]">
                      <svg
                        className="w-[23px] h-[23px]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.9"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                  )}

                  {/* KONTEN TEKS KARTU */}
                  <div className="min-w-0 flex-1 pr-4">
                    <h2 className="text-[15px] font-semibold text-[#1A1A1A] leading-snug">
                      {notif.title}
                    </h2>
                    <p className="text-[12px] font-normal text-subGray leading-snug mt-0.5 truncate">
                      {notif.subtitle}
                    </p>
                    <span className="block text-[10px] font-normal text-subGray mt-1">
                      {notif.timeAgo}
                    </span>
                  </div>
                </button>
              ))
            )}
          </section>
        </div>

        {/* 4. FLOATING BOTTOM NAVIGATION BAR (Tab Notifikasi Aktif Teal) */}
        <nav
          aria-label="Navigasi Bawah"
          className="fixed bottom-3 left-1/2 -translate-x-1/2 w-full max-w-[480px] lg:max-w-xl px-6 z-40"
        >
          <div className="w-full bg-white rounded-[24px] shadow-floating-nav border border-[#E6F4F6] px-4 py-3">
            <div className="grid grid-cols-4 items-center">
              {/* Tab 1: Beranda */}
              <Link
                href="/app"
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
                  <path d="M3 10.5L12 3l9 7.5v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9z" />
                  <rect x="9" y="13" width="6" height="8" rx="1" />
                  <line x1="9" y1="16" x2="15" y2="16" />
                </svg>
                <span className="text-[10.5px] font-normal tracking-tight">Beranda</span>
              </Link>

              {/* Tab 2: Aktivitas */}
              <Link
                href="/app/profil"
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
                <span className="text-[10.5px] font-normal tracking-tight">Aktivitas</span>
              </Link>

              {/* Tab 3: Notifikasi (Aktif Teal Sesuai Gambar) */}
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
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <span className="text-[10.5px] font-medium tracking-tight">Notifikasi</span>
              </button>

              {/* Tab 4: Profil */}
              <Link
                href="/app/profil"
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
                  <circle cx="12" cy="7.5" r="3.5" />
                  <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
                  <line x1="4" y1="20" x2="20" y2="20" />
                </svg>
                <span className="text-[10.5px] font-normal tracking-tight">Profil</span>
              </Link>
            </div>
          </div>
        </nav>
      </div>

      {/* MODAL DETAIL NOTIFIKASI */}
      {selectedNotif && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeUp"
          onClick={() => setSelectedNotif(null)}
        >
          <div
            className="w-full max-w-[440px] bg-white rounded-[24px] p-6 shadow-2xl relative border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Modal */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedNotif.iconType === "warning"
                      ? "bg-warningAmber text-[#1A1A1A]"
                      : selectedNotif.iconType === "volunteer" || selectedNotif.iconType === "donation"
                      ? "bg-iconCircleBlue text-iconTeal"
                      : "bg-iconCircleBlue text-[#1A1A1A]"
                  }`}
                >
                  {selectedNotif.iconType === "doc" && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5z" />
                      <path d="M14 2v5h5" />
                    </svg>
                  )}
                  {selectedNotif.iconType === "volunteer" && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="9" cy="8.5" r="3.2" />
                      <path d="M3.5 18.5c0-2.6 2.5-4.5 5.5-4.5s5.5 1.9 5.5 4.5v.5h-11v-.5z" />
                    </svg>
                  )}
                  {selectedNotif.iconType === "donation" && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <polyline points="20 12 20 21 4 21 4 12" />
                      <rect x="2" y="7" width="20" height="5" rx="1" />
                    </svg>
                  )}
                  {selectedNotif.iconType === "warning" && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    </svg>
                  )}
                </div>

                <div>
                  <h3 className="text-[17px] font-bold text-[#1A1A1A] leading-tight">
                    {selectedNotif.title}
                  </h3>
                  <p className="text-[11.5px] text-subGray mt-0.5">
                    {selectedNotif.dateStr}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black focus:outline-none cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Badges / Meta */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {selectedNotif.details.statusBadge && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-navTeal/15 text-navTeal border border-navTeal/20">
                  {selectedNotif.details.statusBadge}
                </span>
              )}
              {selectedNotif.details.referenceCode && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono bg-gray-100 text-[#555]">
                  #{selectedNotif.details.referenceCode}
                </span>
              )}
              {selectedNotif.details.location && (
                <span className="inline-flex items-center text-[11.5px] text-[#555] gap-1">
                  <svg className="w-3.5 h-3.5 text-navTeal" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {selectedNotif.details.location}
                </span>
              )}
            </div>

            {/* Description Body */}
            <div className="bg-gray-50/80 rounded-[14px] p-3.5 border border-gray-100 text-[12.5px] text-[#333] leading-relaxed mb-4">
              {selectedNotif.details.description}
            </div>

            {/* Next Steps / Details List */}
            {selectedNotif.details.nextSteps && selectedNotif.details.nextSteps.length > 0 && (
              <div className="mb-5">
                <h4 className="text-[12px] font-semibold text-[#1A1A1A] mb-2 uppercase tracking-wide">
                  Tindakan &amp; Catatan Penting
                </h4>
                <ul className="space-y-1.5 text-[12px] text-[#444]">
                  {selectedNotif.details.nextSteps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-navTeal mt-1.5 shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              {selectedNotif.details.actionLabel && selectedNotif.details.actionUrl && (
                <Link
                  href={selectedNotif.details.actionUrl}
                  className="btn-interactive flex-1 py-2.5 px-4 rounded-[12px] bg-navyActive hover:bg-[#16334a] text-white text-[12.5px] font-medium text-center focus:outline-none"
                >
                  {selectedNotif.details.actionLabel}
                </Link>
              )}
              <button
                type="button"
                onClick={() => setSelectedNotif(null)}
                className="btn-interactive py-2.5 px-4 rounded-[12px] bg-gray-100 hover:bg-gray-200 text-[#333] text-[12.5px] font-medium focus:outline-none cursor-pointer"
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
