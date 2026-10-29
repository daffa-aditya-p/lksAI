import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PoskoClient, { PoskoItem } from "./PoskoClient";

export const metadata: Metadata = {
  title: "Daftar Posko & Layanan Bantuan — SATU AI",
  description:
    "Cari dan temukan posko pengungsian terdekat, layanan medis darurat, dan fasilitas bantuan bencana.",
};

export const revalidate = 60; // ISR cache 60 detik

const MOCK_POSKO: PoskoItem[] = [
  {
    id: "posko-rw-05",
    nama: "Posko Pengungsian RW 05",
    tipe: "pengungsian",
    badge: "Tersedia",
    badgeType: "tersedia",
    iconType: "home",
    jarakKm: 1.2,
    jarakDisplay: "1,2 km",
    gambar: "/images/posko/puskesmas-thumb.png",
    alamat: "Jl. Sadang 5, RT/RW: 001/017 Jatinegara",
    areaPublik: "Jatinegara, Jakarta Timur",
    jamLayanan: "24 Jam",
    kontak: "021-8501-2345",
    kodePosko: "POSKO01",
    lat: -6.225,
    lng: 106.87,
  },
  {
    id: "puskesmas-kecamatan",
    nama: "Puskesmas Kecamatan",
    tipe: "medis",
    badge: "Layanan Medis",
    badgeType: "medis",
    iconType: "medis",
    jarakKm: 1.8,
    jarakDisplay: "1,8 km",
    gambar: "/images/posko/puskesmas-thumb.png",
    alamat: "Jl. Nusa Indah 5, RT/RW: 001/017, Malaka Jaya, Kec. Duren sawit",
    areaPublik: "Duren Sawit, Jakarta Timur",
    jamLayanan: "Senin - Sabtu 24 Jam",
    kontak: "021-8611-9876",
    kodePosko: "POSKO01",
    lat: -6.23,
    lng: 106.92,
  },
  {
    id: "bantuan-medis-pmi",
    nama: "Titik Bantuan Medis PMI",
    tipe: "medis",
    badge: "Bantuan Medis",
    badgeType: "medis",
    iconType: "ambulans",
    jarakKm: 2.4,
    jarakDisplay: "2,4 km",
    gambar: "/images/rescue/layanan-medis.png",
    alamat: "Jl. Raya Jatinegara Barat No. 12, Balimester, Jakarta Timur",
    areaPublik: "Jatinegara, Jakarta Timur",
    jamLayanan: "08:00 - 20:00 WIB",
    kontak: "021-8199-0012",
    kodePosko: "POSKO01",
    lat: -6.218,
    lng: 106.865,
  },
  {
    id: "posko-dapur-rw-08",
    nama: "Posko Dapur Umum & Logistik RW 08",
    tipe: "logistik",
    badge: "Tersedia",
    badgeType: "tersedia",
    iconType: "logistik",
    jarakKm: 3.1,
    jarakDisplay: "3,1 km",
    gambar: "/images/rescue/posko-bantuan.png",
    alamat: "Kompleks Olahraga Remaja, Jl. Otto Iskandardinata No. 45",
    areaPublik: "Bidara Cina, Jakarta Timur",
    jamLayanan: "24 Jam",
    kontak: "0812-9876-5432",
    kodePosko: "POSKO01",
    lat: -6.241,
    lng: 106.875,
  },
];

export default async function PoskoPage() {
  // Ambil posko dari database
  let dbPosko: PoskoItem[] = [];
  try {
    const rows = await prisma.posko.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        namaPosko: true,
        areaPublik: true,
        alamatText: true,
        lat: true,
        lng: true,
      },
    });

    dbPosko = rows
      .filter(
        (r) =>
          !MOCK_POSKO.some(
            (m) => m.nama.toLowerCase() === r.namaPosko.toLowerCase()
          )
      )
      .map((r, index) => {
        const isMedis =
          r.namaPosko.toLowerCase().includes("puskesmas") ||
          r.namaPosko.toLowerCase().includes("medis") ||
          r.namaPosko.toLowerCase().includes("kesehatan");

        const isLogistik =
          r.namaPosko.toLowerCase().includes("logistik") ||
          r.namaPosko.toLowerCase().includes("dapur");

        const tipe: PoskoItem["tipe"] = isMedis
          ? "medis"
          : isLogistik
          ? "logistik"
          : "pengungsian";

        const iconType: PoskoItem["iconType"] = isMedis
          ? "medis"
          : isLogistik
          ? "logistik"
          : "home";

        const badgeType: PoskoItem["badgeType"] = isMedis
          ? "medis"
          : isLogistik
          ? "logistik"
          : "tersedia";

        const badge = isMedis
          ? "Layanan Medis"
          : isLogistik
          ? "Bantuan Logistik"
          : "Tersedia";

        // Est. jarak fallback
        const baseKm = 4.2 + index * 1.5;

        return {
          id: r.id,
          nama: r.namaPosko,
          tipe,
          badge,
          badgeType,
          iconType,
          jarakKm: +baseKm.toFixed(1),
          jarakDisplay: `${baseKm.toFixed(1).replace(".", ",")} km`,
          gambar: isMedis
            ? "/images/posko/puskesmas-thumb.png"
            : isLogistik
            ? "/images/rescue/posko-bantuan.png"
            : "/images/posko/puskesmas-thumb.png",
          alamat:
            r.alamatText ||
            `Area ${r.areaPublik}, koordinat (${r.lat.toFixed(4)}, ${r.lng.toFixed(4)})`,
          areaPublik: r.areaPublik,
          jamLayanan: "24 Jam",
          kontak: "021-8501-0000",
          kodePosko: "POSKO01",
          lat: r.lat,
          lng: r.lng,
        };
      });
  } catch (err) {
    console.error("[PoskoPage] Gagal memuat posko DB:", err);
  }

  const allPosko = [...MOCK_POSKO, ...dbPosko];

  return <PoskoClient initialPosko={allPosko} />;
}
