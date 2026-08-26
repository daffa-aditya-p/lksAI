import { describe, it, expect } from "vitest";
import { geminiExtractionSchema, geminiMultiExtractionSchema, toProfil, toMultiProfil } from "@/lib/types";
import { konfirmasiSchema } from "@/lib/kasusSchema";

describe("Validasi Schema Zod & Konversi Tipe Data", () => {
  it("harus memvalidasi output ekstraksi LLM single item", () => {
    const rawExtraction = {
      agent_thought: "Penilaian awal: Lansia hipertensi",
      nama_kk: "Pak Budi",
      usia_kk: 62,
      anggota_keluarga: [{ hubungan: "istri", usia: 58, kondisi_khusus: null }],
      kondisi_medis_kritis: ["hipertensi"],
      obat_tersedia: true,
      mobilitas: "mandiri",
      asal_lokasi: "Dusun II Sukamaju",
      instansi_rujukan_sementara: "DINAS_KESEHATAN",
    };

    const parsed = geminiExtractionSchema.safeParse(rawExtraction);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const profil = toProfil(parsed.data, "test-runner");
      expect(profil.namaKK).toBe("Pak Budi");
      expect(profil.usiaKK).toBe(62);
      expect(profil.instansiRujukan).toBe("DINAS_KESEHATAN");
      expect(profil.provenance).toBeDefined();
    }
  });

  it("harus memvalidasi output ekstraksi LLM multi-keluarga (array)", () => {
    const rawMulti = [
      {
        agent_thought: "Keluarga 1",
        nama_kk: "Keluarga Agus",
        usia_kk: 35,
        anggota_keluarga: [],
        kondisi_medis_kritis: [],
        obat_tersedia: null,
        mobilitas: "mandiri",
        asal_lokasi: "RT 01",
        instansi_rujukan_sementara: "DINAS_SOSIAL",
      },
      {
        agent_thought: "Keluarga 2",
        nama_kk: "Keluarga Bambang",
        usia_kk: 70,
        anggota_keluarga: [],
        kondisi_medis_kritis: ["diabetes"],
        obat_tersedia: false,
        mobilitas: "tidak_bisa",
        asal_lokasi: "RT 02",
        instansi_rujukan_sementara: "DINAS_KESEHATAN",
      },
    ];

    const parsed = geminiMultiExtractionSchema.safeParse(rawMulti);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      const list = toMultiProfil(parsed.data);
      expect(list).toHaveLength(2);
      expect(list[0].namaKK).toBe("Keluarga Agus");
      expect(list[1].namaKK).toBe("Keluarga Bambang");
      expect(list[1].mobilitas).toBe("tidak_bisa");
    }
  });

  it("harus memvalidasi skema konfirmasi intake (konfirmasiSchema)", () => {
    const validKonfirmasi = {
      agentThought: "Hasil verifikasi relawan",
      namaKK: "Siti Rahayu",
      usiaKK: 29,
      anggotaKeluarga: [{ hubungan: "anak", usia: 1, kondisiKhusus: null }],
      kondisiMedisKritis: [],
      obatTersedia: true,
      mobilitas: "mandiri" as const,
      asalLokasi: "Desa Wanasari",
      instansiRujukan: "DINAS_SOSIAL" as const,
      clientSyncId: "uuid-12345",
    };

    const parsed = konfirmasiSchema.safeParse(validKonfirmasi);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.clientSyncId).toBe("uuid-12345");
      expect(parsed.data.namaKK).toBe("Siti Rahayu");
    }
  });
});
