import { GoogleGenAI, Type } from "@google/genai";
import { env } from "@/env";
import { sinonimUntukPrompt } from "@/lib/synonyms";
import {
  geminiExtractionSchema,
  geminiMultiExtractionSchema,
  toProfil,
  toMultiProfil,
  type ProfilKerentanan,
} from "@/lib/types";

/**
 * Klien Gemini & Groq — HANYA dipanggil dari server (Route Handler / Server Action).
 * API key tidak pernah dikirim ke client.
 *
 * Provider Priority Chain:
 *   1. qwen/qwen3.6-27b via Groq API (Prioritas utama: generasi token super cepat)
 *   2. gemini-3.6-flash (Google - Fallback pertama)
 *   3. gemini-3.5-flash-lite (Google - Fallback kedua)
 */
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const GROQ_MODEL = "qwen/qwen3.6-27b";
const MODEL_UTAMA = "gemini-3.6-flash";
const MODEL_FALLBACK = "gemini-3.5-flash-lite";

/**
 * System instruction: peran AI HANYA reasoning + ekstraksi. AI TIDAK
 * menghitung skor (itu tugas rule engine). Wajib kembalikan JSON murni.
 */
function buildSystemInstruction(): string {
  return [
    "Kamu adalah asisten intake relawan PMI di meja registrasi posko pengungsian bencana di Indonesia.",
    "TUGAS: membaca teks bebas relawan (bahasa Indonesia informal/dialek) dan mengekstraknya menjadi data terstruktur untuk asesmen kerentanan keluarga pengungsi.",
    "",
    "ATURAN WAJIB:",
    "- Jika sebuah informasi TIDAK disebutkan, isi null. JANGAN berasumsi atau mengarang.",
    "- Pertahankan nama asli apa adanya.",
    "- usia_kk: angka tahun WAJIB DIISI jika disebutkan di teks. Bayi < 1 tahun tulis 0.",
    "- kondisi_medis_kritis: array string. ISI SEMUA kondisi medis yang EKSPLISIT disebutkan (termasuk kondisi anggota keluarga).",
    "- obat_tersedia: true / false / null. Isi false jika disebutkan 'tidak bawa obat', 'tanpa obat', 'tidak ada obat', dll.",
    "- mobilitas: 'mandiri' | 'bantuan' | 'tidak_bisa' | null. Isi 'tidak_bisa' jika disebutkan 'lumpuh', 'butuh tandu', dsb.",
    "- instansi_rujukan_sementara: tebakan awal instansi yang paling relevan.",
    "    DINAS_KESEHATAN bila ada kondisi medis/obat/ibu hamil/lansia sakit;",
    "    DINAS_SOSIAL bila isu utama tempat tinggal/logistik/anak terpisah/lansia sendiri;",
    "    BPBD bila isu utama evakuasi/lokasi bencana/kerusakan rumah.",
    "    (Ini hanya sementara — keputusan final tetap di tangan manusia.)",
    "- agent_thought: 1-2 kalimat penalaranmu atas kasus ini (untuk audit), bahasa Indonesia.",
    "- anggota_keluarga: array objek {hubungan, usia, kondisi_khusus}. ISI untuk setiap anggota keluarga selain KK.",
    "",
    "PETAKAN istilah awam/dialek ke istilah medis baku berikut saat mengekstrak kondisi_medis_kritis:",
    sinonimUntukPrompt(),
  ].join("\n");
}


