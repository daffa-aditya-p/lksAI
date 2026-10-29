"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { catatAudit } from "@/lib/audit";
import { revalidatePath } from "next/cache";

/**
 * Memverifikasi laporan darurat warga dari lapangan oleh Relawan/Admin.
 */
export async function verifikasiLaporanLapangan(kasusId: string) {
  try {
    const session = await auth();
    if (!session?.user || !["RELAWAN", "ADMIN"].includes(session.user.role)) {
      return { ok: false, error: "Akses ditolak. Hanya relawan atau admin yang berhak." };
    }

    const kasus = await prisma.kasus.findUnique({
      where: { id: kasusId },
      select: { id: true, namaKK: true, status: true },
    });

    if (!kasus) {
      return { ok: false, error: "Data laporan tidak ditemukan." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.kasus.update({
        where: { id: kasusId },
        data: {
          status: "terverifikasi",
          isSpam: false,
        },
      });

      await tx.auditLog.create({
        data: {
          aksi: "VERIFIKASI_LAPORAN_LAPANGAN",
          aktor: `${session.user.role}:${session.user.username}`,
          kasusId,
          detail: {
            namaKK: kasus.namaKK,
            verifiedAt: new Date().toISOString(),
          },
        },
      });
    });

    revalidatePath("/relawan");
    revalidatePath("/admin");
    revalidatePath("/app");
    revalidatePath("/rujukan");

    return { ok: true, message: `Laporan ${kasus.namaKK || "Korban"} berhasil diverifikasi.` };
  } catch (error) {
    console.error("[verifikasiLaporanLapangan]", error);
    return { ok: false, error: "Gagal memproses verifikasi laporan." };
  }
}

/**
 * Mencatat distribusi bantuan logistik/medis kepada pengungsi di posko.
 */
export async function catatDistribusiLogistik(data: {
  kasusId?: string;
  namaPenerima: string;
  poskoNama?: string;
  itemBantuan: string[];
  catatan?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user || !["RELAWAN", "ADMIN"].includes(session.user.role)) {
      return { ok: false, error: "Akses ditolak. Hanya relawan atau admin yang berhak." };
    }

    if (!data.namaPenerima.trim() || data.itemBantuan.length === 0) {
      return { ok: false, error: "Nama penerima dan minimal 1 jenis bantuan wajib diisi." };
    }

    await catatAudit({
      aksi: "DISTRIBUSI_BANTUAN_POSKO",
      aktor: `${session.user.role}:${session.user.username}`,
      kasusId: data.kasusId || undefined,
      detail: {
        penerima: data.namaPenerima.trim(),
        posko: data.poskoNama || "Posko Pengungsian RW 05",
        bantuan: data.itemBantuan,
        catatan: data.catatan || "-",
        waktuDistribusi: new Date().toISOString(),
      },
    });

    revalidatePath("/relawan");
    return { ok: true, message: `Bantuan untuk ${data.namaPenerima} sukses dicatat.` };
  } catch (error) {
    console.error("[catatDistribusiLogistik]", error);
    return { ok: false, error: "Gagal mencatat distribusi bantuan." };
  }
}
