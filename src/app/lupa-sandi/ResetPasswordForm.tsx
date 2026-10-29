"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";

export default function ResetPasswordForm() {
  const router = useRouter();
  const { show } = useToast();

  // Steps: 1 = Request OTP, 2 = Verify OTP & Enter New Password
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 2: OTP & New Password state
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState<string | null>(null);

  // Timer cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Request OTP via SMTP
  async function handleRequestOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("ERROR: Masukan alamat email yang valid!");
      show("Masukkan alamat email yang valid", "error");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMessage(`ERROR: ${data.error || "Gagal mengirimkan kode OTP"}`);
        show(data.error || "Gagal mengirimkan OTP", "error");
        return;
      }

      setMaskedEmail(data.maskedEmail || email);
      setShowOtpModal(true);
      setResendCooldown(data.cooldownSeconds || 60);
      show("Kode OTP berhasil dikirim ke email Anda", "success");
    } catch {
      setErrorMessage("ERROR: Gagal menghubungi server. Periksa koneksi.");
      show("Terjadi kesalahan jaringan", "error");
    } finally {
      setLoading(false);
    }
  }

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (errorMessage) setErrorMessage(null);
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    const lastChar = cleaned.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = lastChar;
    setOtpDigits(newDigits);

    if (index < 5 && lastChar) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    const nextIdx = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIdx]?.focus();
  };

  // Submit Reset Password
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const fullOtp = otpDigits.join("");
    if (fullOtp.length !== 6) {
      setErrorMessage("ERROR: Masukan 6 digit kode OTP secara lengkap!");
      show("Kode OTP belum lengkap", "error");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("ERROR: Kata sandi baru minimal 6 karakter!");
      show("Kata sandi minimal 6 karakter", "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage("ERROR: Password Don't Match!");
      show("Konfirmasi kata sandi tidak cocok", "error");
      return;
    }

    setLoading(true);

    try {
      let token = resetToken;
      if (!token) {
        const verifyRes = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), otp: fullOtp }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok || !verifyData.ok) {
          setErrorMessage(`ERROR: ${verifyData.error || "Kode OTP salah atau kadaluarsa"}`);
          show(verifyData.error || "Kode OTP tidak valid", "error");
          setLoading(false);
          return;
        }
        token = verifyData.resetToken;
        setResetToken(token);
      }

      const resetRes = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          resetToken: token,
          newPassword,
        }),
      });

      const resetData = await resetRes.json();
      if (!resetRes.ok || !resetData.ok) {
        setErrorMessage(`ERROR: ${resetData.error || "Gagal mengubah kata sandi"}`);
        show(resetData.error || "Gagal mereset kata sandi", "error");
        return;
      }

      show("Kata sandi berhasil diatur ulang! Silakan masuk kembali.", "success");
      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch {
      setErrorMessage("ERROR: Terjadi kesalahan jaringan. Coba lagi.");
      show("Gagal menghubungi server", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      {/* STEP 1: PILIH METODE & INPUT EMAIL (Screenshot 3) */}
      {step === 1 && (
        <div>
          {/* Header & Back Button Tunggal Sesuai Desain Figma */}
          <div className="mb-6">
            <Link
              href="/login"
              className="w-10 h-10 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-800 transition-colors mb-5 cursor-pointer"
              aria-label="Kembali ke Login"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight">
              Atur Ulang Kata Sandi
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Pilih metode yang ingin Anda gunakan untuk melakukan reset.
            </p>
          </div>

          <form onSubmit={handleRequestOtp} className="space-y-5">
            {/* Opsi Card: Send via Email */}
            <div className="w-full rounded-2xl bg-[#F1F3F5] border border-slate-200/80 p-4 flex items-center gap-3.5 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#00AFBF] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Mail className="w-6 h-6 stroke-[2]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900">Send via Email</h3>
                <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2">
                  Atur ulang kata sandi Anda dengan mudah melalui alamat email.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
            </div>

            {/* Email Address Input */}
            <div>
              <label className="text-sm font-bold text-slate-900 mb-2 block tracking-tight">
                Email Address
              </label>
              <div
                className={`w-full rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all ${
                  errorMessage
                    ? "bg-[#FDF2F2] border-2 border-red-400 ring-2 ring-red-100"
                    : inputFocused === "email"
                    ? "bg-white border-2 border-[#FED7AA] ring-2 ring-orange-100/80 shadow-xs"
                    : "bg-[#F1F3F5] border border-slate-200/80"
                }`}
              >
                <Mail className="w-5 h-5 text-slate-900 shrink-0 stroke-[2]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onFocus={() => setInputFocused("email")}
                  onBlur={() => setInputFocused(null)}
                  placeholder="Masukan Email anda"
                  required
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                />
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="w-full rounded-2xl bg-[#FEE8E8] border border-red-400 px-4 py-3 flex items-center gap-2.5 text-xs sm:text-[13px] font-bold text-slate-800 shadow-xs animate-in fade-in duration-200">
                <div className="w-5 h-5 rounded-full bg-[#E53E3E] text-white flex items-center justify-center shrink-0 text-xs font-black">
                  !
                </div>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Button: Reset Password (#FFAE00) */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3.5 sm:py-4 rounded-full bg-[#FFAE00] hover:bg-[#F2A200] active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 text-sm font-bold text-slate-950 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-notch fa-spin text-sm" />
                  Mengirimkan OTP...
                </span>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: MASUKKAN KODE OTP & KATA SANDI BARU */}
      {step === 2 && (
        <div>
          {/* Header */}
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-10 h-10 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-800 transition-colors mb-4 cursor-pointer"
              aria-label="Kembali ke langkah sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 tracking-tight leading-tight">
              Verifikasi Kode OTP
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Masukkan 6 digit kode yang dikirim ke{" "}
              <span className="font-bold text-slate-800">{maskedEmail}</span>.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-5">
            {/* 6 Digit OTP Inputs */}
            <div>
              <label className="text-sm font-bold text-slate-900 mb-2 block tracking-tight">
                Kode OTP (6 Digit)
              </label>
              <div className="flex items-center justify-between gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className="w-11 h-12 sm:w-12 sm:h-13 text-center text-lg sm:text-xl font-black rounded-xl sm:rounded-2xl border-2 border-slate-200 focus:border-[#00AFBF] focus:ring-2 focus:ring-[#00AFBF]/20 bg-[#F1F3F5] focus:bg-white text-slate-900 outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Kata Sandi Baru */}
            <div>
              <label className="text-sm font-bold text-slate-900 mb-2 block tracking-tight">
                Kata Sandi Baru
              </label>
              <div
                className={`w-full rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all ${
                  inputFocused === "newPassword"
                    ? "bg-white border-2 border-[#FED7AA] ring-2 ring-orange-100/80 shadow-xs"
                    : "bg-[#F1F3F5] border border-slate-200/80"
                }`}
              >
                <Lock className="w-5 h-5 text-slate-900 shrink-0 stroke-[2]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onFocus={() => setInputFocused("newPassword")}
                  onBlur={() => setInputFocused(null)}
                  placeholder="Masukan Password baru"
                  required
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Konfirmasi Kata Sandi Baru */}
            <div>
              <label className="text-sm font-bold text-slate-900 mb-2 block tracking-tight">
                Konfirmasi Kata Sandi Baru
              </label>
              <div
                className={`w-full rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all ${
                  confirmNewPassword && newPassword !== confirmNewPassword
                    ? "bg-[#FDF2F2] border-2 border-red-400 ring-2 ring-red-100"
                    : inputFocused === "confirmPassword"
                    ? "bg-white border-2 border-[#FED7AA] ring-2 ring-orange-100/80 shadow-xs"
                    : "bg-[#F1F3F5] border border-slate-200/80"
                }`}
              >
                <Lock className="w-5 h-5 text-slate-900 shrink-0 stroke-[2]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => {
                    setConfirmNewPassword(e.target.value);
                    if (newPassword && e.target.value && newPassword !== e.target.value) {
                      setErrorMessage("ERROR: Password Don't Match!");
                    } else {
                      setErrorMessage(null);
                    }
                  }}
                  onFocus={() => setInputFocused("confirmPassword")}
                  onBlur={() => setInputFocused(null)}
                  placeholder="Masukan ulang Password baru"
                  required
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="w-full rounded-2xl bg-[#FEE8E8] border border-red-400 px-4 py-3 flex items-center gap-2.5 text-xs sm:text-[13px] font-bold text-slate-800 shadow-xs animate-in fade-in duration-200">
                <div className="w-5 h-5 rounded-full bg-[#E53E3E] text-white flex items-center justify-center shrink-0 text-xs font-black">
                  !
                </div>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Simpan Kata Sandi Button (#FFAE00) */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3.5 sm:py-4 rounded-full bg-[#FFAE00] hover:bg-[#F2A200] active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 text-sm font-bold text-slate-950 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-notch fa-spin text-sm" />
                  Menyimpan Kata Sandi...
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                  <span>Simpan Kata Sandi Baru</span>
                </>
              )}
            </button>

            {/* Resend OTP button */}
            <div className="text-center pt-2">
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={() => handleRequestOtp()}
                className="text-xs font-bold text-[#00AFBF] hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
              >
                {resendCooldown > 0
                  ? `Kirim ulang OTP (${resendCooldown}s)`
                  : "Kirim Ulang Kode OTP"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL POPUP: KODE OTP TERKIRIM! (Screenshot 4) */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="flex flex-col items-center">
            {/* Modal Card */}
            <div className="w-full max-w-[340px] sm:max-w-[360px] rounded-3xl bg-white p-7 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Teal #00AFBF Checkmark Icon Box */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#00AFBF] flex items-center justify-center mx-auto shadow-md shadow-[#00AFBF]/25">
                <Check className="w-7 h-7 sm:w-8 sm:h-8 text-white stroke-[3]" />
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-5 tracking-tight">
                Kode OTP Terkirim!
              </h2>

              {/* Description with Masked Email */}
              <p className="mt-3 text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                Kami telah mengirimkan kode OTP ke{" "}
                <span className="font-semibold text-slate-800">{maskedEmail}</span>.
                Kirim ulang jika kata sandi tidak diterima!
              </p>

              {/* Action Button: Re-Send Password (#FFAE00) */}
              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={() => handleRequestOtp()}
                className="mt-6 w-full py-3.5 rounded-full bg-[#FFAE00] hover:bg-[#F2A200] active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 text-sm font-bold text-slate-950 cursor-pointer disabled:opacity-60"
              >
                <span>
                  {resendCooldown > 0
                    ? `Kirim Ulang (${resendCooldown}s)`
                    : "Re-Send Password"}
                </span>
                <Lock className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Proceed to Enter OTP */}
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setStep(2);
                }}
                className="mt-3 w-full py-2.5 text-xs font-bold text-[#00AFBF] hover:underline cursor-pointer"
              >
                Masukkan Kode OTP Sekarang &rarr;
              </button>
            </div>

            {/* Floating Close Button X at Bottom */}
            <button
              type="button"
              onClick={() => {
                setShowOtpModal(false);
                setStep(2);
              }}
              className="mt-5 w-11 h-11 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-700 hover:text-slate-900 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-slate-100"
              aria-label="Tutup dan lanjutkan verifikasi"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
