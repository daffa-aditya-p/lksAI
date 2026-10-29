"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface KegiatanRelawanItem {
  id: string;
  slug: string;
  judul: string;
  tanggalRentang: string;
  lokasi: string;
  alamatSpesifik: string | null;
  kuotaTerisi: number;
  kuotaMaksimal: number;
  persentase: number;
  posisiDibutuhkan: string[];
  deskripsi: string;
  informasiTugas: string | null;
  waktuKegiatan: string | null;
  kontakKordinator: string | null;
  aktif: boolean;
}

export interface DaftarRelawanInput {
  kegiatanId: string;
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  kemampuan?: string;
  pengalaman?: string;
  posisi: string;
}

export interface PendaftaranItem {
  id: string;
  kegiatanId: string;
  kegiatanJudul: string;
  tanggalRentang: string;
  lokasi: string;
  alamatSpesifik: string;
  posisi: string;
  waktuKegiatan: string;
  informasiTugas: string;
  kontakKordinator: string;
  status: string;
  namaLengkap: string;
  createdAt: Date;
}

/** Ambil daftar lowongan relawan lapangan (Open Volunteer) */
export async function getDaftarKegiatanRelawan(): Promise<KegiatanRelawanItem[]> {
  try {
    // Pastikan data default tersedia jika tabel kosong
    const count = await prisma.kegiatanRelawan.count();
    if (count === 0) {
      await prisma.kegiatanRelawan.create({
        data: {
          slug: "banjir-jakarta-timur",
          judul: "Banjir Jakarta Timur",
          tanggalRentang: "8-12 Oktober 2026",
          lokasi: "Jakarta Timur",
          alamatSpesifik: "Jl. Melati No.5, Jakarta Timur",
          kuotaTerisi: 24,
          kuotaMaksimal: 50,
          posisiDibutuhkan: ["Distribusi", "Logistik", "Dapur Umum"],
          deskripsi:
            "Kegiatan relawan untuk membantu distribusi bantuan pengelolaan logistik dan penyediaan konsumsi melalui dapur umum bagi korban banjir di wilayah Jakarta Timur selama 5 hari.",
          informasiTugas:
            "Membantu distribusi paket bantuan kepada pengungsi di posko RW 05",
          waktuKegiatan: "06.00 - 18.00 WIB",
          kontakKordinator: "08123425871667",
          aktif: true,
        },
      });
    }

    const list = await prisma.kegiatanRelawan.findMany({
      where: { aktif: true },
      orderBy: { createdAt: "desc" },
    });

    return list.map((k) => {
      const max = k.kuotaMaksimal || 1;
      const pct = Math.min(100, Math.round((k.kuotaTerisi / max) * 100));
      return {
        id: k.id,
        slug: k.slug,
        judul: k.judul,
        tanggalRentang: k.tanggalRentang,
        lokasi: k.lokasi,
        alamatSpesifik: k.alamatSpesifik,
        kuotaTerisi: k.kuotaTerisi,
        kuotaMaksimal: k.kuotaMaksimal,
        persentase: pct,
        posisiDibutuhkan: (k.posisiDibutuhkan as string[]) || ["Distribusi", "Logistik", "Dapur Umum"],
        deskripsi: k.deskripsi,
        informasiTugas: k.informasiTugas,
        waktuKegiatan: k.waktuKegiatan,
        kontakKordinator: k.kontakKordinator,
        aktif: k.aktif,
      };
    });
  } catch (error) {
    console.error("Gagal mengambil daftar kegiatan relawan:", error);
    return [];
  }
}

/** Ambil detail satu kegiatan open volunteer */
export async function getDetailKegiatanRelawan(idOrSlug: string): Promise<KegiatanRelawanItem | null> {
  try {
    const k = await prisma.kegiatanRelawan.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!k) return null;

    const max = k.kuotaMaksimal || 1;
    const pct = Math.min(100, Math.round((k.kuotaTerisi / max) * 100));

    return {
      id: k.id,
      slug: k.slug,
      judul: k.judul,
      tanggalRentang: k.tanggalRentang,
      lokasi: k.lokasi,
      alamatSpesifik: k.alamatSpesifik,
      kuotaTerisi: k.kuotaTerisi,
      kuotaMaksimal: k.kuotaMaksimal,
      persentase: pct,
      posisiDibutuhkan: (k.posisiDibutuhkan as string[]) || ["Distribusi", "Logistik", "Dapur Umum"],
      deskripsi: k.deskripsi,
      informasiTugas: k.informasiTugas,
      waktuKegiatan: k.waktuKegiatan,
      kontakKordinator: k.kontakKordinator,
      aktif: k.aktif,
    };
  } catch (error) {
    console.error("Gagal mengambil detail kegiatan relawan:", error);
    return null;
  }
}

