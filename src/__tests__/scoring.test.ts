import { describe, it, expect } from "vitest";
import { hitungSkor, tentukanLevel, BOBOT } from "@/lib/scoring";
import type { ProfilKerentanan } from "@/lib/types";

describe("Rule Engine Skoring Kerentanan (Deterministic)", () => {
  it("harus memberikan skor 0 dan level HIJAU untuk orang dewasa muda mandiri tanpa penyakit", () => {
    const profil: ProfilKerentanan = {
      namaKK: "Budi Santoso",
      usiaKK: 30,
      anggotaKeluarga: [{ hubungan: "istri", usia: 28, kondisiKhusus: null }],
      kondisiMedisKritis: [],
      obatTersedia: null,
      mobilitas: "mandiri",
      asalLokasi: "Desa Sukamaju",
      instansiRujukan: "DINAS_SOSIAL",
    };

    const hasil = hitungSkor(profil);
    expect(hasil.skor).toBe(0);
    expect(hasil.level).toBe("HIJAU");
    expect(hasil.perluVerifikasiMedis).toBe(false);
    expect(hasil.rincian).toHaveLength(0);
  });

  it("harus menambahkan bobot lansia (+2) jika usia >= 60 tahun", () => {
    const profilLansia: ProfilKerentanan = {
      namaKK: "Mbah Joko",
      usiaKK: 65,
      anggotaKeluarga: [],
      kondisiMedisKritis: [],
      obatTersedia: null,
      mobilitas: "mandiri",
      asalLokasi: "Dusun Krajan",
      instansiRujukan: "DINAS_SOSIAL",
    };

    const hasil = hitungSkor(profilLansia);
    expect(hasil.skor).toBe(BOBOT.lansia);
    expect(hasil.level).toBe("HIJAU");
    expect(hasil.rincian).toContainEqual(
      expect.objectContaining({ poin: 2, label: expect.stringContaining("lansia") })
    );
  });

  it("harus menambahkan bobot balita (+3) jika ada anggota keluarga < 1 tahun", () => {
    const profilBalita: ProfilKerentanan = {
      namaKK: "Siti Rahma",
      usiaKK: 25,
      anggotaKeluarga: [
        { hubungan: "anak", usia: 0, kondisiKhusus: "bayi 6 bulan" },
      ],
      kondisiMedisKritis: [],
      obatTersedia: null,
      mobilitas: "mandiri",
      asalLokasi: "Kampung Melayu",
      instansiRujukan: "DINAS_SOSIAL",
    };

    const hasil = hitungSkor(profilBalita);
    expect(hasil.skor).toBe(BOBOT.balitaBawah1);
    expect(hasil.level).toBe("HIJAU");
  });

  it("harus menambahkan bobot kondisi medis kritis (+3 per kondisi) dan obat tidak tersedia (+4)", () => {
    const profilMedis: ProfilKerentanan = {
      namaKK: "Ahmad",
      usiaKK: 45,
      anggotaKeluarga: [],
      kondisiMedisKritis: ["hipertensi", "diabetes"],
      obatTersedia: false,
      mobilitas: "mandiri",
      asalLokasi: "Cibadak",
      instansiRujukan: "DINAS_KESEHATAN",
    };

    // 2 kondisi medis (6) + obat habis (4) = 10 poin -> MERAH
    const hasil = hitungSkor(profilMedis);
    expect(hasil.skor).toBe(2 * BOBOT.perKondisiMedis + BOBOT.obatTidakTersedia);
    expect(hasil.skor).toBe(10);
    expect(hasil.level).toBe("MERAH");
    expect(hasil.perluVerifikasiMedis).toBe(true);
  });

  it("harus menambahkan bobot mobilitas tidak bisa (+2)", () => {
    const profilMobilitas: ProfilKerentanan = {
      namaKK: "Pak Hendra",
      usiaKK: 50,
      anggotaKeluarga: [],
      kondisiMedisKritis: [],
      obatTersedia: true,
      mobilitas: "tidak_bisa",
      asalLokasi: "Desa Sumber Makmur",
      instansiRujukan: "DINAS_SOSIAL",
    };

    const hasil = hitungSkor(profilMobilitas);
    expect(hasil.skor).toBe(BOBOT.mobilitasTidakBisa);
    expect(hasil.level).toBe("HIJAU");
  });

  it("harus menentukan batas level triase dengan tepat: 0-4 HIJAU, 5-8 KUNING, >=9 MERAH", () => {
    expect(tentukanLevel(0)).toBe("HIJAU");
    expect(tentukanLevel(4)).toBe("HIJAU");
    expect(tentukanLevel(5)).toBe("KUNING");
    expect(tentukanLevel(8)).toBe("KUNING");
    expect(tentukanLevel(9)).toBe("MERAH");
    expect(tentukanLevel(15)).toBe("MERAH");
  });

  it("harus menangani data null/undefined tanpa melempar exception", () => {
    const profilKosong: ProfilKerentanan = {
      namaKK: null,
      usiaKK: null,
      anggotaKeluarga: [],
      kondisiMedisKritis: [],
      obatTersedia: null,
      mobilitas: null,
      asalLokasi: null,
      instansiRujukan: "DINAS_SOSIAL",
    };

    const hasil = hitungSkor(profilKosong);
    expect(hasil.skor).toBe(0);
    expect(hasil.level).toBe("HIJAU");
  });
});
