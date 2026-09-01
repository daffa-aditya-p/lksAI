import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import PoskoAdminPanel from "@/components/peta/PoskoAdminPanel";
import PendingConfirmationQueue from "@/components/peta/PendingConfirmationQueue";

export const metadata: Metadata = {
  title: "Kelola Peta Posko — SIGAP AI",
};

/**
 * Panel admin lintas-posko — ADMIN only (validasi server).
 * 1) CRUD posko (geocode / drop pin manual).
 * 2) Lapor kebutuhan (AI klasifikasi → pending).
 * 3) Antrean konfirmasi tenaga medis/koordinator.
 */
export default async function PetaAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/peta/admin");
  if (session.user.role !== "ADMIN") redirect("/intake");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
            >
              <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
              Kembali ke Dashboard
            </Link>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">Kelola Peta Lintas-Posko</h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Tambah posko, lapor kebutuhan, dan konfirmasi data sebelum tampil di peta.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/peta/instansi"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-map" aria-hidden="true"></i>
            Lihat Peta Posko
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <PoskoAdminPanel />
        <PendingConfirmationQueue />
      </div>
    </div>
  );
}