function buildMultiSystemInstruction(): string {
  return [
    "Kamu adalah asisten intake relawan PMI di meja registrasi posko pengungsian bencana di Indonesia.",
    "TUGAS KHUSUS MULTI-KELUARGA (BATCH): Membaca narasi/catatan relawan atau ketua RT yang memuat informasi BEBERAPA KELUARGA pengungsi sekaligus (rombongan evakuasi/batch).",
    "",
    "ATURAN WAJIB:",
    "- Pisahkan SETIAP kepala keluarga menjadi SATU ELEMEN terpisah dalam output array.",
    "- Harus ada MINIMAL sebanyak keluarga/individu yang disebutkan dalam teks. Jika ada 3 orang/keluarga disebutkan, WAJIB ada 3 elemen.",
    "- Analisis relasi & coreference dengan teliti: pastikan penyakit/kondisi anggota keluarga dikaitkan ke kepala keluarga yang tepat.",
    "- Jika ada individu lansia tinggal sendiri atau sebatang kara, jadikan dia sebagai Kepala Keluarga tersendiri.",
    "- Jika sebuah informasi TIDAK disebutkan untuk keluarga terkait, isi null. JANGAN berasumsi atau mengarang.",
    "- Pertahankan nama asli apa adanya.",
    "- usia_kk: angka tahun WAJIB DIISI jika disebutkan di teks. Misal '54 tahun' → 54. Bayi < 1 tahun tulis 0.",
    "- kondisi_medis_kritis: array string. WAJIB ISI semua kondisi medis yang EKSPLISIT disebutkan (termasuk kondisi anggota keluarga yang terdampak).",
    "- obat_tersedia: true / false / null. Isi false jika teks menyebut 'tidak bawa obat', 'tanpa obat', dll.",
    "- mobilitas: 'mandiri' | 'bantuan' | 'tidak_bisa' | null. Isi 'tidak_bisa' jika disebutkan 'lumpuh', 'butuh tandu', dsb.",
    "- instansi_rujukan_sementara: DINAS_KESEHATAN (ada isu medis/obat/ibu hamil/lansia sakit), DINAS_SOSIAL (isu logistik/anak terpisah/lansia sebatang kara), atau BPBD (evakuasi/kerusakan rumah).",
    "- agent_thought: 1 kalimat penalaran singkat mengapa keluarga ini dikelompokkan dan kebutuhan utamanya, bahasa Indonesia.",
    "- anggota_keluarga: array objek {hubungan, usia, kondisi_khusus}. WAJIB ISI untuk setiap anggota keluarga yang disebutkan selain KK.",
    "",
    "PETAKAN istilah awam/dialek ke istilah medis baku berikut saat mengekstrak kondisi_medis_kritis:",
    sinonimUntukPrompt(),
  ].join("\n");
}

/**
 * responseSchema untuk memaksa output terstruktur dari Gemini.
 * Semua field penting di-required agar Gemini tidak melewatkan data.
 */
const singleItemSchema = {
  type: Type.OBJECT,
  properties: {
    agent_thought: { type: Type.STRING },
    nama_kk: { type: Type.STRING, nullable: true },
    usia_kk: { type: Type.NUMBER, nullable: true },
    anggota_keluarga: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          hubungan: { type: Type.STRING },
          usia: { type: Type.NUMBER, nullable: true },
          kondisi_khusus: { type: Type.STRING, nullable: true },
        },
        required: ["hubungan"],
      },
    },
    kondisi_medis_kritis: { type: Type.ARRAY, items: { type: Type.STRING } },
    obat_tersedia: { type: Type.BOOLEAN, nullable: true },
    mobilitas: {
      type: Type.STRING,
      enum: ["mandiri", "bantuan", "tidak_bisa"],
      nullable: true,
    },
    asal_lokasi: { type: Type.STRING, nullable: true },
    instansi_rujukan_sementara: {
      type: Type.STRING,
      enum: ["DINAS_KESEHATAN", "DINAS_SOSIAL", "BPBD"],
    },
  },
  required: [
    "agent_thought",
    "nama_kk",
    "usia_kk",
    "anggota_keluarga",
    "kondisi_medis_kritis",
    "obat_tersedia",
    "mobilitas",
    "asal_lokasi",
    "instansi_rujukan_sementara",
  ],
};

const responseSchema = singleItemSchema;

const multiResponseSchema = {
  type: Type.ARRAY,
  items: singleItemSchema,
};

async function callGemini(model: string, teks: string): Promise<string> {
  const res = await ai.models.generateContent({
    model,
    contents: `TEKS RELAWAN:\n"""${teks}"""`,
    config: {
      systemInstruction: buildSystemInstruction(),
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0, // deterministik untuk ekstraksi
    },
  });
  const text = res.text;
  if (!text) throw new Error("Respons Gemini kosong");
  return text;
}

async function callMultiGemini(model: string, teks: string): Promise<string> {
  const res = await ai.models.generateContent({
    model,
    contents: [
      "TEKS RELAWAN (ROMBONGAN / BANYAK KELUARGA):",
      `"""${teks}"""`,
      "",
      "INSTRUKSI: Identifikasi SEMUA keluarga/individu yang disebutkan dalam teks di atas.",
      "Kembalikan SATU elemen array untuk SETIAP kepala keluarga yang berbeda.",
      "Pastikan usia_kk, kondisi_medis_kritis, obat_tersedia, mobilitas, dan anggota_keluarga terisi sesuai teks.",
    ].join("\n"),
    config: {
      systemInstruction: buildMultiSystemInstruction(),
      responseMimeType: "application/json",
      responseSchema: multiResponseSchema,
      temperature: 0, // deterministik untuk ekstraksi
    },
  });
  const text = res.text;
  if (!text) throw new Error("Respons Gemini Multi kosong");
  return text;
}

/**
 * Strip <think>...</think> tags dari respons model yang memiliki
 * fitur "thinking" bawaan (e.g. Qwen via Groq).
 * Tag dan isinya dihapus di server-side sehingga client tidak pernah melihatnya.
 */
