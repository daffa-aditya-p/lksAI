import type { Metadata } from "next";
import MapClient from "@/components/peta/MapClient";

export const metadata: Metadata = {
  title: "Peta Kebutuhan Area Terdampak — SATU AI",
};

/**
 * LAYER PUBLIK — tanpa login.
 * Hanya area kecamatan/kabupaten + kategori kebutuhan umum. Tanpa titik GPS
 * presisi, tanpa angka jumlah, tanpa urgensi. Data agregat, bukan individu.
 */
export default function PetaPublikPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-black text-slate-900">Peta Kebutuhan Area Terdampak</h1>
          <p className="text-sm text-slate-500">
            Gambaran kebutuhan umum per wilayah untuk mengarahkan bantuan. Untuk detail
            per posko (jumlah & urgensi), koordinator dapat masuk ke{" "}
            <a href="/peta/instansi" className="font-semibold text-pmi hover:underline">
              layer instansi
            </a>
            .
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/posko"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition-all"
          >
            <i className="fa-solid fa-list mr-1" aria-hidden="true"></i>
            Daftar Kartu Posko
          </a>
        </div>
      </div>
      <MapClient mode="publik" />
    </div>
  );
}
