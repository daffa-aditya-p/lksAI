import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import MapClient from "@/components/peta/MapClient";

export const metadata: Metadata = {
  title: "Peta Instansi — SIGAP AI",
};

/**
 * LAYER INSTANSI — wajib login (relawan boleh LIHAT, hanya ADMIN yang kelola).
 * Titik GPS presisi posko + breakdown kebutuhan terkonfirmasi.
 * Data pribadi pengungsi TIDAK pernah muncul di layer ini (agregat per posko).
 */
export default async function PetaInstansiPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/peta/instansi");
  const isAdmin = session.user.role === "ADMIN";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <div>
            <Link
              href={isAdmin ? "/admin" : "/intake"}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95"
            >
              <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
              {isAdmin ? "Kembali ke Dashboard" : "Kembali ke Intake"}
            </Link>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">Peta Kebutuhan Lintas-Posko</h1>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                {isAdmin ? "Akses Admin" : "Akses Relawan (Lihat)"}
              </span>
            </div>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Layer instansi — titik presisi & breakdown kebutuhan terkonfirmasi per posko.
              Warna marker = urgensi tertinggi (merah ≥1 kebutuhan MERAH).
            </p>
          </div>
        </div>

        {isAdmin && (
          <Link
            href="/peta/admin"
            className="inline-flex items-center gap-1.5 rounded-xl bg-pmi px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-pmi-dark active:scale-95 transition-all"
          >
            <i className="fa-solid fa-gear" aria-hidden="true"></i>
            Kelola Posko & Antrean
          </Link>
        )}
      </div>
      <MapClient mode="instansi" />
      <p className="mt-2 text-xs text-slate-400">
        <i className="fa-solid fa-circle-info mr-1" aria-hidden="true"></i>
        Hanya data berstatus <b>dikonfirmasi</b> yang tampil. Marker abu-abu = posko belum ada
        laporan terkonfirmasi.
      </p>
    </div>
  );
}
