import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { KATEGORI_LABEL } from "@/lib/peta";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/peta/publik — LAYER PUBLIK (tanpa login).
 *
 * Hanya data AGREGAT per area (kecamatan/kabupaten):
 *  - Posisi = centroid (rata-rata) posko di area itu, BUKAN titik GPS presisi.
 *  - Hanya kategori kebutuhan umum yang dikonfirmasi (tanpa angka jumlah,
 *    tanpa level urgensi, tanpa nama posko).
 *  - Tidak ada nama/usia/kondisi individu di layer ini.
 */
export async function GET() {
  try {
    const rows = await prisma.kebutuhanAgregat.findMany({
      where: { status: "dikonfirmasi" },
      select: {
        kategori: true,
        poskoId: true,
        posko: { select: { id: true, lat: true, lng: true, areaPublik: true } },
      },
    });

    // Agregat per areaPublik berbasis posko unik
    const perArea = new Map<
      string,
      {
        poskoMap: Map<string, { lat: number; lng: number }>;
        kategori: Set<string>;
      }
    >();

    for (const r of rows) {
      const area = r.posko.areaPublik;
      const cur = perArea.get(area) ?? {
        poskoMap: new Map(),
        kategori: new Set(),
      };
      if (!cur.poskoMap.has(r.posko.id)) {
        cur.poskoMap.set(r.posko.id, { lat: r.posko.lat, lng: r.posko.lng });
      }
      cur.kategori.add(KATEGORI_LABEL[r.kategori]);
      perArea.set(area, cur);
    }

    const areas = [...perArea.entries()].map(([nama, v]) => {
      const poskos = [...v.poskoMap.values()];
      const totalPosko = poskos.length || 1;
      const latSum = poskos.reduce((sum, p) => sum + p.lat, 0);
      const lngSum = poskos.reduce((sum, p) => sum + p.lng, 0);

      return {
        areaPublik: nama,
        lat: +(latSum / totalPosko).toFixed(5), // centroid rata-rata dari posko unik
        lng: +(lngSum / totalPosko).toFixed(5),
        jumlahPosko: totalPosko,
        kategori: [...v.kategori], // hanya nama kategori umum, TANPA angka/urgensi
      };
    });

    return NextResponse.json({ ok: true, areas });
  } catch (err) {
    console.error("[/api/peta/publik]", err);
    return NextResponse.json({ ok: false, error: "Gagal memuat peta publik" }, { status: 500 });
  }
}
