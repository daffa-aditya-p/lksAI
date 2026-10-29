import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Daftar Posko & Layanan Bantuan — SATU AI",
  description:
    "Cari dan temukan posko pengungsian terdekat, layanan medis darurat, dan titik bantuan logistik.",
};

export default async function PoskoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {session?.user ? (
        <AppHeader username={session.user.username} role={session.user.role} />
      ) : (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo size={28} withWordmark />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/peta"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Peta Interaktif
              </Link>
              <Link
                href="/login"
                className="rounded-lg bg-pmi px-3.5 py-1.5 text-xs font-bold text-white hover:bg-pmi-dark shadow-sm transition-all active:scale-95"
              >
                Masuk Petugas
              </Link>
            </div>
          </div>
        </header>
      )}
      <main>{children}</main>
    </div>
  );
}
