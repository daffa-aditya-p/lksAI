import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/posko
 * Mengembalikan daftar posko publik untuk peta dan pencarian layanan bantuan masyarakat.
 */
export async function GET() {
  try {
    const posko = await prisma.posko.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        namaPosko: true,
        areaPublik: true,
        alamatText: true,
        lat: true,
        lng: true,
        kebutuhanAgregat: {
          where: { status: "dikonfirmasi" },
          select: {
            kategori: true,
            urgensi: true,
            estimasiJumlah: true,
            ringkasanLaporan: true,
          },
        },
      },
    });

    const formatted = posko.map((p) => {
      // Tentukan tipe posko utama berdasarkan nama & kebutuhan
      let tipe: "pengungsian" | "medis" | "logistik" = "pengungsian";
      const namaLower = p.namaPosko.toLowerCase();
      if (
        namaLower.includes("medis") ||
        namaLower.includes("puskesmas") ||
        p.kebutuhanAgregat.some((k) => k.kategori === "tenaga_medis" || k.kategori.startsWith("obat_"))
      ) {
        tipe = "medis";
      } else if (
        namaLower.includes("logistik") ||
        namaLower.includes("dapur") ||
        namaLower.includes("gudang")
      ) {
        tipe = "logistik";
      }

      return {
        id: p.id,
        namaPosko: p.namaPosko,
        areaPublik: p.areaPublik,
        alamatText: p.alamatText || "Alamat dalam konfirmasi petugas",
        lat: p.lat,
        lng: p.lng,
        tipe,
        kebutuhan: p.kebutuhanAgregat.map((k) => k.kategori),
      };
    });

    return NextResponse.json({ ok: true, data: formatted });
  } catch (error) {
    console.error("[GET /api/posko]", error);
    return NextResponse.json({ ok: false, error: "Gagal memuat daftar posko" }, { status: 500 });
  }
}
