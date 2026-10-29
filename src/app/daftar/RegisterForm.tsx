"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/components/Toast";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const { show } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState<"email" | "password" | "confirm" | null>(null);

  const isMismatch = confirmPassword.length > 0 && password.length > 0 && password !== confirmPassword;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password || !confirmPassword) {
      setErrorMessage("ERROR: Semua kolom wajib diisi!");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("ERROR: Password Don't Match!");
      show("Kata sandi dan konfirmasi tidak cocok!", "error");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("ERROR: Kata sandi minimal 6 karakter!");
      show("Kata sandi minimal 6 karakter", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        setErrorMessage(`ERROR: ${data.error || "Gagal membuat akun"}`);
        show(data.error || "Gagal membuat akun", "error");
        return;
      }

      show("Akun berhasil didaftarkan! Mengalihkan...", "success");

      const loginRes = await signIn("credentials", {
        username: email.trim(),
        password,
        redirect: false,
      });

      if (loginRes?.ok) {
        router.push("/app");
      } else {
        router.push("/login");
      }
    } catch {
      setErrorMessage("ERROR: Terjadi gangguan jaringan. Coba lagi.");
      show("Gagal menghubungi server", "error");
    } finally {
      setLoading(false);
    }
  }

  const hasMismatchError = errorMessage === "ERROR: Password Don't Match!" || (confirmPassword.length >= 3 && isMismatch);

  return (
    <div className="w-full">
      {/* Top Header: Tombol Kembali (Back Button) untuk Tampilan Mobile / Android */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/login"
          onClick={(e) => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              e.preventDefault();
              router.back();
            }
          }}
          className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-200/90 hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-all active:scale-95 cursor-pointer"
          aria-label="Kembali"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </Link>
        <span className="text-[12px] font-semibold text-slate-400">
          Daftar Akun SATU AI
        </span>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col">
        {/* Email Address Label */}
        <label className="text-sm font-bold text-slate-900 mb-2 tracking-tight">
          Email Address
        </label>

        {/* Email Input */}
        <div
          className={`w-full rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all ${
            inputFocused === "email"
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
            autoComplete="email"
            required
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
          />
        </div>

        {/* Password Label */}
        <label className="text-sm font-bold text-slate-900 mb-2 mt-5 tracking-tight">
          Password
        </label>

        {/* Password Input */}
        <div
          className={`w-full rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all ${
            inputFocused === "password"
              ? "bg-white border-2 border-[#FED7AA] ring-2 ring-orange-100/80 shadow-xs"
              : "bg-[#F1F3F5] border border-slate-200/80"
          }`}
        >
          <Lock className="w-5 h-5 text-slate-900 shrink-0 stroke-[2]" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            onFocus={() => setInputFocused("password")}
            onBlur={() => setInputFocused(null)}
            placeholder="Masukan Password anda"
            autoComplete="new-password"
            required
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0 transition-colors cursor-pointer"
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5 text-slate-400" />
            ) : (
              <Eye className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Confirm Password Label */}
        <label className="text-sm font-bold text-slate-900 mb-2 mt-5 tracking-tight">
          Confirm Password
        </label>

        {/* Confirm Password Input */}
        <div
          className={`w-full rounded-2xl px-4 py-3.5 flex items-center gap-3 transition-all ${
            hasMismatchError
              ? "bg-[#FDF2F2] border-2 border-red-400 ring-2 ring-red-100"
              : inputFocused === "confirm"
              ? "bg-white border-2 border-[#FED7AA] ring-2 ring-orange-100/80 shadow-xs"
              : "bg-[#F1F3F5] border border-slate-200/80"
          }`}
        >
          <Lock className="w-5 h-5 text-slate-900 shrink-0 stroke-[2]" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (password && e.target.value && password !== e.target.value) {
                setErrorMessage("ERROR: Password Don't Match!");
              } else {
                setErrorMessage(null);
              }
            }}
            onFocus={() => setInputFocused("confirm")}
            onBlur={() => {
              setInputFocused(null);
              if (confirmPassword && password !== confirmPassword) {
                setErrorMessage("ERROR: Password Don't Match!");
              }
            }}
            placeholder="Masukan ulang Password anda"
            autoComplete="new-password"
            required
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none font-medium"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="text-slate-400 hover:text-slate-600 p-0.5 shrink-0 transition-colors cursor-pointer"
            aria-label={showConfirmPassword ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5 text-slate-400" />
            ) : (
              <Eye className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Error Banner: Identik dengan Screenshot 2 */}
        {errorMessage && (
          <div className="mt-3 w-full rounded-2xl bg-[#FEE8E8] border border-red-400 px-4 py-3 flex items-center gap-2.5 text-xs sm:text-[13px] font-bold text-slate-800 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="w-5 h-5 rounded-full bg-[#E53E3E] text-white flex items-center justify-center shrink-0 text-xs font-black">
              !
            </div>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Sign Up Button (#FFAE00) */}
        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full py-3.5 sm:py-4 rounded-full bg-[#FFAE00] hover:bg-[#F2A200] active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 text-sm font-bold text-slate-950 cursor-pointer disabled:opacity-70"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-circle-notch fa-spin text-sm" />
              Mendaftarkan Akun...
            </span>
          ) : (
            <>
              <span>Sign Up</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </>
          )}
        </button>
      </form>

      {/* Footer Link: Already have an account? Sign In. */}
      <div className="mt-8 text-center">
        <p className="text-xs text-slate-600 font-medium">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#00AFBF] font-semibold hover:underline"
          >
            Sign In.
          </Link>
        </p>
      </div>
    </div>
  );
}
