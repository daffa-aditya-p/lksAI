"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Users,
  Check,
  ChevronDown,
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  KegiatanRelawanItem,
  PendaftaranItem,
  daftarRelawanBaru,
} from "@/app/actions/volunteer";

type VolunteerStep = "HERO_LIST" | "DETAIL" | "FORM" | "SUCCESS_ACTIVITY";

interface RelawanJoinClientProps {
  initialKegiatan: KegiatanRelawanItem[];
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export default function RelawanJoinClient({
  initialKegiatan,
  user,
}: RelawanJoinClientProps) {
  const router = useRouter();

  const [step, setStep] = useState<VolunteerStep>("HERO_LIST");
  const [kegiatanList] = useState<KegiatanRelawanItem[]>(initialKegiatan);
  const [selectedKegiatan, setSelectedKegiatan] = useState<KegiatanRelawanItem>(
    initialKegiatan[0] || {
      id: "banjir-jakarta-timur",
      slug: "banjir-jakarta-timur",
      judul: "Banjir Jakarta Timur",
      tanggalRentang: "8-12 Oktober 2026",
      lokasi: "Jakarta Timur",
      alamatSpesifik: "Jl. Melati No.5, Jakarta Timur",
      kuotaTerisi: 24,
      kuotaMaksimal: 50,
      persentase: 48,
      posisiDibutuhkan: ["Distribusi", "Logistik", "Dapur Umum"],
      deskripsi:
        "Kegiatan relawan untuk membantu distribusi bantuan pengelolaan logistik dan penyediaan konsumsi melalui dapur umum bagi korban banjir di wilayah Jakarta Timur selama 5 hari.",
      informasiTugas:
        "Membantu distribusi paket bantuan kepada pengungsi di posko RW 05",
      waktuKegiatan: "06.00 - 18.00 WIB",
      kontakKordinator: "08123425871667",
      aktif: true,
    }
  );

  // Form State
  const [namaLengkap, setNamaLengkap] = useState<string>(user?.name || "El");
  const [email, setEmail] = useState<string>(user?.email || "el@gmail.com");
  const [nomorTelepon, setNomorTelepon] = useState<string>("08975132518162");
  const [kemampuan, setKemampuan] = useState<string>("Mis. medis, logistik, komunikasi");
  const [pengalaman, setPengalaman] = useState<string>("");
  const [posisi, setPosisi] = useState<string>("Distribusi");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showTaskDetailModal, setShowTaskDetailModal] = useState<boolean>(false);

  // Registered result
  const [pendaftaranResult, setPendaftaranResult] = useState<PendaftaranItem | null>(null);

  // Header Title
  const getHeaderTitle = () => {
    switch (step) {
      case "HERO_LIST":
        return "Jadi Relawan";
      case "DETAIL":
        return "Open Volunteer";
      case "FORM":
        return "Daftar sebagai Relawan";
      case "SUCCESS_ACTIVITY":
        return "Aktivitas Relawan";
    }
  };

  // Back Navigation
  const handleBack = () => {
    if (step === "SUCCESS_ACTIVITY") {
      setStep("HERO_LIST");
    } else if (step === "FORM") {
      setStep("DETAIL");
    } else if (step === "DETAIL") {
      setStep("HERO_LIST");
    } else {
      router.push("/app");
    }
  };

  // Submit Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim() || !email.trim() || !nomorTelepon.trim()) {
      setErrorMsg("Mohon lengkapi Nama, Email, dan Nomor Telepon");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await daftarRelawanBaru({
        kegiatanId: selectedKegiatan.id,
        namaLengkap,
        email,
        nomorTelepon,
        kemampuan,
        pengalaman,
        posisi,
      });

      if (!res.ok || !res.data) {
        setErrorMsg(res.error || "Gagal mendaftar relawan");
        setLoading(false);
        return;
      }

      setPendaftaranResult(res.data);
      setStep("SUCCESS_ACTIVITY");
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kendala jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans text-slate-800">
      {/* WRAPPER KONTEN (Format Mobile Centered) */}
      <div className="mx-auto max-w-md bg-white min-h-screen sm:min-h-[92vh] sm:my-4 sm:rounded-[32px] sm:shadow-2xl sm:border sm:border-slate-100 flex flex-col overflow-hidden">

