import { prisma } from "@/lib/prisma";
import { hitungSkor } from "@/lib/scoring";
import { catatAudit } from "@/lib/audit";
import { generateKodeUnik } from "@/lib/utils";
import { konfirmasiSchema, type KonfirmasiInput } from "@/lib/kasusSchema";
import type { ProfilKerentanan } from "@/lib/types";

/**
 * Shared save logic — dipakai oleh:
 *  1. Server Action simpanKasusTerkonfirmasi (intake online)
 *  2. Route /api/offline/sync (Background Sync dari Service Worker)
 *
 * Skor SELALU dihitung ulang di server oleh rule engine (klien tidak bisa
 * memalsukan skor/level). Audit dicatat di sini agar kedua jalur konsisten.
 */
export interface SimpanKasusResult {
  id: string;
  kodeUnik: string;
  level: string;
  skor: number;
}

export async function simpanKasusIntake(
  input: KonfirmasiInput,
  userId: string,
  username: string
): Promise<SimpanKasusResult> {
  const d = konfirmasiSchema.parse(input);

  const profil: ProfilKerentanan = {
    agentThought: d.agentThought,
    namaKK: d.namaKK,
    usiaKK: d.usiaKK,
    anggotaKeluarga: d.anggotaKeluarga,
    kondisiMedisKritis: d.kondisiMedisKritis,
    obatTersedia: d.obatTersedia,
    mobilitas: d.mobilitas,
    asalLokasi: d.asalLokasi,
    instansiRujukan: d.instansiRujukan,
  };
  const skor = hitungSkor(profil);

  // Cek idempotensi: jika ada clientSyncId, pastikan tidak menyimpan duplikat
  if (d.clientSyncId) {
    const tujuhHariLalu = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const recent = await prisma.kasus.findMany({
      where: {
        createdById: userId,
        createdAt: { gte: tujuhHariLalu },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
      select: { id: true, kodeUnik: true, levelPrioritas: true, skorKerentanan: true, provenance: true },
    });

    const existing = recent.find((k) => {
      const prov = k.provenance as Record<string, any> | null;
      return prov && prov.clientSyncId === d.clientSyncId;
    });

    if (existing) {
      return {
        id: existing.id,
        kodeUnik: existing.kodeUnik,
        level: existing.levelPrioritas,
        skor: existing.skorKerentanan,
      };
    }
  }

  const provenanceWithSync = {
    ...(d.provenance || {}),
    ...(d.clientSyncId ? { clientSyncId: d.clientSyncId } : {}),
  };

  const kasus = await prisma.kasus.create({
    data: {
      kodeUnik: generateKodeUnik(),
      sumberInput: "RELAWAN",
      namaKK: d.namaKK,
      usiaKK: d.usiaKK,
      anggotaKeluarga: d.anggotaKeluarga,
      kondisiMedisKritis: d.kondisiMedisKritis,
      obatTersedia: d.obatTersedia,
      mobilitas: d.mobilitas,
      asalLokasi: d.asalLokasi,
      agentThought: d.agentThought,
      skorKerentanan: skor.skor,
      levelPrioritas: skor.level,
      instansiRujukan: d.instansiRujukan,
      statusVerifikasiMedis: false,
      status: "terverifikasi", // sudah dikonfirmasi relawan (Lapis 1)
      provenance: Object.keys(provenanceWithSync).length > 0 ? provenanceWithSync : undefined,
      createdById: userId,
    },
  });

  await catatAudit({
    aksi: "KONFIRMASI_INTAKE",
    aktor: username,
    kasusId: kasus.id,
    detail: { skor: skor.skor, level: skor.level, rincian: skor.rincian },
  });

  return {
    id: kasus.id,
    kodeUnik: kasus.kodeUnik,
    level: skor.level,
    skor: skor.skor,
  };
}
