import { describe, it, expect } from "vitest";
import { normalisasiKondisi, fuzzyMatchKondisi, SINONIM_MEDIS } from "@/lib/synonyms";

describe("Normalisasi Sinonim & Dialek Medis Kebencanaan", () => {
  it("harus menormalkan istilah awam ke istilah medis baku", () => {
    expect(normalisasiKondisi("gula")).toBe("diabetes");
    expect(normalisasiKondisi("kencing manis")).toBe("diabetes");
    expect(normalisasiKondisi("darah tinggi")).toBe("hipertensi");
    expect(normalisasiKondisi("tensi")).toBe("hipertensi");
    expect(normalisasiKondisi("bengek")).toBe("asma");
    expect(normalisasiKondisi("ayan")).toBe("epilepsi");
  });

  it("harus mengenali istilah dialek daerah (Jawa, Sunda, Minang)", () => {
    // Jawa
    expect(normalisasiKondisi("sesak napas")).toBe("gangguan pernapasan");
    // Sunda
    expect(normalisasiKondisi("eungap")).toBe("gangguan pernapasan");
    expect(normalisasiKondisi("paranas tiris")).toBe("demam menggigil");
    // Minang
    expect(normalisasiKondisi("sakik kapalo")).toBe("migrain");
    expect(normalisasiKondisi("sakik paruik")).toBe("gangguan pencernaan");
  });

  it("harus melakukan fuzzy matching saat ada typo penulisan (Levenshtein <= 2)", () => {
    expect(fuzzyMatchKondisi("diabetis")).toBe("diabetes");
    expect(fuzzyMatchKondisi("hipertnsi")).toBe("hipertensi");
    expect(fuzzyMatchKondisi("epilepzi")).toBe("epilepsi");
  });

  it("harus mengembalikan null untuk kata yang sama sekali tidak berhubungan dengan medis", () => {
    expect(fuzzyMatchKondisi("komputer")).toBeNull();
    expect(fuzzyMatchKondisi("sepatu")).toBeNull();
  });
});