        {/* HEADER BAR */}
        <header className="sticky top-0 z-20 flex items-center gap-3 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-slate-100">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Kembali"
            className="w-10 h-10 rounded-full bg-[#ECEFF1] hover:bg-[#E2E6E9] active:scale-95 transition-all flex items-center justify-center text-slate-700 cursor-pointer shrink-0"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-base font-bold text-slate-900 truncate">
            {getHeaderTitle()}
          </h1>
        </header>

        {/* BODY CONTENT BERDASARKAN STEP */}
        <main className="flex-1 px-5 py-4 flex flex-col">

          {/* ============================================================== */}
          {/* STEP 1: HERO & OPEN VOLUNTEER LIST (Gambar 1)                  */}
          {/* ============================================================== */}
          {step === "HERO_LIST" && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Heading & Subtitle */}
                <div className="mb-4">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    Ayoo.. ikut bantu mereka
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Daftar sebagai relawan dan ikut membantu saat terjadi bencana di wilayah yang membutuhkan
                  </p>
                </div>

                {/* Hero Illustration / Volunteer Visual */}
                <div className="relative w-full rounded-[24px] overflow-hidden flex items-center justify-center py-2 mb-4 bg-gradient-to-b from-[#FFF9EE] to-white">
                  <div className="relative w-full max-w-[280px] h-[210px]">
                    <Image
                      src="/volunteer-hero.png"
                      alt="Relawan SATU AI"
                      fill
                      priority
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Button DAFTAR SEKARANG */}
                <button
                  type="button"
                  onClick={() => setStep("DETAIL")}
                  className="w-full py-3.5 px-4 rounded-[16px] bg-[#00A9B5] hover:bg-[#00929D] active:scale-[0.98] transition-all text-white font-bold text-sm tracking-wide cursor-pointer shadow-md mb-6"
                >
                  Daftar Sekarang
                </button>

                {/* SECTION: OPEN VOLUNTEER */}
                <div>
                  <h3 className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-3">
                    OPEN VOLUNTEER
                  </h3>

                  {/* Kartu Kegiatan Volunteer */}
                  {kegiatanList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedKegiatan(item);
                        setStep("DETAIL");
                      }}
                      className="bg-white rounded-[20px] p-4 shadow-[0_4px_22px_rgba(0,0,0,0.05)] border border-slate-100 space-y-3 cursor-pointer hover:border-[#00A9B5]/40 transition-all active:scale-[0.99] mb-3"
                    >
                      <h4 className="text-sm font-bold text-slate-900">
                        {item.judul}
                      </h4>

                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-md bg-[#E0F7FA] text-[#00A9B5] flex items-center justify-center shrink-0">
                            <Calendar size={13} />
                          </div>
                          <span>{item.tanggalRentang}</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-md bg-[#E0F7FA] text-[#00A9B5] flex items-center justify-center shrink-0">
                            <MapPin size={13} />
                          </div>
                          <span>{item.lokasi}</span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-md bg-[#E0F7FA] text-[#00A9B5] flex items-center justify-center shrink-0">
                            <Users size={13} />
                          </div>
                          <span>
                            {item.kuotaTerisi}/{item.kuotaMaksimal} relawan
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-[#00A9B5] rounded-full transition-all duration-500"
                          style={{ width: `${item.persentase}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: OPEN VOLUNTEER DETAIL (Gambar 2)                       */}
          {/* ============================================================== */}
          {step === "DETAIL" && selectedKegiatan && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Card 1: Summary Kegiatan */}
                <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedKegiatan.judul}
                  </h3>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-[#E0F7FA] text-[#00A9B5] flex items-center justify-center shrink-0">
                        <Calendar size={13} />
                      </div>
                      <span>{selectedKegiatan.tanggalRentang}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-[#E0F7FA] text-[#00A9B5] flex items-center justify-center shrink-0">
                        <MapPin size={13} />
                      </div>
                      <span>{selectedKegiatan.lokasi}</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-[#E0F7FA] text-[#00A9B5] flex items-center justify-center shrink-0">
                        <Users size={13} />
                      </div>
                      <span>
                        {selectedKegiatan.kuotaTerisi}/{selectedKegiatan.kuotaMaksimal} relawan
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00A9B5] rounded-full transition-all duration-500"
                      style={{ width: `${selectedKegiatan.persentase}%` }}
                    />
                  </div>
                </div>

                {/* Card 2: POSISI YANG DIBUTUHKAN */}
                <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                  <h4 className="text-[11px] font-bold tracking-wider text-slate-600 uppercase mb-3">
                    POSISI YANG DIBUTUHKAN
                  </h4>
                  <div className="space-y-2.5">
                    {selectedKegiatan.posisiDibutuhkan.map((pos, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-[#00A9B5] text-white flex items-center justify-center shrink-0">
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span className="text-xs font-semibold text-slate-800">
                          {pos}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 3: DESKRIPSI KEGIATAN */}
                <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100">
                  <h4 className="text-[11px] font-bold tracking-wider text-slate-600 uppercase mb-2">
                    DESKRIPSI KEGIATAN
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedKegiatan.deskripsi}
                  </p>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="pt-4 pb-1">
                <button
                  type="button"
                  onClick={() => setStep("FORM")}
                  className="w-full py-3.5 px-4 rounded-[14px] bg-[#00A9B5] hover:bg-[#00929D] active:scale-[0.98] transition-all text-white font-bold text-sm tracking-wide cursor-pointer shadow-md"
                >
                  Daftar sebagai Relawan
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: FORMULIR PENDAFTARAN RELAWAN (Gambar 3)                */}
          {/* ============================================================== */}
          {step === "FORM" && (
            <form onSubmit={handleSubmitForm} className="flex-1 flex flex-col justify-between">
              <div className="space-y-3.5">
                {/* Field 1: Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full px-4 py-3 rounded-[14px] border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#00A9B5] focus:ring-2 focus:ring-[#00A9B5]/20"
                  />
                </div>

                {/* Field 2: Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan alamat email"
                    className="w-full px-4 py-3 rounded-[14px] border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#00A9B5] focus:ring-2 focus:ring-[#00A9B5]/20"
                  />
                </div>

                {/* Field 3: Nomor Telepon */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    required
                    value={nomorTelepon}
                    onChange={(e) => setNomorTelepon(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-4 py-3 rounded-[14px] border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#00A9B5] focus:ring-2 focus:ring-[#00A9B5]/20"
                  />
                </div>

                {/* Field 4: Kemampuan/Keahlian */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kemampuan/Keahlian
                  </label>
                  <input
                    type="text"
                    value={kemampuan}
                    onChange={(e) => setKemampuan(e.target.value)}
                    placeholder="Mis. medis, logistik, komunikasi"
                    className="w-full px-4 py-3 rounded-[14px] border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#00A9B5] focus:ring-2 focus:ring-[#00A9B5]/20"
                  />
                </div>

                {/* Field 5: Pengalaman relawan */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pengalaman relawan
                  </label>
                  <textarea
                    rows={3}
                    value={pengalaman}
                    onChange={(e) => setPengalaman(e.target.value)}
                    placeholder="Ceritakan pengalaman relawan kamu"
                    className="w-full px-4 py-3 rounded-[14px] border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:border-[#00A9B5] focus:ring-2 focus:ring-[#00A9B5]/20 resize-none"
                  />
                </div>

                {/* Field 6: Posisi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Posisi
                  </label>
                  <div className="relative">
                    <select
                      value={posisi}
                      onChange={(e) => setPosisi(e.target.value)}
                      className="w-full px-4 py-3 rounded-[14px] border border-slate-200 bg-white text-xs font-medium text-slate-900 appearance-none focus:outline-none focus:border-[#00A9B5] focus:ring-2 focus:ring-[#00A9B5]/20 cursor-pointer pr-10"
                    >
                      {selectedKegiatan.posisiDibutuhkan.map((pos, idx) => (
                        <option key={idx} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-500 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-5 pb-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-[14px] bg-[#00A9B5] hover:bg-[#00929D] active:scale-[0.98] disabled:opacity-60 transition-all text-white font-bold text-sm tracking-wide cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Mendaftarkan...</span>
                  ) : (
                    <span>Lanjut</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* STEP 4: AKTIVITAS RELAWAN (Gambar 4)                           */}
          {/* ============================================================== */}
          {step === "SUCCESS_ACTIVITY" && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Card 1: Header Status "Terdaftar" */}
                <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#E0F7FA] text-[#00A9B5] flex items-center justify-center shrink-0">
                    <Users size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {pendaftaranResult?.kegiatanJudul || selectedKegiatan.judul}
                    </h3>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md bg-[#E0F7FA] text-[#00A9B5] text-[10.5px] font-bold">
                      {pendaftaranResult?.status || "Terdaftar"}
                    </span>
                  </div>
                </div>

                {/* Card 2: Tanggal, Lokasi, Posisi, Waktu Kegiatan */}
                <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 divide-y divide-slate-100 text-xs">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400 font-medium">Tanggal</span>
                    <span className="font-bold text-slate-800">
                      {pendaftaranResult?.tanggalRentang || "8-10 Oktober 2026"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400 font-medium">Lokasi</span>
                    <span className="font-bold text-slate-800">
                      {pendaftaranResult?.lokasi || "Jakarta Timur"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400 font-medium">Posisi</span>
                    <span className="font-bold text-slate-800">
                      {pendaftaranResult?.posisi || posisi}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400 font-medium">Waktu Kegiatan</span>
                    <span className="font-bold text-slate-800">
                      {pendaftaranResult?.waktuKegiatan || "06.00 - 18.00 WIB"}
                    </span>
                  </div>
                </div>

                {/* Card 3: Informasi Tugas, Lokasi & Kontak Koordinator */}
                <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 space-y-3">
                  <div>
                    <h4 className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                      INFORMASI TUGAS
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {pendaftaranResult?.informasiTugas ||
                        "Membantu distribusi paket bantuan kepada pengungsi di posko RW 05"}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <h4 className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                      LOKASI
                    </h4>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                      <MapPin size={15} className="text-[#00A9B5] shrink-0" />
                      <span>
                        {pendaftaranResult?.alamatSpesifik ||
                          "Jl. Melati No.5, Jakarta Timur"}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <h4 className="text-[10.5px] font-bold tracking-wider text-slate-400 uppercase mb-1">
                      KONTAK KORDINATOR
                    </h4>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-800">
                      <Phone size={15} className="text-[#00A9B5] shrink-0" />
                      <a
                        href={`tel:${pendaftaranResult?.kontakKordinator || "08123425871667"}`}
                        className="hover:underline text-slate-900 font-bold"
                      >
                        {pendaftaranResult?.kontakKordinator || "08123425871667"}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Button: Dark Navy Button */}
              <div className="pt-4 pb-1 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowTaskDetailModal(true)}
                  className="w-full py-3.5 px-4 rounded-[14px] bg-[#0D1F2D] hover:bg-[#132A3D] active:scale-[0.98] transition-all text-white font-bold text-sm tracking-wide cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  Lihat Detail Tugas
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/app")}
                  className="w-full py-2.5 text-center text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Kembali ke Beranda
                </button>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* POPUP MODAL: DETAIL TUGAS RELAWAN */}
      {showTaskDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-[28px] sm:rounded-[28px] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Detail Prosedur Operasional Tugas
              </h3>
              <button
                type="button"
                onClick={() => setShowTaskDetailModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  1
                </div>
                <div>
                  <strong className="text-slate-800">Check-in Posko:</strong> Datang pukul 06.00 WIB di Jl. Melati No.5 untuk briefing pagi bersama koordinator lapangan PMI.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  2
                </div>
                <div>
                  <strong className="text-slate-800">Pengemasan Logistik:</strong> Verifikasi kuantitas paket sembako, selimut, dan air mineral sesuai data pengungsi triase.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  3
                </div>
                <div>
                  <strong className="text-slate-800">Distribusi Lapangan:</strong> Penyaluran langsung ke posko penampungan RW 05 dengan validasi QR Code korban.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-[11px]">
                  4
                </div>
                <div>
                  <strong className="text-slate-800">Pelaporan Sore:</strong> Debriefing pukul 17.30 WIB dan pencatatan sisa logistik di sistem SATU AI.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowTaskDetailModal(false)}
                className="w-full py-3 rounded-xl bg-[#00A9B5] text-white font-bold text-xs"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
