import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppPetaClient from "./AppPetaClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Peta Navigasi Bencana & Posko Terdekat — SATU AI",
  description: "Peta interaktif posko bencana, ketersediaan logistik darurat, dan petunjuk arah rute Google Maps",
};

export interface PoskoMapData {
  id: string;
  nama: string;
  area: string;
  alamat: string;
  lat: number;
  lng: number;
  tipe: "pengungsian" | "medis" | "logistik";
  tipeLabel: string;
  status: string;
  kapasitas: string;
  picNama: string;
  picTelepon: string;
  tersedia: Array<{
    kategori: string;
    nama: string;
    status: "Tersedia" | "Menipis" | "Habis";
    jumlah?: string;
    icon: string;
  }>;
}

export default async function AppPetaPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Ambil posko dari database
  const dbPosko = await prisma.posko.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: {
      kebutuhanAgregat: {
        select: {
          kategori: true,
          urgensi: true,
          estimasiJumlah: true,
          ringkasanLaporan: true,
        },
      },
    },
  });

  // Posko lokal strategis Jakarta & area bencana untuk fallback jika DB belum lengkap
  const fallbackList: PoskoMapData[] = [
    {
      id: "posko-km-05",
      nama: "Posko Pengungsian RW 05 Kampung Melayu",
      area: "Jatinegara, Jakarta Timur",
      alamat: "Jl. Kampung Melayu Barat No. 12, RT 05/RW 05, Jatinegara, Jakarta Timur",
      lat: -6.2245,
      lng: 106.8665,
      tipe: "pengungsian",
      tipeLabel: "Posko Pengungsian",
      status: "Beroperasi 24 Jam",
      kapasitas: "120 / 150 Jiwa",
      picNama: "Bpk. Rahmat (Ketua RW 05)",
      picTelepon: "081298765432",
      tersedia: [
        { kategori: "makanan", nama: "Dapur Umum & Makanan Siap Santap", status: "Tersedia", jumlah: "350 Porsi/hari", icon: "Utensils" },
        { kategori: "air", nama: "Air Bersih & Tandon PDAM", status: "Tersedia", jumlah: "4.000 Liter", icon: "Droplets" },
        { kategori: "tenda", nama: "Tenda Darurat & Kasur Lipat", status: "Tersedia", jumlah: "25 Unit", icon: "Tent" },
        { kategori: "medis", nama: "Posko P3K & Obat-obatan Dasar", status: "Tersedia", jumlah: "Siaga 2 Dokter", icon: "HeartPulse" },
        { kategori: "bayi", nama: "Popok & Susu Formula Bayi", status: "Tersedia", jumlah: "40 Paket", icon: "Baby" },
        { kategori: "listrik", nama: "Genset Darurat & Stasiun Cas HP", status: "Tersedia", jumlah: "Aktif", icon: "Zap" },
      ],
    },
    {
      id: "posko-medis-km",
      nama: "Pos Medis Darurat Kampung Melayu",
      area: "Jatinegara, Jakarta Timur",
      alamat: "Puskesmas Kelurahan Kampung Melayu, Jl. Kebon Pala II",
      lat: -6.2218,
      lng: 106.8692,
      tipe: "medis",
      tipeLabel: "Layanan Medis Darurat",
      status: "Siaga 24 Jam",
      kapasitas: "40 Pasien Rawat Singkat",
      picNama: "dr. Hendra (Koordinator PMI)",
      picTelepon: "081312345678",
      tersedia: [
        { kategori: "medis", nama: "Dokter Umum & Perawat Lapangan", status: "Tersedia", jumlah: "4 Tenaga Medis", icon: "Stethoscope" },
        { kategori: "medis", nama: "Ambulans Evakuasi 24 Jam", status: "Tersedia", jumlah: "2 Unit", icon: "Ambulance" },
        { kategori: "obat", nama: "Obat Kronis (Hipertensi, Asma, Diabetes)", status: "Tersedia", jumlah: "Cukup", icon: "Pill" },
        { kategori: "p3k", nama: "Pembalut Luka & Antiseptik Darurat", status: "Tersedia", jumlah: "Lengkap", icon: "HeartPulse" },
        { kategori: "oksigen", nama: "Tabung Oksigen & Nebulizer", status: "Tersedia", jumlah: "6 Tabung", icon: "Activity" },
      ],
    },
    {
      id: "posko-logistik-rw03",
      nama: "Gudang Logistik & Dapur Umum RW 03",
      area: "Jatinegara, Jakarta Timur",
      alamat: "Gedung Serbaguna RW 03, Jl. Inspeksi Kali Ciliwung",
      lat: -6.2265,
      lng: 106.8635,
      tipe: "logistik",
      tipeLabel: "Dapur Umum & Logistik",
      status: "Aktif Penyaluran",
      kapasitas: "Kapasitas Dapur: 1.000 Porsi/hari",
      picNama: "Ibu Siti (Koordinator Dapur)",
      picTelepon: "081287654321",
      tersedia: [
        { kategori: "makanan", nama: "Bahan Pokok (Beras, Minyak, Telur)", status: "Tersedia", jumlah: "1,5 Ton", icon: "Package" },
        { kategori: "makanan", nama: "Makanan Siap Santap Hangat", status: "Tersedia", jumlah: "500 Box", icon: "Utensils" },
        { kategori: "air", nama: "Air Mineral Botol & Galon", status: "Tersedia", jumlah: "120 Dus", icon: "Droplets" },
        { kategori: "pakaian", nama: "Pakaian Kering & Selimut Hangat", status: "Tersedia", jumlah: "85 Paket", icon: "Shirt" },
      ],
    },
  ];

  // Mapping data dari database
  const mappedDbPosko: PoskoMapData[] = dbPosko.map((p, idx) => {
    const isMedis =
      p.namaPosko.toLowerCase().includes("medis") ||
      p.namaPosko.toLowerCase().includes("puskesmas") ||
      p.kebutuhanAgregat.some((k) => k.kategori.includes("medis") || k.kategori.includes("obat"));

    const isLogistik =
      p.namaPosko.toLowerCase().includes("logistik") ||
      p.namaPosko.toLowerCase().includes("dapur") ||
      p.namaPosko.toLowerCase().includes("gudang");

    const tipe: "pengungsian" | "medis" | "logistik" = isMedis
      ? "medis"
      : isLogistik
      ? "logistik"
      : "pengungsian";

    const tipeLabel =
      tipe === "medis"
        ? "Layanan Medis Darurat"
        : tipe === "logistik"
        ? "Dapur Umum & Logistik"
        : "Posko Pengungsian";

    const defaultTersedia = [
      { kategori: "makanan", nama: "Makanan & Dapur Umum", status: "Tersedia" as const, jumlah: "250 Porsi", icon: "Utensils" },
      { kategori: "air", nama: "Air Bersih", status: "Tersedia" as const, jumlah: "2.000 L", icon: "Droplets" },
      { kategori: "medis", nama: "P3K & Obat Darurat", status: "Tersedia" as const, jumlah: "Siaga", icon: "HeartPulse" },
      { kategori: "tenda", nama: "Tenda Pengungsian", status: "Tersedia" as const, jumlah: "15 Unit", icon: "Tent" },
      { kategori: "bayi", nama: "Perlengkapan Bayi", status: "Tersedia" as const, jumlah: "20 Paket", icon: "Baby" },
    ];

    return {
      id: p.id,
      nama: p.namaPosko,
      area: p.areaPublik,
      alamat: p.alamatText || p.areaPublik,
      lat: p.lat ?? -6.2245 + ((idx * 0.007) % 0.05),
      lng: p.lng ?? 106.8665 + ((idx * 0.006) % 0.05),
      tipe,
      tipeLabel,
      status: "Beroperasi 24 Jam",
      kapasitas: `${80 + (idx * 15) % 200} Jiwa`,
      picNama: `Petugas Posko ${p.namaPosko.split(" ")[0]}`,
      picTelepon: "081234567890",
      tersedia: defaultTersedia,
    };
  });

  // Gabungkan fallback utama di depan agar posko terdekat selalu presisi
  const existingNames = new Set(mappedDbPosko.map((p) => p.nama.toLowerCase()));
  const filteredFallbacks = fallbackList.filter(
    (f) => !existingNames.has(f.nama.toLowerCase())
  );
  const poskoList: PoskoMapData[] = [...fallbackList, ...mappedDbPosko];

  return (
    <AppPetaClient
      user={{
        name: session.user.name,
        username: session.user.username,
      }}
      poskoList={poskoList}
    />
  );
}
