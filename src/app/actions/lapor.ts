"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hitungSkor } from "@/lib/scoring";
import { generateQrPayload } from "@/lib/qr";
import { catatAudit } from "@/lib/audit";
import type { ProfilKerentanan, LevelPrioritas, AnggotaKeluarga } from "@/lib/types";

export interface LaporanInput {
  nama: string;
  email?: string;
  telepon: string;
  kejadian: string;
  kategori: string;
  kebutuhan: string[];
  lokasiAlamat: string;
  lat?: number;
  lng?: number;
  catatan?: string;
  fotoUrl?: string;
  levelPrioritas?: LevelPrioritas;
  skorKerentanan?: number;
  agentThought?: string;
  anggotaKeluarga?: AnggotaKeluarga[];
  kondisiMedisKritis?: string[];
  mobilitas?: "mandiri" | "bantuan" | "tidak_bisa" | null;
  usiaKK?: number | null;
}

export async function submitLaporanDarurat(data: LaporanInput) {
  const session = await auth();

  // Buat kode unik format SATU-xxxxx
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const kodeUnik = `SATU-${randomSuffix}`;

  // Susun profil kerentanan untuk rule engine
  const kondisiMedis = (data.kondisiMedisKritis && data.kondisiMedisKritis.length > 0)
    ? data.kondisiMedisKritis
    : data.kebutuhan.filter((k) =>
        k.toLowerCase().includes("obat") || k.toLowerCase().includes("medis")
      );
  const obatTersedia = !data.kebutuhan.some((k) => k.toLowerCase().includes("obat"));

  const profil: ProfilKerentanan = {
    namaKK: data.nama,
    usiaKK: data.usiaKK ?? null,
    anggotaKeluarga: data.anggotaKeluarga ?? [],
    kondisiMedisKritis: kondisiMedis,
    obatTersedia,
    mobilitas: data.mobilitas ?? null,
    asalLokasi: data.lokasiAlamat,
    instansiRujukan: kondisiMedis.length > 0 ? "DINAS_KESEHATAN" : "BPBD",
  };

  const hasilSkor = hitungSkor(profil);
  const finalLevel = data.levelPrioritas || hasilSkor.level;
  const finalSkor = typeof data.skorKerentanan === "number" ? data.skorKerentanan : hasilSkor.skor;

  const thoughtSummary = data.agentThought
    ? `[AI Asesmen] ${data.agentThought} | [Kategori: ${data.kategori}] ${data.kejadian}`
    : `[Kategori: ${data.kategori}] ${data.kejadian}${data.catatan ? " | Catatan: " + data.catatan : ""} | Kontak: ${data.telepon} (${data.email || "-"})`;

  // Simpan ke database Prisma
  const kasus = await prisma.kasus.create({
    data: {
      kodeUnik,
      sumberInput: "USER",
      namaKK: data.nama,
      asalLokasi: data.lokasiAlamat,
      geoLat: data.lat || -6.2242,
      geoLng: data.lng || 106.8662,
      kondisiMedisKritis: kondisiMedis.length > 0 ? kondisiMedis : data.kebutuhan,
      obatTersedia,
      agentThought: thoughtSummary,
      skorKerentanan: finalSkor,
      levelPrioritas: finalLevel,
      status: "pending",
      statusVerifikasiMedis: hasilSkor.perluVerifikasiMedis,
      createdById: session?.user?.id || null,
      fotoUrl: data.fotoUrl || null,
    },
  });

  const qrPayload = generateQrPayload(kasus.id);

  await catatAudit({
    aksi: "LAPORAN_MANDIRI_USER",
    aktor: session?.user?.username || data.nama,
    kasusId: kasus.id,
    detail: {
      kodeUnik,
      kategori: data.kategori,
      kebutuhan: data.kebutuhan,
      level: finalLevel,
      skor: finalSkor,
    },
  });

  return {
    success: true,
    kasusId: kasus.id,
    kodeUnik: `#${kodeUnik}`,
    qrPayload,
    level: finalLevel,
    skor: finalSkor,
  };
}