function stripThinkTags(text: string): string {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
}

/**
 * Fallback ke Groq API (qwen/qwen3.6-27b) saat Gemini tidak tersedia.
 * Response berupa OpenAI-compatible chat completion.
 */
async function callGroq(teks: string): Promise<string> {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY tidak dikonfigurasi");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: buildSystemInstruction() },
        { role: "user", content: `TEKS RELAWAN:\n"""${teks}"""` },
      ],
      temperature: 0.1,
      max_completion_tokens: 4096,
      top_p: 0.95,
      stream: false,
      reasoning_effort: "default",
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "unknown error");
    throw new Error(`Groq API error ${res.status}: ${errBody}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Respons Groq kosong");

  // Strip <think>...</think> tags dari respons Qwen (server-side only)
  const cleaned = stripThinkTags(content);
  return cleaned;
}

async function callMultiGroq(teks: string): Promise<string> {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY tidak dikonfigurasi");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: buildMultiSystemInstruction() },
        { role: "user", content: `TEKS RELAWAN (ROMBONGAN / BANYAK KELUARGA):\n"""${teks}"""` },
      ],
      temperature: 0.1,
      max_completion_tokens: 4096,
      top_p: 0.95,
      stream: false,
      reasoning_effort: "default",
    }),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "unknown error");
    throw new Error(`Groq API error ${res.status}: ${errBody}`);
  }

  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Respons Groq Multi kosong");

  return stripThinkTags(content);
}

/**
 * Helper: Tambahkan Timeout agar LLM tidak hanging hingga 2 menit.
 * Promise asli tetap di-handle (resolve/reject ditelan) supaya late
 * rejection tidak menjadi unhandled rejection yang mematikan proses Node.
 */
function withTimeout<T>(promise: Promise<T>, ms = 15000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Timeout setelah ${ms}ms`)),
      ms
    );
  });
  // Serap hasil promise asli (termasuk late rejection) agar tidak crash
  promise.then(
    () => {},
    () => {}
  );
  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timer)
  );
}

/**
 * Ekstrak teks bebas -> ProfilKerentanan tervalidasi.
 * Provider Priority Chain:
 *   1. Groq (qwen/qwen3.6-27b) - Eksekusi tercepat
 *   2. Gemini 3.6 Flash - Fallback pertama
 *   3. Gemini 3.5 Flash-Lite - Fallback kedua
 */
export async function ekstrakProfil(teks: string): Promise<ProfilKerentanan> {
  let raw: string;
  let source = "qwen-groq";
  try {
    raw = await withTimeout(callGroq(teks), 25000);
  } catch (err) {
    console.warn(
      `[llm-extract] Groq (${GROQ_MODEL}) gagal, fallback ke Gemini Flash (${MODEL_UTAMA}):`,
      (err as Error).message
    );
    try {
      source = "gemini-flash";
      raw = await withTimeout(callGemini(MODEL_UTAMA, teks), 30000);
    } catch (err2) {
      console.warn(
        `[llm-extract] Gemini Flash gagal, fallback ke Gemini Flash Lite (${MODEL_FALLBACK}):`,
        (err2 as Error).message
      );
      source = "gemini-flash-lite";
      raw = await withTimeout(callGemini(MODEL_FALLBACK, teks), 30000);
    }
  }

  let json: unknown;
  try {
    // Cari blok yang dimulai dengan { dan diakhiri dengan }
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Tidak menemukan struktur JSON dalam respons");
    }
    json = JSON.parse(match[0]);
  } catch (parseError) {
    console.error("RAW AI Output yang gagal diparse:", raw);
    throw new Error("Output AI bukan JSON valid. Silakan coba lagi.");
  }

  const parsed = geminiExtractionSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(
      "Struktur output AI tidak sesuai skema: " + parsed.error.message
    );
  }

  return toProfil(parsed.data, `llm-${source}`);
}

/**
 * Ekstrak narasi banyak keluarga (batch/rombongan) -> array ProfilKerentanan tervalidasi.
 * Menggunakan Gemini dengan responseSchema array ketat untuk menjamin validitas dan akurasi struktur JSON.
 * Provider Priority Chain:
 *   1. Gemini 3.6 Flash (Prioritas Utama: Akurat & Terstruktur)
 *   2. Gemini 3.5 Flash-Lite (Fallback pertama)
 *   3. Groq Qwen (Fallback darurat)
 */
