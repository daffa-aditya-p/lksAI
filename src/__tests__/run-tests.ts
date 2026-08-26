import { hitungSkor, tentukanLevel, BOBOT } from "../lib/scoring";
import { generateQrPayload, verifyQrPayload, type QRPayload } from "../lib/qr";
import { normalisasiKondisi, fuzzyMatchKondisi } from "../lib/synonyms";
import { geminiExtractionSchema, geminiMultiExtractionSchema, toProfil, toMultiProfil } from "../lib/types";
import { konfirmasiSchema } from "../lib/kasusSchema";
import syntheticProfiles from "../data/synthetic_profiles.json";
import type { ProfilKerentanan } from "../lib/types";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  \x1b[32m✔\x1b[0m ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  \x1b[31m✖\x1b[0m ${name}`);
    console.error(`    \x1b[31m${err.message || err}\x1b[0m`);
    failed++;
  }
}

function assert(condition: boolean, msg?: string) {
  if (!condition) throw new Error(msg || "Assertion failed");
}

function assertEqual<T>(actual: T, expected: T, msg?: string) {
  if (actual !== expected) {
    throw new Error(msg || `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }
}

console.log("\n=======================================================");
console.log("  SIGAP AI — Automated Quality & Verification Suite");
console.log("=======================================================\n");

// ─── 1. SCORING ENGINE TESTS ────────────────────────────────
console.log("\x1b[36m[1] Deterministic Vulnerability Scoring Engine\x1b[0m");

test("Dewasa muda mandiri tanpa keluhan -> Skor 0 (HIJAU)", () => {
  const p: ProfilKerentanan = {
    namaKK: "Budi",
    usiaKK: 28,
    anggotaKeluarga: [],
    kondisiMedisKritis: [],
    obatTersedia: null,
    mobilitas: "mandiri",
    asalLokasi: "Desa Sukamaju",
    instansiRujukan: "DINAS_SOSIAL",
  };
  const res = hitungSkor(p);
  assertEqual(res.skor, 0);
  assertEqual(res.level, "HIJAU");
  assertEqual(res.perluVerifikasiMedis, false);
});

test("KK Lansia >= 60 tahun -> Tambah +2 poin", () => {
  const p: ProfilKerentanan = {
    namaKK: "Mbah Joko",
    usiaKK: 65,
    anggotaKeluarga: [],
    kondisiMedisKritis: [],
    obatTersedia: null,
    mobilitas: "mandiri",
    asalLokasi: "Dusun Krajan",
    instansiRujukan: "DINAS_SOSIAL",
  };
  const res = hitungSkor(p);
  assertEqual(res.skor, BOBOT.lansia);
  assertEqual(res.level, "HIJAU");
});

test("Ada balita < 1 tahun -> Tambah +3 poin", () => {
  const p: ProfilKerentanan = {
    namaKK: "Siti",
    usiaKK: 25,
    anggotaKeluarga: [{ hubungan: "anak", usia: 0, kondisiKhusus: "bayi" }],
    kondisiMedisKritis: [],
    obatTersedia: null,
    mobilitas: "mandiri",
    asalLokasi: "Kampung Melayu",
    instansiRujukan: "DINAS_SOSIAL",
  };
  const res = hitungSkor(p);
  assertEqual(res.skor, BOBOT.balitaBawah1);
});

test("2 Kondisi kritis (+6) + Obat habis (+4) -> Skor 10 (MERAH + Verifikasi Medis)", () => {
  const p: ProfilKerentanan = {
    namaKK: "Ahmad",
    usiaKK: 45,
    anggotaKeluarga: [],
    kondisiMedisKritis: ["hipertensi", "diabetes"],
    obatTersedia: false,
    mobilitas: "mandiri",
    asalLokasi: "Cibadak",
    instansiRujukan: "DINAS_KESEHATAN",
  };
  const res = hitungSkor(p);
  assertEqual(res.skor, 10);
  assertEqual(res.level, "MERAH");
  assertEqual(res.perluVerifikasiMedis, true);
});

test("Level cutoff: 0-4 HIJAU, 5-8 KUNING, >=9 MERAH", () => {
  assertEqual(tentukanLevel(0), "HIJAU");
  assertEqual(tentukanLevel(4), "HIJAU");
  assertEqual(tentukanLevel(5), "KUNING");
  assertEqual(tentukanLevel(8), "KUNING");
  assertEqual(tentukanLevel(9), "MERAH");
  assertEqual(tentukanLevel(12), "MERAH");
});

// ─── 2. QR SECURITY & HMAC-SHA256 TESTS ─────────────────────
console.log("\n\x1b[36m[2] QR Code Security, Timing-Safe HMAC & Expiry\x1b[0m");

test("Generate & verifikasi valid QR Payload", () => {
  const id = "kasus-auth-100";
  const payloadStr = generateQrPayload(id);
  const verif = verifyQrPayload(payloadStr);
  assertEqual(verif.valid, true);
  assertEqual(verif.id, id);
});

test("Deteksi manipulasi data / signature forgery", () => {
  const payloadStr = generateQrPayload("kasus-asli");
  const payload = JSON.parse(payloadStr) as QRPayload;
  payload.id = "kasus-tampered";
  const verif = verifyQrPayload(JSON.stringify(payload));
  assertEqual(verif.valid, false);
  assert(verif.error?.includes("Tanda tangan") === true);
});

test("Tolak QR Code kedaluwarsa (> 24 jam)", () => {
  const payloadStr = generateQrPayload("kasus-expired");
  const payload = JSON.parse(payloadStr) as QRPayload;
  payload.ts = Date.now() - 25 * 60 * 60 * 1000;
  const verif = verifyQrPayload(JSON.stringify(payload));
  assertEqual(verif.valid, false);
  assert(verif.error?.includes("kedaluwarsa") === true);
});

// ─── 3. MEDICAL SYNONYM & DIALECT TESTS ─────────────────────
console.log("\n\x1b[36m[3] Indonesian Medical Slang & Regional Dialects\x1b[0m");

test("Normalisasi istilah awam (gula, tensi, bengek, ayan)", () => {
  assertEqual(normalisasiKondisi("gula"), "diabetes");
  assertEqual(normalisasiKondisi("tensi"), "hipertensi");
  assertEqual(normalisasiKondisi("bengek"), "asma");
  assertEqual(normalisasiKondisi("ayan"), "epilepsi");
});

test("Normalisasi dialek daerah (Sunda, Minang)", () => {
  assertEqual(normalisasiKondisi("eungap"), "gangguan pernapasan");
  assertEqual(normalisasiKondisi("sakik kapalo"), "migrain");
  assertEqual(normalisasiKondisi("sakik paruik"), "gangguan pencernaan");
});

test("Fuzzy matching typo toleran (Levenshtein <= 2)", () => {
  assertEqual(fuzzyMatchKondisi("diabetis"), "diabetes");
  assertEqual(fuzzyMatchKondisi("hipertnsi"), "hipertensi");
});

// ─── 4. SCHEMA VALIDATION TESTS ─────────────────────────────
console.log("\n\x1b[36m[4] Zod Schema Validation & Extraction Types\x1b[0m");

test("Validasi single extraction schema & toProfil() conversion", () => {
  const raw = {
    agent_thought: "Analisis medis",
    nama_kk: "Pak Budi",
    usia_kk: 62,
    anggota_keluarga: [],
    kondisi_medis_kritis: ["hipertensi"],
    obat_tersedia: true,
    mobilitas: "mandiri",
    asal_lokasi: "Sukamaju",
    instansi_rujukan_sementara: "DINAS_KESEHATAN",
  };
  const parsed = geminiExtractionSchema.safeParse(raw);
  assert(parsed.success);
  if (parsed.success) {
    const prof = toProfil(parsed.data);
    assertEqual(prof.namaKK, "Pak Budi");
    assertEqual(prof.usiaKK, 62);
  }
});

test("Validasi multi-keluarga batch extraction schema", () => {
  const raw = [
    {
      agent_thought: "Keluarga 1",
      nama_kk: "Keluarga A",
      usia_kk: 40,
      anggota_keluarga: [],
      kondisi_medis_kritis: [],
      obat_tersedia: null,
      mobilitas: "mandiri",
      asal_lokasi: "RT 01",
      instansi_rujukan_sementara: "DINAS_SOSIAL",
    },
    {
      agent_thought: "Keluarga 2",
      nama_kk: "Keluarga B",
      usia_kk: 75,
      anggota_keluarga: [],
      kondisi_medis_kritis: ["stroke"],
      obat_tersedia: false,
      mobilitas: "tidak_bisa",
      asal_lokasi: "RT 02",
      instansi_rujukan_sementara: "DINAS_KESEHATAN",
    },
  ];
  const parsed = geminiMultiExtractionSchema.safeParse(raw);
  assert(parsed.success);
  if (parsed.success) {
    const list = toMultiProfil(parsed.data);
    assertEqual(list.length, 2);
    assertEqual(list[1].mobilitas, "tidak_bisa");
  }
});

test("Validasi konfirmasiSchema dengan clientSyncId untuk idempotensi", () => {
  const payload = {
    agentThought: "Verified",
    namaKK: "Ibu Siti",
    usiaKK: 32,
    anggotaKeluarga: [],
    kondisiMedisKritis: [],
    obatTersedia: true,
    mobilitas: "mandiri",
    asalLokasi: "Cibadak",
    instansiRujukan: "DINAS_SOSIAL",
    clientSyncId: "offline-uuid-9999",
  };
  const parsed = konfirmasiSchema.safeParse(payload);
  assert(parsed.success);
  if (parsed.success) {
    assertEqual(parsed.data.clientSyncId, "offline-uuid-9999");
  }
});

// ─── 5. 200 SYNTHETIC PROFILES BENCHMARK ────────────────────
console.log("\n\x1b[36m[5] 200 Indonesian Disaster Refugee Synthetic Profiles Benchmark\x1b[0m");

test("Memuat tepat 200 profil sintetis", () => {
  assertEqual(syntheticProfiles.length, 200);
});

test("Evaluasi 200 profil: 100% konsisten terhadap rule engine", () => {
  let matched = 0;
  for (const item of syntheticProfiles) {
    const res = hitungSkor(item.profil as ProfilKerentanan);
    assertEqual(res.skor, item.expectedSkor, `Mismatch score on ${item.id}`);
    assertEqual(res.level, item.expectedLevel, `Mismatch level on ${item.id}`);
    matched++;
  }
  assertEqual(matched, 200);
});

test("Distribusi kerentanan realistis (HIJAU, KUNING, MERAH)", () => {
  const hijau = syntheticProfiles.filter((p) => p.expectedLevel === "HIJAU").length;
  const kuning = syntheticProfiles.filter((p) => p.expectedLevel === "KUNING").length;
  const merah = syntheticProfiles.filter((p) => p.expectedLevel === "MERAH").length;

  console.log(`    Distribusi: HIJAU: ${hijau} (50%), KUNING: ${kuning} (40%), MERAH: ${merah} (10%)`);
  assert(hijau >= 80, "HIJAU harus >= 80");
  assert(kuning >= 60, "KUNING harus >= 60");
  assert(merah >= 15, "MERAH harus >= 15");
});

test("Seluruh kasus MERAH wajib ditandai perluVerifikasiMedis", () => {
  const merahCases = syntheticProfiles.filter((p) => p.expectedLevel === "MERAH");
  for (const item of merahCases) {
    const res = hitungSkor(item.profil as ProfilKerentanan);
    assertEqual(res.perluVerifikasiMedis, true, `Kasus MERAH ${item.id} harus perlu verifikasi medis`);
  }
});

// ─── SUMMARY ────────────────────────────────────────────────
console.log("\n=======================================================");
console.log(`  Test Results: \x1b[32m${passed} Passed\x1b[0m | \x1b[31m${failed} Failed\x1b[0m | Total: ${passed + failed}`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
