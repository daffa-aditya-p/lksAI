import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AktivitasClient from "./AktivitasClient";

export const metadata = {
  title: "Aktivitas — SATU AI",
  description: "Pantau laporan, kegiatan relawan, dan riwayat donasi kamu.",
};

export const dynamic = "force-dynamic";

export default async function AktivitasPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id;

  // 1. Ambil riwayat laporan darurat
  let laporanDb: any[] = [];
  if (userId) {
    laporanDb = await prisma.kasus.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }
  if (laporanDb.length === 0) {
    laporanDb = await prisma.kasus.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }

  // 2. Ambil riwayat pendaftaran relawan
  let relawanDb: any[] = [];
  if (userId) {
    relawanDb = await prisma.pendaftaranRelawan.findMany({
      where: { userId },
      include: { kegiatan: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }
  if (relawanDb.length === 0) {
    relawanDb = await prisma.pendaftaranRelawan.findMany({
      include: { kegiatan: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }

  // 3. Ambil riwayat donasi pengguna
  let donasiDb: any[] = [];
  if (userId) {
    donasiDb = await prisma.transaksiDonasi.findMany({
      where: { userId },
      include: { kampanye: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }
  if (donasiDb.length === 0) {
    donasiDb = await prisma.transaksiDonasi.findMany({
      include: { kampanye: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
  }

  return (
    <AktivitasClient
      initialLaporan={laporanDb.map((l) => ({
        id: l.id,
        kodeUnik: l.kodeUnik,
        judul: l.namaKK ? `Banjir - ${l.namaKK}` : `Banjir - ${l.asalLokasi || "Jakarta Timur"}`,
        asalLokasi: l.asalLokasi || "Jakarta Timur",
        levelPrioritas: l.levelPrioritas,
        status: l.status === "terverifikasi" ? "Selesai" : "Sedang di verifikasi",
        createdAt: l.createdAt.toISOString(),
      }))}
      initialRelawan={relawanDb.map((r) => ({
        id: r.id,
        judul: `Open Volunteer - ${r.kegiatan?.judul || "Banjir Jakarta Timur"}`,
        tanggalRentang: r.kegiatan?.tanggalRentang || "8 - 20 Oktober 2026",
        lokasi: r.kegiatan?.lokasi || "Jakarta Timur",
        alamatSpesifik: r.kegiatan?.alamatSpesifik || "Jl. Melati No.5, Jakarta Timur",
        posisi: r.posisi,
        waktuKegiatan: r.kegiatan?.waktuKegiatan || "06.00 - 18.00 WIB",
        informasiTugas: r.kegiatan?.informasiTugas || "Membantu distribusi paket bantuan kepada pengungsi di posko RW 05",
        kontakKordinator: r.kegiatan?.kontakKordinator || "08123425871667",
        status: r.status === "DISETUJUI" ? "Terverifikasi" : "Terdaftar",
        createdAt: r.createdAt.toISOString(),
      }))}
      initialDonasi={donasiDb.map((d) => ({
        id: d.id,
        kodeDonasi: d.kodeDonasi,
        judul: d.kampanye?.judul || "Bantuan Korban Banjir Jakarta",
        nominal: d.nominal,
        status: d.status === "BERHASIL" ? "Terkirim" : "Menunggu Pembayaran",
        metode: d.metodePembayaran,
        createdAt: d.createdAt.toISOString(),
      }))}
      user={{
        name: session?.user?.name || null,
        email: session?.user?.email || null,
      }}
    />
  );
}