export async function ekstrakMultiProfil(teks: string): Promise<ProfilKerentanan[]> {
  let raw: string;
  let source = "gemini-flash-multi";
  try {
    raw = await withTimeout(callMultiGemini(MODEL_UTAMA, teks), 35000);
  } catch (err) {
    console.warn(
      `[llm-multi] Gemini Flash (${MODEL_UTAMA}) gagal, fallback ke Gemini Flash Lite (${MODEL_FALLBACK}):`,
      (err as Error).message
    );
    try {
      source = "gemini-flash-lite-multi";
      raw = await withTimeout(callMultiGemini(MODEL_FALLBACK, teks), 35000);
    } catch (err2) {
      console.warn(
        `[llm-multi] Gemini Flash Lite gagal, fallback darurat ke Groq (${GROQ_MODEL}):`,
        (err2 as Error).message
      );
      source = "qwen-groq-multi";
      raw = await withTimeout(callMultiGroq(teks), 35000);
    }
  }

  let json: unknown;
  try {
    // Cari blok JSON array `[...]` atau objek `{...}`
    const matchArray = raw.match(/\[[\s\S]*\]/);
    if (matchArray) {
      json = JSON.parse(matchArray[0]);
    } else {
      const matchObj = raw.match(/\{[\s\S]*\}/);
      if (matchObj) {
        // Jika model mengembalikan 1 objek saja, bungkus menjadi array
        json = [JSON.parse(matchObj[0])];
      } else {
        throw new Error("Tidak menemukan struktur JSON dalam respons");
      }
    }
  } catch (parseError) {
    console.error("RAW AI Multi Output yang gagal diparse:", raw);
    throw new Error("Output AI multi bukan JSON valid. Silakan coba lagi.");
  }

  // Jika berupa objek dengan properti data/keluarga/items
  if (json && typeof json === "object" && !Array.isArray(json)) {
    const values = Object.values(json);
    const arr = values.find((v) => Array.isArray(v));
    if (arr) {
      json = arr;
    } else {
      json = [json];
    }
  }

  const parsed = geminiMultiExtractionSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(
      "Struktur output AI multi tidak sesuai skema: " + parsed.error.message
    );
  }

  if (parsed.data.length === 0) {
    throw new Error("AI tidak mendeteksi data keluarga dalam teks laporan.");
  }

  return toMultiProfil(parsed.data, `llm-${source}`);
}

export interface AgregatPosko {
  totalJiwa: number;
  totalKK: number;
  merah: number;
  kuning: number;
  hijau: number;
  ibuHamil: number;
  balita: number;
  lansia: number;
  tanpaObat: number;
  perInstansi: { DINAS_KESEHATAN: number; DINAS_SOSIAL: number; BPBD: number };
}

/**
 * Buat DRAFT ringkasan laporan harian untuk koordinator (Lapis 3 oversight).
 * Output teks formal Indonesia, maksimal ~150 kata. Ini hanya DRAFT —
 * admin wajib mereview & klik kirim. Tidak ada laporan terkirim otomatis.
 */
export async function buatRingkasanHarian(
  agregat: AgregatPosko
): Promise<string> {
  const sys = [
    "Kamu asisten koordinator posko pengungsian PMI.",
    "Buat draft laporan ringkas (maksimal 150 kata) untuk dikirim ke PMI Cabang.",
    "Bahasa Indonesia formal sesuai format laporan PMI.",
    "Sertakan: total jiwa, breakdown kategori kerentanan (MERAH/KUNING/HIJAU),",
    "dan 3 gap/kebutuhan kritis terbesar berdasarkan data.",
    "Kembalikan teks biasa (bukan JSON, bukan markdown).",
  ].join("\n");

  const prompt = `DATA AGREGAT POSKO HARI INI (JSON):\n${JSON.stringify(
    agregat
  )}`;

  // Gemini attempt
  const runGemini = async (model: string) => {
    const res = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { systemInstruction: sys, temperature: 0.4 },
    });
    if (!res.text) throw new Error("Respons Gemini kosong");
    return res.text.trim();
  };

  // Groq attempt
  const runGroq = async () => {
    const apiKey = env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY tidak dikonfigurasi");

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: sys },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_completion_tokens: 2048,
        stream: false,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "unknown");
      throw new Error(`Groq API error ${res.status}: ${errBody}`);
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) throw new Error("Respons Groq kosong");
    return stripThinkTags(content);
  };

  try {
    return await runGroq();
  } catch (err) {
    console.warn(
      `[laporan] Groq (${GROQ_MODEL}) gagal, fallback ke Gemini Flash (${MODEL_UTAMA}):`,
      (err as Error).message
    );
    try {
      return await runGemini(MODEL_UTAMA);
    } catch (err2) {
      console.warn(
        `[laporan] Gemini Flash gagal, fallback ke Gemini Flash Lite (${MODEL_FALLBACK}):`,
        (err2 as Error).message
      );
      return await runGemini(MODEL_FALLBACK);
    }
  }
}
