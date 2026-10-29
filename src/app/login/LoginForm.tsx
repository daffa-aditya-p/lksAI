"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useToast } from "@/components/Toast";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ChevronLeft } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { show } = useToast();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState<"email" | "password" | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);

    const loginUser = emailOrUsername.trim();
    const loginPass = password;

    if (!loginUser || !loginPass) {
      setErrorMessage("ERROR: Masukan Email dan Password!");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        username: loginUser,
        password: loginPass,
        redirect: false,
      });

      if (res?.error) {
        setErrorMessage("ERROR: Invalid Email or Password!");
        show("Email / Username atau password salah", "error");
        return;
      }

      show("Berhasil masuk. Mengarahkan...", "success");
      const callback = params.get("callbackUrl") || "/";
      window.location.assign(callback);
    } catch {
      setErrorMessage("ERROR: Terjadi kesalahan saat masuk. Coba lagi.");
      show("Gagal masuk. Coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleQuickLogin = (user: string, pass: string) => {
    setEmailOrUsername(user);
    setPassword(pass);
    setErrorMessage(null);
    show(`Kredensial demo ${user.toUpperCase()} terisi`, "info");
  };

  return (
    <div className="w-full">
      {/* Top Header: Tombol Kembali (Back Button) untuk Tampilan Mobile / Android */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
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
          Masuk ke SATU AI
        </span>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col">
        {/* Email Address Label */}
        <label className="text-sm font-bold text-slate-900 mb-2 tracking-tight">
          Email Address
        </label>

        {/* Email / Username Input */}
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
            type="text"
            value={emailOrUsername}
            onChange={(e) => {
              setEmailOrUsername(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            onFocus={() => setInputFocused("email")}
            onBlur={() => setInputFocused(null)}
            placeholder="Masukan Email anda"
            autoComplete="username"
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
            errorMessage
              ? "bg-[#FDF2F2] border-2 border-red-400 ring-2 ring-red-100"
              : inputFocused === "password"
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
            autoComplete="current-password"
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

        {/* Error Banner (Identik dengan Screenshot 2) */}
        {errorMessage && (
          <div className="mt-3 w-full rounded-2xl bg-[#FEE8E8] border border-red-400 px-4 py-3 flex items-center gap-2.5 text-xs sm:text-[13px] font-bold text-slate-800 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="w-5 h-5 rounded-full bg-[#E53E3E] text-white flex items-center justify-center shrink-0 text-xs font-black">
              !
            </div>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Sign In Button (#FFAE00) */}
        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full py-3.5 sm:py-4 rounded-full bg-[#FFAE00] hover:bg-[#F2A200] active:scale-[0.98] transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 text-sm font-bold text-slate-950 cursor-pointer disabled:opacity-70"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <i className="fa-solid fa-circle-notch fa-spin text-sm" />
              Memproses...
            </span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </>
          )}
        </button>
      </form>

      {/* Social Icons Row (Instagram, Facebook, LinkedIn) */}
      <div className="mt-8 flex items-center justify-center gap-4">
        {/* Instagram */}
        <button
          type="button"
          onClick={() => show("Fitur login Instagram akan segera hadir", "info")}
          className="w-14 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          aria-label="Masuk dengan Instagram"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </button>

        {/* Facebook */}
        <button
          type="button"
          onClick={() => show("Fitur login Facebook akan segera hadir", "info")}
          className="w-14 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          aria-label="Masuk dengan Facebook"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </button>

        {/* LinkedIn */}
        <button
          type="button"
          onClick={() => show("Fitur login LinkedIn akan segera hadir", "info")}
          className="w-14 h-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-800 hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          aria-label="Masuk dengan LinkedIn"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        </button>
      </div>

      {/* Footer Links (#00AFBF) */}
      <div className="mt-8 text-center space-y-2.5">
        <p className="text-xs text-slate-600 font-medium">
          Don&apos;t have an account?{" "}
          <Link
            href="/daftar"
            className="text-[#00AFBF] font-semibold hover:underline"
          >
            Sign Up.
          </Link>
        </p>

        <Link
          href="/lupa-sandi"
          className="text-xs font-semibold text-[#00AFBF] hover:underline block mx-auto"
        >
          Forgot Password
        </Link>
      </div>

      {/* Demo Quick-Fill Bar */}
      <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-center gap-2">
        <span className="text-[10px] uppercase font-bold text-slate-400">Demo Akses:</span>
        <button
          type="button"
          onClick={() => handleQuickLogin("admin", "admin123")}
          className="rounded-full bg-slate-200/70 hover:bg-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
        >
          Admin
        </button>
        <button
          type="button"
          onClick={() => handleQuickLogin("relawan", "relawan123")}
          className="rounded-full bg-slate-200/70 hover:bg-slate-300 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
        >
          Relawan PMI
        </button>
      </div>
    </div>
  );
}
