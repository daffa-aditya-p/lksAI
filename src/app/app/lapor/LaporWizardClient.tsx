"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import QRCode from "qrcode";
import {
  ChevronLeft,
  ChevronDown,
  Check,
  Camera,
  MapPin,
  Search,
  Mic,
  MicOff,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { submitLaporanDarurat } from "@/app/actions/lapor";
import type { LevelPrioritas } from "@/lib/types";

// Dynamic import Leaflet map picker
const LocationPickerMap = dynamic(
  () => import("@/components/peta/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
        Memuat Peta...
      </div>
    ),
  }
);

interface LaporWizardClientProps {
  user: {
    name?: string | null;
    username: string;
    email?: string | null;
  };
}

export default function LaporWizardClient({ user }: LaporWizardClientProps) {
  // Stepper State (1 sampai 6)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resultData, setResultData] = useState<{
    kasusId: string;
    kodeUnik: string;
    qrPayload: string;
    level?: LevelPrioritas;
    skor?: number;
  } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Pastikan QR Code selalu digenerate secara riil saat data hasil ada
  useEffect(() => {
    if (resultData?.qrPayload || resultData?.kodeUnik) {
      QRCode.toDataURL(resultData.qrPayload || resultData.kodeUnik, {
        width: 240,
        margin: 1,
        color: {
          dark: "#0B1C26",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error generating QR:", err));
    }
  }, [resultData]);

  // Form Data State
  const [nama, setNama] = useState(user.name || user.username || "");
  const [email, setEmail] = useState(user.email || "");
  const [telepon, setTelepon] = useState("081225677865");
  const [kejadian, setKejadian] = useState("Air mulai naik memasuki rumah warga di RT 03.");
  const [kategori, setKategori] = useState("Banjir");
  const [kategoriMenuOpen, setKategoriMenuOpen] = useState(false);

  const [kebutuhan, setKebutuhan] = useState<string[]>(["Makanan", "Air bersih"]);
  const [lokasiAlamat, setLokasiAlamat] = useState("Jl. Kayu Putih No. 12, Jakarta Timur");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.2242,
    lng: 106.8662,
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [catatan, setCatatan] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Assistant State
  const [isListening, setIsListening] = useState(false);
  const [aiDetectedInfo, setAiDetectedInfo] = useState<{
    kategori: string;
    level: LevelPrioritas;
    rekomendasiKebutuhan: string[];
  } | null>({
    kategori: "Banjir",
    level: "MERAH",
    rekomendasiKebutuhan: ["Makanan", "Air bersih"],
  });
  const recogRef = useRef<any>(null);

  // AI Speech Recognition (Web Speech API)
  const handleToggleVoice = () => {
    const SR =
      (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) {
      alert("Browser Anda belum mendukung input suara Web Speech. Silakan ketik langsung di kotak teks.");
      return;
    }

    if (isListening) {
      recogRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recog = new SR();
    recog.lang = "id-ID";
    recog.interimResults = false;
    recog.continuous = false;

    recog.onresult = (e: any) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) {
        t += e.results[i][0].transcript;
      }
      const updatedText = kejadian ? `${kejadian} ${t}` : t;
      setKejadian(updatedText);
      runAiSmartDetection(updatedText);
    };

    recog.onerror = (e: any) => {
      setIsListening(false);
      console.warn("Speech recognition error:", e);
    };

    recog.onend = () => {
      setIsListening(false);
    };

    recogRef.current = recog;
    try {
      recog.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  // AI Heuristic & Context Extractor
  const runAiSmartDetection = (text: string) => {
    const lower = text.toLowerCase();
    let detectedKat = kategori;
    let detectedNeeds: string[] = [...kebutuhan];
    let detectedLevel: LevelPrioritas = "KUNING";

    if (lower.includes("banjir") || lower.includes("air naik") || lower.includes("terendam") || lower.includes("tanggul") || lower.includes("hujan")) {
      detectedKat = "Banjir";
      detectedNeeds = Array.from(new Set([...detectedNeeds, "Makanan", "Air bersih", "Tempat Tinggal"]));
      if (lower.includes("sedada") || lower.includes("lansia") || lower.includes("terjebak") || lower.includes("perahu")) {
        detectedLevel = "MERAH";
      }
    } else if (lower.includes("kebakaran") || lower.includes("api") || lower.includes("asap") || lower.includes("terbakar")) {
      detectedKat = "Kebakaran";
      detectedNeeds = Array.from(new Set([...detectedNeeds, "Tempat Tinggal", "Obat-obatan", "Air bersih"]));
      detectedLevel = "MERAH";
    } else if (lower.includes("medis") || lower.includes("stroke") || lower.includes("pingsan") || lower.includes("darah") || lower.includes("luka") || lower.includes("sesak") || lower.includes("obat")) {
      detectedKat = "Darurat Medis";
      detectedNeeds = Array.from(new Set([...detectedNeeds, "Obat-obatan"]));
      detectedLevel = "MERAH";
    } else if (lower.includes("gempa") || lower.includes("runtuh") || lower.includes("tertimbun") || lower.includes("roboh")) {
      detectedKat = "Gempa Bumi";
      detectedNeeds = Array.from(new Set([...detectedNeeds, "Obat-obatan", "Tempat Tinggal", "Makanan"]));
      detectedLevel = "MERAH";
    } else if (lower.includes("longsor") || lower.includes("tanah")) {
      detectedKat = "Tanah Longsor";
      detectedNeeds = Array.from(new Set([...detectedNeeds, "Tempat Tinggal", "Makanan"]));
      detectedLevel = "KUNING";
    }

    setKategori(detectedKat);
    setKebutuhan(detectedNeeds);
    setAiDetectedInfo({
      kategori: detectedKat,
      level: detectedLevel,
      rekomendasiKebutuhan: detectedNeeds,
    });
  };

  // Kebutuhan toggler
  const toggleNeed = (item: string) => {
    setKebutuhan((prev) =>
      prev.includes(item) ? prev.filter((n) => n !== item) : [...prev, item]
    );
  };

  // Handle Photo File
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Recenter ke lokasi GPS user
  const handleUseMyLocation = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setLokasiAlamat(`Koordinat GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          alert("Gagal membaca GPS. Pastikan izin lokasi aktif.");
        }
      );
    }
  };

  // Submit Handler
  const handleSubmitReport = async () => {
    try {
      setSubmitting(true);
      const res = await submitLaporanDarurat({
        nama,
        email,
        telepon,
        kejadian,
        kategori,
        kebutuhan,
        lokasiAlamat,
        lat: coords.lat,
        lng: coords.lng,
        catatan,
        fotoUrl: photoPreview || undefined,
        levelPrioritas: aiDetectedInfo?.level || "MERAH",
        skorKerentanan: aiDetectedInfo?.level === "MERAH" ? 85 : 55,
        agentThought: `[AI SATU Asesmen] Kategori: ${kategori} | Kejadian: ${kejadian} | Prioritas: ${aiDetectedInfo?.level || "MERAH"}`,
      });

      if (res.success) {
        // Generate real scannable QR Code data URL
        try {
          const generatedUrl = await QRCode.toDataURL(res.qrPayload || res.kodeUnik, {
            width: 240,
            margin: 1,
            color: {
              dark: "#0B1C26",
              light: "#FFFFFF",
            },
          });
          setQrDataUrl(generatedUrl);
        } catch (qrErr) {
          console.error("Gagal generate QR Code Data URL:", qrErr);
        }

        setResultData({
          kasusId: res.kasusId,
          kodeUnik: res.kodeUnik,
          qrPayload: res.qrPayload,
          level: res.level,
          skor: res.skor,
        });
        setCurrentStep(6);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengirim laporan. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  // Stepper Visual Helper (Persis konfigurasi awal)
  const stepperConfigs: Record<number, { nums: number[]; states: string[]; bars: { width: string; color: string }[] }> = {
    1: {
      nums: [1, 2, 3, 4],
      states: ["amber", "gray", "gray", "gray"],
      bars: [
        { width: "52%", color: "#FFA800" },
        { width: "0%", color: "transparent" },
        { width: "0%", color: "transparent" },
      ],
    },
    2: {
      nums: [1, 2, 3, 4],
      states: ["teal", "amber", "gray", "gray"],
      bars: [
        { width: "100%", color: "#15B2C6" },
        { width: "52%", color: "#FFA800" },
        { width: "0%", color: "transparent" },
      ],
    },
    3: {
      nums: [1, 2, 3, 4],
      states: ["teal", "teal", "amber", "gray"],
      bars: [
        { width: "100%", color: "#15B2C6" },
        { width: "100%", color: "#15B2C6" },
        { width: "52%", color: "#FFA800" },
      ],
    },
    4: {
      nums: [2, 3, 4, 5],
      states: ["teal", "teal", "amber", "gray"],
      bars: [
        { width: "100%", color: "#15B2C6" },
        { width: "100%", color: "#15B2C6" },
        { width: "52%", color: "#FFA800" },
      ],
    },
    5: {
      nums: [2, 3, 4, 5],
      states: ["teal", "teal", "teal", "teal"],
      bars: [
        { width: "100%", color: "#15B2C6" },
        { width: "100%", color: "#15B2C6" },
        { width: "100%", color: "#15B2C6" },
      ],
    },
  };

  const currentCfg = stepperConfigs[currentStep] || stepperConfigs[1];

  return (
    <div
      suppressHydrationWarning
      className="w-full max-w-[480px] lg:max-w-xl mx-auto bg-white min-h-screen flex flex-col justify-between px-6 pt-7 pb-8 relative"
    >
      {/* ============================================================== */}
      {/* BAGIAN ATAS (Header, Stepper & Form Steps 1 s/d 5)             */}
      {/* ============================================================== */}
      {currentStep <= 5 && (
        <div className="flex-1 flex flex-col">
          {/* 1. Header */}
          <header className="flex items-center gap-3.5 mb-7">
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1) setCurrentStep((p) => p - 1);
                else window.history.back();
              }}
              aria-label="Kembali"
              className="w-10 h-10 rounded-full bg-[#ECEFF1] hover:bg-[#E2E6E9] flex items-center justify-center text-[#1E232C] active:scale-95 transition-all focus:outline-none"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-[20px] font-bold text-[#0F1E26] tracking-tight">
              Laporkan Kondisi
            </h1>
          </header>

          {/* 2. Stepper Indicator */}
          <div className="flex items-center justify-between mb-8" aria-label="Tahapan Pelaporan">
            {currentCfg.nums.map((num, i) => (
              <React.Fragment key={i}>
                <button
                  type="button"
                  onClick={() => {
                    if (num < currentStep) setCurrentStep(num);
                  }}
                  className={`w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] font-medium flex-shrink-0 transition-colors duration-200 ${
                    currentCfg.states[i] === "amber"
                      ? "bg-[#FFA800] text-slate-900 font-bold"
                      : currentCfg.states[i] === "teal"
                      ? "bg-[#15B2C6] text-white"
                      : "bg-[#F2F4F7] text-slate-400"
                  }`}
                >
                  {num}
                </button>

                {i < 3 && (
                  <div className="flex-1 h-[4px] mx-2.5 rounded-full bg-[#F2F4F7] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: currentCfg.bars[i].width,
                        backgroundColor: currentCfg.bars[i].color,
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ==================== STEP 1: DATA PELAPOR ==================== */}
          {currentStep === 1 && (
            <section className="flex-1 flex flex-col animate-fadeIn">
              <h2 className="text-[24px] font-bold text-[#0F172A] tracking-tight mb-2.5">
                Data Pelapor
              </h2>
              <p className="text-[14px] font-normal text-[#828282] leading-[1.55] mb-7">
                Informasi ini digunakan agar kami dapat menghubungi kamu jika diperlukan.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-[14px] font-semibold text-[#1A1A1A] mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="w-full h-[52px] rounded-[16px] border border-[#D5D8DE] px-4 text-[15px] text-slate-800 focus:outline-none focus:border-[#15B2C6] transition"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-[#1A1A1A] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan alamat email"
                    className="w-full h-[52px] rounded-[16px] border border-[#D5D8DE] px-4 text-[15px] text-slate-800 focus:outline-none focus:border-[#15B2C6] transition"
                  />
                </div>

                <div>
                  <label className="block text-[14px] font-semibold text-[#1A1A1A] mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={telepon}
                    onChange={(e) => setTelepon(e.target.value)}
                    placeholder="Masukkan nomor telepon"
                    className="w-full h-[52px] rounded-[16px] border border-[#D5D8DE] px-4 text-[15px] text-slate-800 focus:outline-none focus:border-[#15B2C6] transition"
                  />
                </div>
              </div>
            </section>
          )}

          {/* ==================== STEP 2: DETAIL LAPORAN ==================== */}
          {currentStep === 2 && (
            <section className="flex-1 flex flex-col animate-fadeIn">
              <h2 className="text-[24px] font-bold text-[#0F172A] tracking-tight mb-6">
                Detail Laporan
              </h2>

              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[14px] font-semibold text-[#1A1A1A]">
                    Apa yang terjadi?
                  </label>
                  {/* AI Voice Input Pill */}
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium bg-[#DCF1F4] text-[#1294A8] hover:bg-[#cbe8ec] active:scale-95 transition"
                  >
                    {isListening ? (
                      <>
                        <MicOff size={13} className="text-rose-500 animate-bounce" />
                        <span className="text-rose-600 font-bold">Merekam...</span>
                      </>
                    ) : (
                      <>
                        <Mic size={13} className="text-[#1294A8]" />
                        <span>Input Suara AI</span>
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={kejadian}
                  onChange={(e) => {
                    setKejadian(e.target.value);
                    runAiSmartDetection(e.target.value);
                  }}
                  placeholder="Jelaskan apa yang terjadi..."
                  className="w-full h-[126px] rounded-[14px] border border-[#C6C6C8] p-4 text-[14.5px] text-[#1A1A1A] placeholder-[#8E8E93] resize-none focus:outline-none focus:border-[#15B2C6] transition"
                />

                <div className="mt-1.5 flex items-center justify-between text-[11.5px] text-[#1294A8]">
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-[#1294A8]" />
                    AI SATU: Kategori & Kebutuhan terdeteksi otomatis
                  </span>
                  <span className="text-slate-400">Tanggap Cepat 72 Jam</span>
                </div>
              </div>

              {/* Kategori Dropdown */}
              <div className="mb-6 relative">
                <label className="block text-[14px] font-semibold text-[#1A1A1A] mb-2">
                  Kategori
                </label>
                <button
                  type="button"
                  onClick={() => setKategoriMenuOpen((p) => !p)}
                  className="w-full h-[50px] rounded-[14px] border border-[#C6C6C8] bg-white px-4 flex items-center justify-between text-left focus:outline-none focus:border-[#15B2C6]"
                >
                  <span className="text-[14.5px] text-[#1A1A1A] font-medium">
                    {kategori}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-500 transition-transform ${
                      kategoriMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {kategoriMenuOpen && (
                  <div className="absolute left-0 right-0 mt-1.5 bg-white rounded-[14px] shadow-lg border border-gray-200 py-1.5 z-30">
                    {["Banjir", "Kebakaran", "Tanah Longsor", "Darurat Medis", "Gempa Bumi"].map(
                      (kat) => (
                        <button
                          key={kat}
                          type="button"
                          onClick={() => {
                            setKategori(kat);
                            setKategoriMenuOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-[14px] text-[#1A1A1A] hover:bg-slate-50"
                        >
                          {kat}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* Kebutuhan Checkbox List */}
              <div>
                <span className="block text-[14px] font-semibold text-[#1A1A1A] mb-3.5">
                  Kebutuhan
                </span>
                <div className="space-y-3.5">
                  {["Makanan", "Air bersih", "Obat-obatan", "Tempat Tinggal", "Lainnya"].map(
                    (item) => {
                      const isChecked = kebutuhan.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleNeed(item)}
                          className="flex items-center gap-3.5 w-full text-left focus:outline-none active:scale-98 transition-transform"
                        >
                          <span
                            className={`w-[22px] h-[22px] rounded-[6px] flex items-center justify-center transition-colors ${
                              isChecked
                                ? "bg-[#005AE0] text-white"
                                : "bg-[#CBD5E0] text-transparent"
                            }`}
                          >
                            <Check size={14} strokeWidth={3} />
                          </span>
                          <span
                            className={`text-[14.5px] ${
                              isChecked
                                ? "font-semibold text-slate-900"
                                : "font-normal text-slate-500"
                            }`}
                          >
                            {item === "Air bersih" ? "Air Bersih" : item}
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ==================== STEP 3: LOKASI KEJADIAN ==================== */}
          {currentStep === 3 && (
            <section className="flex-1 flex flex-col animate-fadeIn">
              <h2 className="text-[24px] font-bold text-[#0F172A] tracking-tight mb-5">
                Lokasi Kejadian
              </h2>

              <div className="w-full rounded-[16px] bg-[#DCF1F4] border border-[#84C5CE] px-5 py-4 mb-3.5">
                <span className="block text-[11.5px] font-bold uppercase tracking-wide text-[#1294A8]">
                  LOKASI SAAT INI
                </span>
                <p className="text-[14.5px] font-medium text-[#1A1A1A] mt-1">
                  {lokasiAlamat}
                </p>
              </div>

              <button
                type="button"
                onClick={handleUseMyLocation}
                className="w-full h-[50px] rounded-[14px] bg-[#15B2C6] hover:bg-[#1294A8] text-white text-[14.5px] font-medium flex items-center justify-center gap-2 mb-5 active:scale-95 transition-all"
              >
                <MapPin size={18} />
                <span>Gunakan lokasi saya</span>
              </button>

              <p className="text-center text-[12.5px] font-normal text-[#7A7A7A] mb-3.5">
                Pilih lokasi manual
              </p>

              <div className="w-full h-[50px] rounded-[16px] bg-[#F7F7F7] border border-[#8E8E93] px-4 flex items-center gap-3 mb-4 focus-within:bg-white focus-within:border-[#15B2C6] transition">
                <Search size={18} className="text-slate-500" />
                <input
                  type="text"
                  value={lokasiAlamat}
                  onChange={(e) => setLokasiAlamat(e.target.value)}
                  placeholder="Cari lokasi atau jenis bantuan"
                  className="w-full bg-transparent text-[13px] text-[#1A1A1A] focus:outline-none"
                />
              </div>

              {/* Peta Interaktif Leaflet */}
              <div className="w-full h-[220px] rounded-[18px] overflow-hidden border border-slate-200 bg-slate-100 relative">
                <LocationPickerMap
                  lat={coords.lat}
                  lng={coords.lng}
                  onChange={(lat, lng) => {
                    setCoords({ lat, lng });
                    setLokasiAlamat(`Titik Pin Peta: (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                  }}
                />
              </div>
            </section>
          )}

          {/* ==================== STEP 4: INFORMASI TAMBAHAN ==================== */}
          {currentStep === 4 && (
            <section className="flex-1 flex flex-col animate-fadeIn">
              <h2 className="text-[24px] font-bold text-[#0F172A] tracking-tight mb-1.5">
                Informasi Tambahan
              </h2>
              <p className="text-[13.5px] font-normal text-[#828282] mb-6">
                Tambahkan foto bukti dan catatan jika diperlukan
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-[150px] rounded-[16px] bg-[#F2F2F2] border-[1.5px] border-dashed border-[#C6C6C8] flex flex-col items-center justify-center gap-2.5 mb-4 overflow-hidden relative focus:outline-none hover:bg-slate-100 transition"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview Laporan"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Camera size={36} className="text-slate-400" />
                    <span className="text-[13.5px] font-normal text-slate-500">
                      Belum ada foto ditambahkan
                    </span>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-[46px] rounded-[14px] bg-white border border-[#C6C6C8] hover:border-[#8E8E93] flex items-center justify-center gap-2.5 mb-6 active:scale-95 transition-all"
              >
                <Camera size={18} className="text-slate-700" />
                <span className="text-[13.5px] font-semibold text-slate-800">
                  {photoPreview ? "Ganti Foto" : "Tambah Foto"}
                </span>
              </button>

              <div className="mb-6">
                <label className="block text-[14px] font-semibold text-[#1A1A1A] mb-2">
                  Catatan
                </label>
                <textarea
                  rows={4}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Informasi tambahan khusus pengungsi, balita, atau lansia..."
                  className="w-full h-[130px] rounded-[16px] bg-[#F2F2F2] border border-[#C6C6C8] p-4 text-[14px] text-[#1A1A1A] resize-none focus:outline-none focus:bg-white focus:border-[#15B2C6] transition"
                />
              </div>

              <p className="text-center text-[13px] font-normal text-[#828282]">
                Langkah ini bersifat opsional
              </p>
            </section>
          )}

          {/* ==================== STEP 5: KONFIRMASI LAPORAN ==================== */}
          {currentStep === 5 && (
            <section className="flex-1 flex flex-col animate-fadeIn">
              <h2 className="text-[24px] font-bold text-[#0F172A] tracking-tight mb-1.5">
                Konfirmasi Laporan
              </h2>
              <p className="text-[13.5px] font-normal text-[#828282] mb-6">
                Pastikan data yang kamu berikan sudah benar sebelum dikirimkan
              </p>

              <div className="w-full bg-white rounded-[22px] p-5 shadow-sm border border-slate-200">
                <span className="block text-[13px] font-semibold uppercase tracking-wide text-slate-400 mb-3.5">
                  RINGKASAN LAPORAN
                </span>

                <div className="divide-y divide-slate-100">
                  <div className="py-3 flex items-start justify-between gap-4">
                    <span className="text-[12.5px] text-slate-500">Apa yang terjadi</span>
                    <span className="text-[12.5px] font-semibold text-slate-800 text-right max-w-[215px]">
                      {kejadian}
                    </span>
                  </div>

                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <span className="text-[12.5px] text-slate-500">Kategori</span>
                    <span className="text-[12.5px] font-semibold text-slate-800">
                      {kategori}
                    </span>
                  </div>

                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <span className="text-[12.5px] text-slate-500">Kebutuhan</span>
                    <span className="text-[12.5px] font-semibold text-[#15B2C6] text-right">
                      {kebutuhan.join(", ") || "-"}
                    </span>
                  </div>

                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <span className="text-[12.5px] text-slate-500">Lokasi</span>
                    <span className="text-[12.5px] font-semibold text-slate-800 text-right max-w-[215px]">
                      {lokasiAlamat}
                    </span>
                  </div>

                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <span className="text-[12.5px] text-slate-500">Nama Pelapor</span>
                    <span className="text-[12.5px] font-semibold text-slate-800">
                      {nama}
                    </span>
                  </div>

                  <div className="py-3.5 flex items-center justify-between gap-4">
                    <span className="text-[12.5px] text-slate-500">Nomor Telepon</span>
                    <span className="text-[12.5px] font-semibold text-slate-800">
                      {telepon}
                    </span>
                  </div>

                  <div className="pt-3.5 pb-1 flex items-center justify-between gap-4">
                    <span className="text-[12.5px] text-[#1294A8] font-medium flex items-center gap-1">
                      <Sparkles size={13} />
                      Analisis Triase AI
                    </span>
                    <span className="text-[12px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      Tanggap Cepat 72 Jam (Level {aiDetectedInfo?.level || "MERAH"})
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Tombol Utama Bawah (Lanjut / Kirim Laporan) */}
          <div className="pt-6 mt-auto">
            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                if (currentStep < 5) setCurrentStep((p) => p + 1);
                else handleSubmitReport();
              }}
              className="w-full h-[56px] rounded-[18px] bg-[#FFA800] hover:bg-[#E69700] text-slate-900 font-bold text-[16px] flex items-center justify-center transition active:scale-98"
            >
              {submitting
                ? "Mengirim..."
                : currentStep === 5
                ? "Kirim Laporan"
                : "Lanjut"}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 6: HASIL LAPORAN (TIKET & QR VALIDASI RELAWAN ASLI)       */}
      {/* ============================================================== */}
      {currentStep === 6 && resultData && (
        <section className="flex flex-1 flex-col justify-between pt-4 animate-fadeIn">
          <div className="flex flex-col items-center text-center">
            {/* Judul & Subjudul Laporan Terkirim */}
            <h1 className="text-[24px] font-bold text-[#111111] tracking-tight mb-2.5">
              Laporan Terkirim
            </h1>
            <p className="text-[13.5px] font-normal text-[#828282] leading-[1.6] max-w-[330px] mb-6">
              Terima kasih atas informasi yang kamu berikan. Laporan kamu sudah diterima dan segera ditinjau oleh relawan di posko.
            </p>

            {/* Kartu ID Laporan */}
            <div className="w-full bg-white rounded-[18px] px-5 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 flex items-center justify-between mb-5">
              <span className="text-[13px] font-normal text-[#757575]">
                ID Laporan
              </span>
              <span className="text-[15px] font-bold text-[#0F1E26] tracking-tight">
                {resultData.kodeUnik}
              </span>
            </div>

            {/* KARTU QR CODE VALIDASI RELAWAN ASLI & SCANNABLE */}
            <div className="w-full bg-white rounded-[22px] p-5 shadow-[0_8px_28px_rgba(11,28,38,0.06)] border border-[#E6F4F6] flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F8FA] text-[#00A8B8] text-[11px] font-semibold tracking-wide uppercase mb-3">
                <ShieldCheck size={14} />
                <span>QR VALIDASI RELAWAN</span>
              </div>

              {/* Bingkai 4 Sudut Aksen Cyan */}
              <div className="relative p-3 bg-white rounded-[18px] border-2 border-[#0B1C26]/10 shadow-xs mb-3 flex items-center justify-center">
                <span className="absolute -top-1 -left-1 w-4 h-4 border-t-[3px] border-l-[3px] border-[#00A8B8] rounded-tl-md"></span>
                <span className="absolute -top-1 -right-1 w-4 h-4 border-t-[3px] border-r-[3px] border-[#00A8B8] rounded-tr-md"></span>
                <span className="absolute -bottom-1 -left-1 w-4 h-4 border-b-[3px] border-l-[3px] border-[#00A8B8] rounded-bl-md"></span>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 border-b-[3px] border-r-[3px] border-[#00A8B8] rounded-br-md"></span>

                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code Laporan ${resultData.kodeUnik}`}
                    className="w-[160px] h-[160px] object-contain rounded-md"
                  />
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      resultData.qrPayload || resultData.kodeUnik
                    )}`}
                    alt={`QR Code Laporan ${resultData.kodeUnik}`}
                    className="w-[160px] h-[160px] object-contain rounded-md"
                  />
                )}
              </div>

              <p className="text-[12px] font-bold text-[#1A1A1A]">
                Tunjukkan QR Code ini kepada Relawan
              </p>
              <p className="text-[11px] font-normal text-[#828282] mt-0.5 max-w-[260px] text-center">
                Relawan akan memindai kode ini saat tiba di lokasi untuk memvalidasi laporan dan memberikan bantuan.
              </p>
            </div>
          </div>

          {/* 2 Tombol Bawah Persis Screenshot User */}
          <div className="space-y-3 pt-6 mt-auto w-full">
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="w-full h-[54px] rounded-[18px] bg-[#0B1C26] hover:bg-[#142e3d] text-white text-[15px] font-semibold tracking-tight flex items-center justify-center focus:outline-none active:scale-98 transition shadow-sm"
            >
              Lihat Ringkasan Laporan
            </button>

            <Link
              href="/app"
              className="w-full h-[54px] rounded-[18px] bg-white hover:bg-gray-50 border border-[#555555] text-[#0F1E26] text-[15px] font-semibold tracking-tight flex items-center justify-center focus:outline-none active:scale-98 transition"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
