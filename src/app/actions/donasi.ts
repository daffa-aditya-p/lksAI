"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export interface KampanyeItem {
  id: string;
  slug: string;
  judul: string;
  deskripsi: string | null;
  targetDonasi: number;
  terkumpul: number;
  jumlahDonatur: number;
  persentase: number;
  kategoriTag: string[];
  alokasiDana: string[];
  penyelenggara: string;
  penyelenggaraDesc: string | null;
  terverifikasi: boolean;
}

export interface BuatDonasiInput {
  kampanyeId: string;
  nominal: number;
  metodePembayaran: "E_WALLET" | "VIRTUAL_ACCOUNT" | "BANK_TRANSFER";
  subMetode?: string;
  namaDonatur?: string;
  pesanDoa?: string;
  anonim?: boolean;
}

/** Ambil seluruh daftar kampanye donasi aktif */
export async function getDaftarKampanye(): Promise<KampanyeItem[]> {
  try {
    const list = await prisma.donasiKampanye.findMany({
      where: { aktif: true },
      orderBy: { createdAt: "desc" },
    });

    return list.map((k) => {
      const target = k.targetDonasi || 1;
      const pct = Math.min(100, Math.round((k.terkumpul / target) * 100));
      return {
        id: k.id,
        slug: k.slug,
        judul: k.judul,
        deskripsi: k.deskripsi,
        targetDonasi: k.targetDonasi,
        terkumpul: k.terkumpul,
        jumlahDonatur: k.jumlahDonatur,
        persentase: pct,
        kategoriTag: (k.kategoriTag as string[]) || [],
        alokasiDana: (k.alokasiDana as string[]) || [],
        penyelenggara: k.penyelenggara,
        penyelenggaraDesc: k.penyelenggaraDesc,
        terverifikasi: k.terverifikasi,
      };
    });
  } catch (error) {
    console.error("Gagal mengambil daftar kampanye donasi:", error);
    return [];
  }
}

/** Ambil detail satu kampanye berdasarkan ID atau Slug */
export async function getDetailKampanye(idOrSlug: string): Promise<KampanyeItem | null> {
  try {
    const k = await prisma.donasiKampanye.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!k) return null;

    const target = k.targetDonasi || 1;
    const pct = Math.min(100, Math.round((k.terkumpul / target) * 100));

    return {
      id: k.id,
      slug: k.slug,
      judul: k.judul,
      deskripsi: k.deskripsi,
      targetDonasi: k.targetDonasi,
      terkumpul: k.terkumpul,
      jumlahDonatur: k.jumlahDonatur,
      persentase: pct,
      kategoriTag: (k.kategoriTag as string[]) || [],
      alokasiDana: (k.alokasiDana as string[]) || [],
      penyelenggara: k.penyelenggara,
      penyelenggaraDesc: k.penyelenggaraDesc,
      terverifikasi: k.terverifikasi,
    };
  } catch (error) {
    console.error("Gagal mengambil detail kampanye:", error);
    return null;
  }
}

/** Buat transaksi donasi baru (Order) */
export async function buatTransaksiDonasi(input: BuatDonasiInput) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    if (!input.nominal || input.nominal < 5000) {
      return { ok: false, error: "Nominal donasi minimal Rp5.000" };
    }

    const kampanye = await prisma.donasiKampanye.findUnique({
      where: { id: input.kampanyeId },
    });

    if (!kampanye) {
      return { ok: false, error: "Kampanye donasi tidak ditemukan" };
    }

    // Generate kode unik donasi e.g. #DONASI-49281
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const kodeDonasi = `#DONASI-${randomCode}`;

    // Generate nomor Virtual Account atau QRIS payload simulasi
    let nomorVa: string | null = null;
    let qrPayload: string | null = null;

    if (input.metodePembayaran === "VIRTUAL_ACCOUNT") {
      const prefix = input.subMetode === "MANDIRI" ? "89508" : input.subMetode === "BRI" ? "10280" : "88081";
      nomorVa = `${prefix}${Math.floor(100000000 + Math.random() * 900000000)}`;
    } else if (input.metodePembayaran === "E_WALLET") {
      qrPayload = `00020101021226670016ID.CO.SATU.WWW01189360099900000100025204581253033605802ID5914SATU DONASI ID6007JAKARTA61051011062070703A016304${randomCode}`;
    } else {
      nomorVa = "123-00-9876543-2 (Bank Mandiri a.n Yayasan Bantu Sesama)";
    }

    const donaturName = input.anonim ? "Hamba Allah" : (input.namaDonatur?.trim() || session?.user?.name || "Hamba Allah");

    const transaksi = await prisma.transaksiDonasi.create({
      data: {
        kodeDonasi,
        kampanyeId: kampanye.id,
        nominal: input.nominal,
        metodePembayaran: input.metodePembayaran,
        subMetode: input.subMetode || null,
        status: "MENUNGGU_PEMBAYARAN",
        nomorVa,
        qrPayload,
        namaDonatur: donaturName,
        pesanDoa: input.pesanDoa?.trim() || null,
        anonim: input.anonim ?? true,
        userId,
      },
      include: {
        kampanye: true,
      },
    });

    return { ok: true, data: transaksi };
  } catch (error) {
    console.error("Gagal membuat transaksi donasi:", error);
    return { ok: false, error: "Terjadi kesalahan saat memproses donasi. Silakan coba lagi." };
  }
}

/** Konfirmasi penyelesaian pembayaran donasi (Simulasi / Webhook) */
export async function konfirmasiPembayaranDonasi(transaksiId: string) {
  try {
    const transaksi = await prisma.transaksiDonasi.findUnique({
      where: { id: transaksiId },
    });

    if (!transaksi) {
      return { ok: false, error: "Transaksi donasi tidak ditemukan" };
    }

    if (transaksi.status === "BERHASIL") {
      return { ok: true, data: transaksi, alreadyPaid: true };
    }

    // Atomic transaction: Ubah status transaksi + update agregat nominal kampanye
    const [updatedTransaksi, updatedKampanye] = await prisma.$transaction([
      prisma.transaksiDonasi.update({
        where: { id: transaksiId },
        data: {
          status: "BERHASIL",
          paidAt: new Date(),
        },
      }),
      prisma.donasiKampanye.update({
        where: { id: transaksi.kampanyeId },
        data: {
          terkumpul: { increment: transaksi.nominal },
          jumlahDonatur: { increment: 1 },
        },
      }),
    ]);

    revalidatePath("/app");
    revalidatePath("/app/donasi");

    return {
      ok: true,
      data: updatedTransaksi,
      kampanye: updatedKampanye,
    };
  } catch (error) {
    console.error("Gagal mengonfirmasi pembayaran donasi:", error);
    return { ok: false, error: "Gagal memproses pembayaran donasi" };
  }
}

/** Ambil status transaksi terkini */
export async function getStatusTransaksi(transaksiIdOrCode: string) {
  try {
    const t = await prisma.transaksiDonasi.findFirst({
      where: {
        OR: [{ id: transaksiIdOrCode }, { kodeDonasi: transaksiIdOrCode }],
      },
      include: {
        kampanye: true,
      },
    });
    return t;
  } catch {
    return null;
  }
}
