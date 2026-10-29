"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  Activity,
  MapPin,
  Info,
  LogIn,
  AlertCircle,
  Map,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

interface LandingNavbarProps {
  brand?: string;
}

export function LandingNavbar({ brand = "SATU" }: LandingNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Kunci scroll halaman saat menu terbuka di mobile & pasang event listener
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    const handleResize = () => {
      if (window.innerWidth >= 769) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="sg-nav">
      <div className="sg-wrap sg-nav-inner">
        {/* Brand Logo */}
        <Link
          href="/"
          aria-label={`${brand} — Beranda`}
          className="flex items-center gap-2 group z-20"
          onClick={closeMenu}
        >
          <Image
            src="/logo-no-background.png"
            alt={`Logo ${brand} AI`}
            width={40}
            height={40}
            priority
            style={{ objectFit: "contain" }}
            className="transition-transform group-hover:scale-105"
          />
          <span className="text-base font-black tracking-tight text-slate-900 flex items-center">
            {brand} <span className="text-[#15B2C6] ml-1">AI</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FFA800] ml-1 mb-2"></span>
          </span>
        </Link>

        {/* Desktop Navigation (hanya tampil di layar >= 769px via CSS .sg-nav-links) */}
        <nav className="sg-nav-links" aria-label="Navigasi desktop">
          <a href="#home" className="is-active">
            Home
          </a>
          <a href="#situasi">Situasi</a>
          <a href="#posko">Posko</a>
          <a href="#informasi">Informasi</a>
          <Link href="/login" className="hover:text-[#1294A8] transition-colors">
            Masuk
          </Link>
          <Link href="/mandiri/POSKO01" className="sg-btn-orange">
            Lapor Sekarang
          </Link>
        </nav>

        {/* Mobile Hamburger Button (hanya tampil di layar < 769px) */}
        <div className="flex items-center md:hidden z-20">
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Tutup menu" : "Buka menu navigasi"}
            aria-expanded={isOpen}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/95 border border-slate-200 text-slate-800 shadow-sm hover:bg-slate-100 active:scale-90 transition-all focus:outline-none focus:ring-2 focus:ring-[#15B2C6]"
          >
            {isOpen ? <X size={22} className="text-[#15B2C6]" /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-white">
          {/* Top Bar di dalam Drawer */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
            <div className="flex items-center gap-2">
              <Image
                src="/logo-no-background.png"
                alt={`Logo ${brand} AI`}
                width={36}
                height={36}
                style={{ objectFit: "contain" }}
              />
              <span className="text-base font-black tracking-tight text-slate-900">
                {brand} <span className="text-[#15B2C6]">AI</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FFA800] ml-1 mb-2"></span>
              </span>
            </div>

            <button
              type="button"
              onClick={closeMenu}
              aria-label="Tutup menu"
              className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95 transition-all"
            >
              <X size={22} />
            </button>
          </div>

          {/* Isi Navigasi Mobile Drawer */}
          <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Menu Utama
              </div>

              <a
                href="#home"
                onClick={closeMenu}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-[#E6F9FC] hover:text-[#1294A8] active:bg-[#CBE8EC] transition-all"
              >
                <span className="flex items-center gap-3">
                  <Home size={18} className="text-[#15B2C6]" />
                  <span>Home</span>
                </span>
                <ChevronRight size={16} className="text-slate-300" />
              </a>

              <a
                href="#situasi"
                onClick={closeMenu}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-[#E6F9FC] hover:text-[#1294A8] active:bg-[#CBE8EC] transition-all"
              >
                <span className="flex items-center gap-3">
                  <Activity size={18} className="text-[#15B2C6]" />
                  <span>Situasi Terkini</span>
                </span>
                <ChevronRight size={16} className="text-slate-300" />
              </a>

              <a
                href="#posko"
                onClick={closeMenu}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-[#E6F9FC] hover:text-[#1294A8] active:bg-[#CBE8EC] transition-all"
              >
                <span className="flex items-center gap-3">
                  <MapPin size={18} className="text-[#15B2C6]" />
                  <span>Posko Bencana</span>
                </span>
                <ChevronRight size={16} className="text-slate-300" />
              </a>

              <a
                href="#informasi"
                onClick={closeMenu}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-[#E6F9FC] hover:text-[#1294A8] active:bg-[#CBE8EC] transition-all"
              >
                <span className="flex items-center gap-3">
                  <Info size={18} className="text-[#15B2C6]" />
                  <span>Informasi & Bantuan</span>
                </span>
                <ChevronRight size={16} className="text-slate-300" />
              </a>

              <div className="my-3 border-t border-slate-100" />

              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-3">
                Layanan Publik
              </div>

              <Link
                href="/peta"
                onClick={closeMenu}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-[#FFF4D8] hover:text-[#FFA800] active:bg-[#F5DFB0] transition-all"
              >
                <span className="flex items-center gap-3">
                  <Map size={18} className="text-[#FFA800]" />
                  <span>Peta Interaktif Kebutuhan</span>
                </span>
                <ChevronRight size={16} className="text-slate-300" />
              </Link>

              <Link
                href="/posko"
                onClick={closeMenu}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 hover:bg-[#FFF4D8] hover:text-[#FFA800] active:bg-[#F5DFB0] transition-all"
              >
                <span className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-[#FFA800]" />
                  <span>Daftar 84 Posko Nasional</span>
                </span>
                <ChevronRight size={16} className="text-slate-300" />
              </Link>
            </div>

            {/* Aksi Bawah: Lapor Sekarang & Masuk Akun */}
            <div className="flex flex-col gap-3 pt-6 border-t border-slate-100">
              <Link
                href="/mandiri/POSKO01"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[#FFA800] text-slate-900 font-bold text-sm shadow-md hover:bg-[#E69700] active:scale-95 transition-all"
              >
                <AlertCircle size={18} />
                <span>Lapor Sekarang (Darurat)</span>
              </Link>

              <Link
                href="/login"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-sm hover:bg-slate-100 active:scale-95 transition-all"
              >
                <LogIn size={17} className="text-slate-500" />
                <span>Masuk Petugas / Relawan</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
