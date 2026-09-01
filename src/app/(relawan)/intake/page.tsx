import Link from "next/link";
import IntakeClient from "./IntakeClient";

export const metadata = { title: "Intake — SIGAP AI" };

export default function IntakePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900">Intake Keluarga Pengungsi</h1>
          <p className="text-sm text-slate-500">
            Ketik/ucapkan kondisi keluarga dengan bahasa biasa. AI mengekstrak, Anda
            mengonfirmasi tiap field sebelum tersimpan.
          </p>
        </div>
        <Link
          href="/peta/instansi"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:border-pmi/40 hover:text-pmi active:scale-95 transition-all"
        >
          <i className="fa-solid fa-map-location-dot text-pmi" aria-hidden="true"></i>
          Peta Kebutuhan Lintas-Posko
        </Link>
      </div>
      <IntakeClient />
    </div>
  );
}
