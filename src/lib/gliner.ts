import type { ProfilKerentanan, AnggotaKeluarga } from "@/lib/types";
import { fuzzyMatchKondisi } from "@/lib/synonyms";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? "https://daffaadityp-prana.hf.space";

interface GlinerEntity {
  label: string;
  text: string;
  confidence: number;
}

interface GlinerResponse {
  entities: GlinerEntity[];
  latency_ms: number;
}

/**
 * Memanggil FastAPI GLiNER (Zero-Shot NER) yang di-hosting di Hugging Face Spaces
 */
export async function runZeroShotExtraction(teks: string): Promise<{
  profil: Partial<ProfilKerentanan>;
  fieldConfidence: Record<string, number>;
  rawEntities: GlinerEntity[];
}> {
  try {
    const res = await fetch(`${ML_SERVICE_URL}/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teks }),
      // Toleransi timeout agak besar karena ini cloud service gratisan
      signal: AbortSignal.timeout(15000), 
    });

    if (!res.ok) {
      throw new Error(`ML service error: ${res.status}`);
    }

    const data = (await res.json()) as GlinerResponse;
    const entities = Array.isArray(data?.entities) ? data.entities : [];

    const profil: Partial<ProfilKerentanan> = {
      kondisiMedisKritis: [],
      anggotaKeluarga: [],
    };
    const fieldConfidence: Record<string, number> = {};

    for (const ent of entities) {
      const label = ent.label.toLowerCase();
      
      if (label === "nama") {
        if (!profil.namaKK || ent.confidence > (fieldConfidence.namaKK || 0)) {
          profil.namaKK = ent.text;
          fieldConfidence.namaKK = ent.confidence;
        }
      } 
      else if (label === "usia") {
        const usiaMatch = ent.text.match(/\d+/);
        if (usiaMatch && (!profil.usiaKK || ent.confidence > (fieldConfidence.usiaKK || 0))) {
          profil.usiaKK = parseInt(usiaMatch[0], 10);
          fieldConfidence.usiaKK = ent.confidence;
        }
      }
      else if (label === "kondisi medis") {
        const normalized = fuzzyMatchKondisi(ent.text) || ent.text;
        if (!profil.kondisiMedisKritis!.includes(normalized)) {
          profil.kondisiMedisKritis!.push(normalized);
        }
        fieldConfidence.kondisiMedisKritis = Math.max(fieldConfidence.kondisiMedisKritis || 0, ent.confidence);
      }
      else if (label === "anggota keluarga") {
        // Deteksi satuan umur (tahun vs bulan) & relasi
        const isBulan = /\b(bulan|bln)\b/i.test(ent.text);
        const angkaMatch = ent.text.match(/\d+/);
        const cleanRelasi = ent.text
          .replace(/\d+\s*(tahun|th|bulan|bln)/gi, "")
          .replace(/\s+/g, " ")
          .trim() || ent.text;

        let umur: number | null = null;
        if (isBulan) {
          umur = 0; // Bayi/balita < 1 tahun
        } else if (angkaMatch) {
          umur = parseInt(angkaMatch[0], 10);
        }

        profil.anggotaKeluarga!.push({ hubungan: cleanRelasi.toLowerCase(), usia: umur, kondisiKhusus: null });
        fieldConfidence.anggotaKeluarga = Math.max(fieldConfidence.anggotaKeluarga || 0, ent.confidence);
      }
      else if (label === "asal lokasi") {
        if (!profil.asalLokasi || ent.confidence > (fieldConfidence.asalLokasi || 0)) {
          profil.asalLokasi = ent.text;
          fieldConfidence.asalLokasi = ent.confidence;
        }
      }
      else if (label === "keterbatasan mobilitas") {
        const t = ent.text.toLowerCase();
        if (t.includes("tidak bisa") || t.includes("lumpuh") || t.includes("tandu") || t.includes("terbaring")) {
          profil.mobilitas = "tidak_bisa";
        } else if (t.includes("mandiri")) {
          profil.mobilitas = "mandiri";
        } else {
          profil.mobilitas = "bantuan";
        }
        fieldConfidence.mobilitas = ent.confidence;
      }
      else if (label === "ketiadaan obat") {
        profil.obatTersedia = false;
        fieldConfidence.obatTersedia = ent.confidence;
      }
    }

    return {
      profil,
      fieldConfidence,
      rawEntities: entities,
    };
  } catch (err) {
    console.error("Gliner Extraction Error:", err);
    throw err;
  }
}