/** Simpan pendaftaran relawan baru */
export async function daftarRelawanBaru(input: DaftarRelawanInput) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    if (!input.namaLengkap?.trim()) {
      return { ok: false, error: "Nama lengkap wajib diisi" };
    }
    if (!input.email?.trim()) {
      return { ok: false, error: "Email wajib diisi" };
    }
    if (!input.nomorTelepon?.trim()) {
      return { ok: false, error: "Nomor telepon wajib diisi" };
    }
    if (!input.posisi?.trim()) {
      return { ok: false, error: "Silakan pilih posisi yang diinginkan" };
    }

    const kegiatan = await prisma.kegiatanRelawan.findUnique({
      where: { id: input.kegiatanId },
    });

    if (!kegiatan) {
      return { ok: false, error: "Kegiatan relawan tidak ditemukan" };
    }

    // Atomic transaction: Simpan pendaftaran + update kuota terisi
    const [pendaftaran, updatedKegiatan] = await prisma.$transaction([
      prisma.pendaftaranRelawan.create({
        data: {
          kegiatanId: kegiatan.id,
          userId,
          namaLengkap: input.namaLengkap.trim(),
          email: input.email.trim(),
          nomorTelepon: input.nomorTelepon.trim(),
          kemampuan: input.kemampuan?.trim() || null,
          pengalaman: input.pengalaman?.trim() || null,
          posisi: input.posisi,
          status: "TERDAFTAR",
        },
      }),
      prisma.kegiatanRelawan.update({
        where: { id: kegiatan.id },
        data: {
          kuotaTerisi: { increment: 1 },
        },
      }),
    ]);

    revalidatePath("/app/relawan-join");
    revalidatePath("/app/aktivitas");

    const result: PendaftaranItem = {
      id: pendaftaran.id,
      kegiatanId: kegiatan.id,
      kegiatanJudul: kegiatan.judul,
      tanggalRentang: kegiatan.tanggalRentang,
      lokasi: kegiatan.lokasi,
      alamatSpesifik: kegiatan.alamatSpesifik || "Posko Utama Lapangan",
      posisi: pendaftaran.posisi,
      waktuKegiatan: kegiatan.waktuKegiatan || "06.00 - 18.00 WIB",
      informasiTugas: kegiatan.informasiTugas || "Membantu koordinasi posko darurat",
      kontakKordinator: kegiatan.kontakKordinator || "08123425871667",
      status: pendaftaran.status,
      namaLengkap: pendaftaran.namaLengkap,
      createdAt: pendaftaran.createdAt,
    };

    return {
      ok: true,
      data: result,
      kegiatan: updatedKegiatan,
    };
  } catch (error) {
    console.error("Gagal mendaftar relawan:", error);
    return { ok: false, error: "Terjadi kesalahan sistem saat mendaftar relawan." };
  }
}

/** Ambil riwayat pendaftaran relawan aktif untuk user saat ini */
export async function getAktivitasRelawanUser(): Promise<PendaftaranItem | null> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    let pendaftaran = null;
    if (userId) {
      pendaftaran = await prisma.pendaftaranRelawan.findFirst({
        where: { userId },
        include: { kegiatan: true },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!pendaftaran) {
      // Ambil yang paling mutakhir terdaftar sebagai fallback demo
      pendaftaran = await prisma.pendaftaranRelawan.findFirst({
        include: { kegiatan: true },
        orderBy: { createdAt: "desc" },
      });
    }

    if (!pendaftaran || !pendaftaran.kegiatan) {
      // Jika belum ada di database, gunakan data demo yang sinkron dengan Gambar 4
      return {
        id: "demo-pendaftaran",
        kegiatanId: "banjir-jakarta-timur",
        kegiatanJudul: "Banjir Jakarta Timur",
        tanggalRentang: "8-10 Oktober 2026",
        lokasi: "Jakarta Timur",
        alamatSpesifik: "Jl. Melati No.5, Jakarta Timur",
        posisi: "Distribusi Bantuan",
        waktuKegiatan: "06.00 - 18.00 WIB",
        informasiTugas: "Membantu distribusi paket bantuan kepada pengungsi di posko RW 05",
        kontakKordinator: "08123425871667",
        status: "TERDAFTAR",
        namaLengkap: session?.user?.name || "Relawan SATU",
        createdAt: new Date(),
      };
    }

    return {
      id: pendaftaran.id,
      kegiatanId: pendaftaran.kegiatan.id,
      kegiatanJudul: pendaftaran.kegiatan.judul,
      tanggalRentang: pendaftaran.kegiatan.tanggalRentang,
      lokasi: pendaftaran.kegiatan.lokasi,
      alamatSpesifik: pendaftaran.kegiatan.alamatSpesifik || "Posko Utama Lapangan",
      posisi: pendaftaran.posisi,
      waktuKegiatan: pendaftaran.kegiatan.waktuKegiatan || "06.00 - 18.00 WIB",
      informasiTugas: pendaftaran.kegiatan.informasiTugas || "Membantu distribusi paket bantuan",
      kontakKordinator: pendaftaran.kegiatan.kontakKordinator || "08123425871667",
      status: pendaftaran.status,
      namaLengkap: pendaftaran.namaLengkap,
      createdAt: pendaftaran.createdAt,
    };
  } catch (error) {
    console.error("Gagal mengambil aktivitas relawan:", error);
    return null;
  }
}
