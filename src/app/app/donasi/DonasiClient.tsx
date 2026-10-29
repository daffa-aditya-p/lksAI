"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import QRCode from "qrcode";
import {
  ChevronLeft,
  Gift,
  Users,
  Check,
  Wallet,
  CreditCard,
  Landmark,
  Copy,
  CheckCircle2,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import {
  KampanyeItem,
  buatTransaksiDonasi,
  konfirmasiPembayaranDonasi,
} from "@/app/actions/donasi";

type FlowStep = "LIST" | "DETAIL" | "NOMINAL" | "PAYMENT" | "INSTRUCTION" | "SUCCESS";

interface DonasiClientProps {
  initialKampanye: KampanyeItem[];
  user?: {
    name?: string | null;
    email?: string | null;
  };
}

export default function DonasiClient({
  initialKampanye,
  user,
}: DonasiClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [kampanyeList, setKampanyeList] = useState<KampanyeItem[]>(initialKampanye);
  const [selectedKampanye, setSelectedKampanye] = useState<KampanyeItem | null>(null);
  const [step, setStep] = useState<FlowStep>("LIST");

  // State Step 3 (Nominal)
  const [selectedNominal, setSelectedNominal] = useState<number>(100000);
  const [customNominalInput, setCustomNominalInput] = useState<string>("");

  // State Step 4 (Payment Method)
  const [metodePembayaran, setMetodePembayaran] = useState<"E_WALLET" | "VIRTUAL_ACCOUNT" | "BANK_TRANSFER">("E_WALLET");
  const [subMetode, setSubMetode] = useState<string>("GOPAY");
  const [isAnonim, setIsAnonim] = useState<boolean>(true);
  const [namaDonatur, setNamaDonatur] = useState<string>(user?.name || "");
  const [pesanDoa, setPesanDoa] = useState<string>("");

  // State Step 5 (Transaction & Instructions)
  const [loading, setLoading] = useState<boolean>(false);
  const [transaksiData, setTransaksiData] = useState<any>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Handle URL query parameter ?id=... on mount
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam && kampanyeList.length > 0) {
      const match = kampanyeList.find((k) => k.id === idParam || k.slug === idParam);
      if (match) {
        setSelectedKampanye(match);
        setStep("DETAIL");
      }
    }
  }, [searchParams, kampanyeList]);

  // Format angka ke format Rupiah standar
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Format angka biasa ke Rupiah tanpa prefix
  const formatAngka = (val: number) => {
    return new Intl.NumberFormat("id-ID").format(val);
  };

  // Navigasi Back
  const handleBack = () => {
    if (step === "SUCCESS") {
      setStep("LIST");
    } else if (step === "INSTRUCTION") {
      setStep("PAYMENT");
    } else if (step === "PAYMENT") {
      setStep("NOMINAL");
    } else if (step === "NOMINAL") {
      setStep("DETAIL");
    } else if (step === "DETAIL") {
      setSelectedKampanye(null);
      setStep("LIST");
    } else {
      router.push("/app");
    }
  };

  // Pilih preset nominal
  const handleSelectPreset = (nominal: number) => {
    setSelectedNominal(nominal);
    setCustomNominalInput("");
  };

  // Ketik nominal custom
  const handleCustomNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanNum = e.target.value.replace(/\D/g, "");
    if (!cleanNum) {
      setCustomNominalInput("");
      return;
    }
    const val = parseInt(cleanNum, 10);
    setCustomNominalInput(val ? formatAngka(val) : "");
    setSelectedNominal(val);
  };

  // Buat Transaksi Donasi
  const handleBayarSekarang = async () => {
    if (!selectedKampanye) return;
    if (selectedNominal < 5000) {
      setErrorMsg("Nominal donasi minimal Rp5.000");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await buatTransaksiDonasi({
        kampanyeId: selectedKampanye.id,
        nominal: selectedNominal,
        metodePembayaran,
        subMetode,
        namaDonatur: isAnonim ? "Hamba Allah" : namaDonatur,
        pesanDoa,
        anonim: isAnonim,
      });

      if (!res.ok || !res.data) {
        setErrorMsg(res.error || "Gagal membuat transaksi donasi");
        setLoading(false);
        return;
      }

      setTransaksiData(res.data);

      // Generate QRIS jika metode e-wallet
      if (res.data.qrPayload) {
        const qrUrl = await QRCode.toDataURL(res.data.qrPayload, {
          width: 280,
          margin: 1,
          color: {
            dark: "#0F172A",
            light: "#FFFFFF",
          },
        });
        setQrCodeDataUrl(qrUrl);
      }

      setStep("INSTRUCTION");
    } catch (err: any) {
      setErrorMsg(err?.message || "Terjadi kendala jaringan");
    } finally {
      setLoading(false);
    }
  };

  // Simulasi Bayar Berhasil
  const handleSimulasiBayar = async () => {
    if (!transaksiData?.id) return;
    setLoading(true);
    try {
      const res = await konfirmasiPembayaranDonasi(transaksiData.id);
      if (res.ok && res.data) {
        setTransaksiData(res.data);
        if (res.kampanye) {
          // Update data di state lokal
          setKampanyeList((prev) =>
            prev.map((k) =>
              k.id === res.kampanye.id
                ? {
                    ...k,
                    terkumpul: res.kampanye.terkumpul,
                    jumlahDonatur: res.kampanye.jumlahDonatur,
                    persentase: Math.min(
                      100,
                      Math.round(
                        (res.kampanye.terkumpul / (res.kampanye.targetDonasi || 1)) * 100
                      )
                    ),
                  }
                : k
            )
          );
          if (selectedKampanye && selectedKampanye.id === res.kampanye.id) {
            setSelectedKampanye({
              ...selectedKampanye,
              terkumpul: res.kampanye.terkumpul,
              jumlahDonatur: res.kampanye.jumlahDonatur,
              persentase: Math.min(
                100,
                Math.round(
                  (res.kampanye.terkumpul / (res.kampanye.targetDonasi || 1)) * 100
                )
              ),
            });
          }
        }
        setStep("SUCCESS");
      } else {
        alert(res.error || "Gagal memproses konfirmasi donasi");
      }
    } catch (err: any) {
      alert("Terjadi kendala jaringan: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyVa = () => {
    if (transaksiData?.nomorVa) {
      navigator.clipboard.writeText(transaksiData.nomorVa);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans text-slate-800">
      {/* WRAPPER KONTEN (Format Mobile/Card Center) */}
      <div className="mx-auto max-w-md bg-white min-h-screen sm:min-h-[92vh] sm:my-4 sm:rounded-[32px] sm:shadow-2xl sm:border sm:border-slate-100 flex flex-col overflow-hidden">
        
        {/* TOP BAR / HEADER */}
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
            {step === "DETAIL" && selectedKampanye
              ? selectedKampanye.judul
              : "Donasi"}
          </h1>
        </header>

        {/* BODY CONTAINER BERDASARKAN STEP */}
        <main className="flex-1 px-5 py-4 flex flex-col">

          {/* ============================================================== */}
          {/* STEP 1: DAFTAR KAMPANYE DONASI (Design Image 1)               */}
          {/* ============================================================== */}
          {step === "LIST" && (
            <div className="flex-1 flex flex-col">
              {/* Judul & Deskripsi Halaman */}
              <div className="mb-5">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Bantu melalui donasi
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Salurkan bantuan untuk mendukung kebutuhan masyarakat yang terdampak bencana
                </p>
              </div>

              {/* List Kartu Kampanye */}
              <div className="space-y-4 flex-1">
                {kampanyeList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-[22px] p-5 shadow-[0_4px_22px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-3.5 transition-all hover:shadow-md"
                  >
                    {/* Header Kartu: Ikon Cyan Box + Judul */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E0F7FA] text-[#00A9B5] flex items-center justify-center shrink-0">
                        <Gift size={20} />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.judul}
                      </h3>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00A9B5] rounded-full transition-all duration-500"
                        style={{ width: `${item.persentase}%` }}
                      />
                    </div>

                    {/* Nominal & Persentase */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-sm font-extrabold text-slate-900">
                          {formatRupiah(item.terkumpul)}
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">
                          dari {formatRupiah(item.targetDonasi)}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#00A9B5]">
                        {item.persentase}%
                      </span>
                    </div>

                    {/* Tags */}
                    {item.kategoriTag && item.kategoriTag.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {item.kategoriTag.map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-full px-2.5 py-0.5 text-[10.5px] font-medium bg-[#F4F4F5] text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Button Donasi Sekarang */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedKampanye(item);
                        setStep("DETAIL");
                      }}
                      className="w-full py-2.5 px-4 rounded-[13px] bg-[#00A9B5] hover:bg-[#00929D] active:scale-[0.98] transition-all text-white font-bold text-xs uppercase tracking-wide cursor-pointer shadow-xs"
                    >
                      Donasi Sekarang
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: DETAIL KAMPANYE DONASI (Design Image 2)                */}
          {/* ============================================================== */}
          {step === "DETAIL" && selectedKampanye && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Header Subtitle */}
                <div className="mb-4">
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Bantu melalui donasi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Salurkan bantuan untuk mendukung kebutuhan masyarakat yang terdampak bencana
                  </p>
                </div>

                {/* Card 1: Progress & Donatur */}
                <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 space-y-3 mb-4">
                  {/* Progress Bar */}
                  <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00A9B5] rounded-full transition-all duration-500"
                      style={{ width: `${selectedKampanye.persentase}%` }}
                    />
                  </div>

                  {/* Nominal & Persentase */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-extrabold text-slate-900">
                        {formatRupiah(selectedKampanye.terkumpul)}
                      </span>
                      <span className="block text-[11px] text-slate-400 mt-0.5">
                        dari {formatRupiah(selectedKampanye.targetDonasi)}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#00A9B5]">
                      {selectedKampanye.persentase}%
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-2 flex items-center gap-2 text-slate-500 text-xs font-medium">
                    <Users size={16} className="text-[#00A9B5]" />
                    <span>{selectedKampanye.jumlahDonatur} Donatur</span>
                  </div>
                </div>

                {/* Card 2: DANA DIGUNAKAN UNTUK */}
                <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 mb-4">
                  <h3 className="text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-3">
                    DANA DIGUNAKAN UNTUK
                  </h3>
                  <div className="space-y-2.5">
                    {selectedKampanye.alokasiDana && selectedKampanye.alokasiDana.length > 0 ? (
                      selectedKampanye.alokasiDana.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#00A9B5] text-white flex items-center justify-center shrink-0">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-semibold text-slate-800">
                            {item}
                          </span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#00A9B5] text-white flex items-center justify-center shrink-0">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-semibold text-slate-800">Makanan</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#00A9B5] text-white flex items-center justify-center shrink-0">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-semibold text-slate-800">Air Bersih</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#00A9B5] text-white flex items-center justify-center shrink-0">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-semibold text-slate-800">Kebutuhan Medis</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-[#00A9B5] text-white flex items-center justify-center shrink-0">
                            <Check size={11} strokeWidth={3} />
                          </div>
                          <span className="text-xs font-semibold text-slate-800">Kebutuhan Pengungsian</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Card 3: PENYELENGGARA */}
                <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 mb-6">
                  <h3 className="text-[11px] font-bold tracking-wider text-slate-700 uppercase mb-2">
                    PENYELENGGARA
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#00A9B5] text-white flex items-center justify-center shrink-0">
                      <Check size={11} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {selectedKampanye.penyelenggara}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    {selectedKampanye.penyelenggaraDesc ||
                      "Organisasi terverifikasi. Laporan penyaluran dana dipublikasikan secara transparan setiap tahap kegiatan"}
                  </p>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="pt-2 pb-1">
                <button
                  type="button"
                  onClick={() => setStep("NOMINAL")}
                  className="w-full py-3.5 px-4 rounded-[14px] bg-[#00A9B5] hover:bg-[#00929D] active:scale-[0.98] transition-all text-white font-bold text-sm tracking-wide cursor-pointer shadow-md"
                >
                  Donasi Sekarang
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 3: PILIH NOMINAL DONASI (Design Image 3 & 4)              */}
          {/* ============================================================== */}
          {step === "NOMINAL" && selectedKampanye && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <span className="text-xs font-bold text-[#00A9B5] uppercase tracking-wider">
                    Langkah 1 dari 2
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight mt-0.5">
                    Pilih Nominal Donasi
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Untuk {selectedKampanye.judul}
                  </p>
                </div>

                {/* 2x2 Grid Nominal Preset */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[25000, 50000, 100000, 200000].map((amt) => {
                    const isSelected = selectedNominal === amt && !customNominalInput;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handleSelectPreset(amt)}
                        className={`h-14 rounded-[16px] flex items-center justify-center text-sm font-bold transition-all border cursor-pointer ${
                          isSelected
                            ? "bg-[#E0F7FA] border-[#00A9B5] text-[#00A9B5] ring-2 ring-[#00A9B5]/20 shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        {formatRupiah(amt)}
                      </button>
                    );
                  })}
                </div>

                {/* Nominal Lainnya */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Nominal Lainnya
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customNominalInput}
                      onChange={handleCustomNominalChange}
                      placeholder="Masukkan Nominal"
                      className="w-full pl-11 pr-4 py-3 rounded-[16px] border border-slate-200 bg-white text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-[#00A9B5] focus:outline-none focus:ring-2 focus:ring-[#00A9B5]/20 transition-all"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Minimal donasi sebesar Rp5.000
                  </p>
                </div>

                {/* Detail Pengisi Doa & Nama */}
                <div className="bg-slate-50 rounded-[18px] p-4 border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Donasi sebagai Anonim
                    </label>
                    <input
                      type="checkbox"
                      checked={isAnonim}
                      onChange={(e) => setIsAnonim(e.target.checked)}
                      className="w-4 h-4 text-[#00A9B5] rounded border-slate-300 focus:ring-[#00A9B5] cursor-pointer"
                    />
                  </div>
                  {!isAnonim && (
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Nama Donatur
                      </label>
                      <input
                        type="text"
                        value={namaDonatur}
                        onChange={(e) => setNamaDonatur(e.target.value)}
                        placeholder="Nama Lengkap Anda"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A9B5]"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Pesan / Doa (Opsional)
                    </label>
                    <input
                      type="text"
                      value={pesanDoa}
                      onChange={(e) => setPesanDoa(e.target.value)}
                      placeholder="Semoga lekas pulih..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00A9B5]"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom CTA */}
              <div className="pt-4 pb-1">
                <button
                  type="button"
                  onClick={() => setStep("PAYMENT")}
                  disabled={selectedNominal < 5000}
                  className="w-full py-3.5 px-4 rounded-[14px] bg-[#00A9B5] hover:bg-[#00929D] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white font-bold text-sm tracking-wide cursor-pointer shadow-md"
                >
                  Lanjut Pembayaran
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 4: METODE PEMBAYARAN (Design Image 5)                    */}
          {/* ============================================================== */}
          {step === "PAYMENT" && selectedKampanye && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                {/* Summary Card */}
                <div className="bg-white rounded-[20px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 mb-5">
                  <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Kampanye</span>
                    <span className="font-bold text-slate-900 max-w-[200px] truncate text-right">
                      {selectedKampanye.judul}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-xs text-slate-500 font-medium">Nominal</span>
                    <span className="text-base font-extrabold text-[#00A9B5]">
                      {formatRupiah(selectedNominal)}
                    </span>
                  </div>
                </div>

                {/* Section Title */}
                <h3 className="text-xs font-bold text-slate-800 mb-3">
                  Metode Pembayaran
                </h3>

                {/* Pilihan Metode Pembayaran */}
                <div className="space-y-3">
                  {/* Option 1: E-wallet */}
                  <div
                    onClick={() => {
                      setMetodePembayaran("E_WALLET");
                      setSubMetode("GOPAY");
                    }}
                    className={`rounded-[18px] p-3.5 border transition-all cursor-pointer flex items-center justify-between ${
                      metodePembayaran === "E_WALLET"
                        ? "bg-[#E0F7FA] border-[#00A9B5] shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#00A9B5] shadow-2xs">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-900">
                          E-wallet
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          GoPay, OVO, DANA
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        metodePembayaran === "E_WALLET"
                          ? "border-[#00A9B5] bg-[#00A9B5]"
                          : "border-slate-300"
                      }`}
                    >
                      {metodePembayaran === "E_WALLET" && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  {/* Option 2: Virtual Account */}
                  <div
                    onClick={() => {
                      setMetodePembayaran("VIRTUAL_ACCOUNT");
                      setSubMetode("BCA");
                    }}
                    className={`rounded-[18px] p-3.5 border transition-all cursor-pointer flex items-center justify-between ${
                      metodePembayaran === "VIRTUAL_ACCOUNT"
                        ? "bg-[#E0F7FA] border-[#00A9B5] shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#00A9B5] shadow-2xs">
                        <CreditCard size={20} />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-900">
                          Virtual Account
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          BCA, Mandiri, BRI
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        metodePembayaran === "VIRTUAL_ACCOUNT"
                          ? "border-[#00A9B5] bg-[#00A9B5]"
                          : "border-slate-300"
                      }`}
                    >
                      {metodePembayaran === "VIRTUAL_ACCOUNT" && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>

                  {/* Option 3: Bank Transfer */}
                  <div
                    onClick={() => {
                      setMetodePembayaran("BANK_TRANSFER");
                      setSubMetode("MANUAL");
                    }}
                    className={`rounded-[18px] p-3.5 border transition-all cursor-pointer flex items-center justify-between ${
                      metodePembayaran === "BANK_TRANSFER"
                        ? "bg-[#E0F7FA] border-[#00A9B5] shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-[#00A9B5] shadow-2xs">
                        <Landmark size={20} />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-900">
                          Bank Transfer
                        </span>
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          Transfer Manual
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        metodePembayaran === "BANK_TRANSFER"
                          ? "border-[#00A9B5] bg-[#00A9B5]"
                          : "border-slate-300"
                      }`}
                    >
                      {metodePembayaran === "BANK_TRANSFER" && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-500 font-medium mt-3 bg-red-50 p-2.5 rounded-xl border border-red-200">
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* Bottom CTA */}
              <div className="pt-4 pb-1">
                <button
                  type="button"
                  onClick={handleBayarSekarang}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-[14px] bg-[#00A9B5] hover:bg-[#00929D] active:scale-[0.98] disabled:opacity-60 transition-all text-white font-bold text-sm tracking-wide cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Memproses...</span>
                  ) : (
                    <>
                      <span>Bayar Sekarang</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 5: PETUNJUK PEMBAYARAN / SIMULASI                         */}
          {/* ============================================================== */}
          {step === "INSTRUCTION" && transaksiData && (
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="text-center mb-4">
                  <span className="inline-block px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold rounded-full mb-2">
                    Menunggu Pembayaran
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Instruksi Pembayaran
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Selesaikan donasi sebelum 24 jam ke depan
                  </p>
                </div>

                {/* Kartu Ringkasan Pembayaran */}
                <div className="bg-white rounded-[20px] p-4 border border-slate-200 shadow-xs space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">ID Donasi</span>
                    <span className="font-bold font-mono text-slate-800">
                      {transaksiData.kodeDonasi}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Jumlah Donasi</span>
                    <span className="font-extrabold text-base text-[#00A9B5]">
                      {formatRupiah(transaksiData.nominal)}
                    </span>
                  </div>
                </div>

                {/* QRIS / E-WALLET */}
                {transaksiData.metodePembayaran === "E_WALLET" && qrCodeDataUrl && (
                  <div className="bg-white rounded-[22px] p-5 border border-slate-200 shadow-sm text-center flex flex-col items-center">
                    <span className="text-xs font-bold text-slate-700 mb-2">
                      Scan QRIS via GoPay / OVO / DANA
                    </span>
                    <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs inline-block">
                      <Image
                        src={qrCodeDataUrl}
                        alt="QRIS Donasi"
                        width={220}
                        height={220}
                        className="rounded-lg"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">
                      QR Code valid dan dapat dipindai langsung dari aplikasi e-wallet.
                    </p>
                  </div>
                )}

                {/* VIRTUAL ACCOUNT / BANK TRANSFER */}
                {transaksiData.metodePembayaran !== "E_WALLET" && (
                  <div className="bg-white rounded-[22px] p-5 border border-slate-200 shadow-sm space-y-3">
                    <span className="block text-xs font-bold text-slate-700">
                      {transaksiData.metodePembayaran === "VIRTUAL_ACCOUNT"
                        ? "Nomor Virtual Account"
                        : "Nomor Rekening Tujuan"}
                    </span>
                    <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-mono text-base font-extrabold text-slate-900 tracking-wider">
                        {transaksiData.nomorVa}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyVa}
                        className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check size={14} className="text-emerald-600" />
                            <span className="text-emerald-600">Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Lakukan transfer sesuai nominal di atas ke nomor rekening/VA resmi SATU AI.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Simulasi Bayar Instan */}
              <div className="pt-4 pb-1 space-y-2">
                <button
                  type="button"
                  onClick={handleSimulasiBayar}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-[14px] bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all text-white font-bold text-sm tracking-wide cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Memvalidasi Pembayaran...</span>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Simulasikan Pembayaran Berhasil</span>
                    </>
                  )}
                </button>
                <p className="text-[10.5px] text-center text-slate-400">
                  Klik tombol di atas untuk memvalidasi pembayaran dan mengalirkan dana ke database secara real-time.
                </p>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 6: NOTIFIKASI BERHASIL (SUCCESS STATE)                    */}
          {/* ============================================================== */}
          {step === "SUCCESS" && transaksiData && (
            <div className="flex-1 flex flex-col justify-between py-4 text-center">
              <div className="flex flex-col items-center">
                {/* Check Icon Animation */}
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
                  <CheckCircle2 size={36} />
                </div>

                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Donasi Berhasil!
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
                  Terima kasih banyak atas kepedulian Anda. Bantuan Anda sangat berarti bagi para korban bencana.
                </p>

                {/* Struk Ringkas */}
                <div className="w-full bg-slate-50 rounded-[22px] p-4 border border-slate-200 mt-6 text-left space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Kode Donasi</span>
                    <span className="font-mono font-bold text-slate-900">
                      {transaksiData.kodeDonasi}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Penyalur</span>
                    <span className="font-medium text-slate-800">
                      {selectedKampanye?.penyelenggara || "Yayasan Bantu Sesama"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Kampanye</span>
                    <span className="font-bold text-slate-900 text-right max-w-[180px] truncate">
                      {selectedKampanye?.judul}
                    </span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-600">Total Terbayar</span>
                    <span className="text-base font-extrabold text-emerald-600">
                      {formatRupiah(transaksiData.nominal)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-500">
                  <ShieldCheck size={16} className="text-[#00A9B5]" />
                  <span>Tercatat aman & transparan di database SATU AI</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => router.push("/app")}
                  className="w-full py-3.5 px-4 rounded-[14px] bg-[#00A9B5] hover:bg-[#00929D] active:scale-[0.98] transition-all text-white font-bold text-sm tracking-wide cursor-pointer shadow-md"
                >
                  Kembali ke Beranda
                </button>
                <button
                  type="button"
                  onClick={() => setStep("LIST")}
                  className="w-full py-3 px-4 rounded-[14px] bg-white border border-slate-200 hover:bg-slate-50 active:scale-[0.98] transition-all text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Lihat Kampanye Lainnya
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
