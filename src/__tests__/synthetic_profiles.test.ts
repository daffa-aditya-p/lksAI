import { describe, it, expect } from "vitest";
import syntheticProfiles from "@/data/synthetic_profiles.json";
import { hitungSkor } from "@/lib/scoring";
import type { ProfilKerentanan } from "@/lib/types";

describe("Benchmark & Validasi 200 Profil Sintetis Kebencanaan", () => {
  it("harus memuat tepat 200 profil sintetis yang lengkap", () => {
    expect(syntheticProfiles).toHaveLength(200);
  });

  it("seluruh 200 profil harus dapat dievaluasi oleh Rule Engine tanpa error", () => {
    for (const item of syntheticProfiles) {
      const profil = item.profil as ProfilKerentanan;
      const hasil = hitungSkor(profil);

      expect(hasil).toBeDefined();
      expect(hasil.skor).toBeTypeOf("number");
      expect(["HIJAU", "KUNING", "MERAH"]).toContain(hasil.level);
      expect(hasil.skor).toBe(item.expectedSkor);
      expect(hasil.level).toBe(item.expectedLevel);
    }
  });

  it("harus memiliki representasi dialek daerah yang beragam di Indonesia", () => {
    const dialekSet = new Set(syntheticProfiles.map((p) => p.dialek));
    expect(dialekSet.has("Standar")).toBe(true);
    expect(dialekSet.has("Jawa")).toBe(true);
    expect(dialekSet.has("Sunda")).toBe(true);
    expect(dialekSet.has("Minang")).toBe(true);
    expect(dialekSet.has("Batak")).toBe(true);
    expect(dialekSet.has("Betawi")).toBe(true);
    expect(dialekSet.has("Melayu")).toBe(true);
    expect(dialekSet.has("Indonesia Timur")).toBe(true);
  });

  it("harus memastikan setiap kasus MERAH memiliki tanda perlu verifikasi medis", () => {
    const kasusMerah = syntheticProfiles.filter((p) => p.expectedLevel === "MERAH");
    expect(kasusMerah.length).toBeGreaterThanOrEqual(15);

    for (const item of kasusMerah) {
      const hasil = hitungSkor(item.profil as ProfilKerentanan);
      expect(hasil.level).toBe("MERAH");
      expect(hasil.perluVerifikasiMedis).toBe(true);
    }
  });
});
