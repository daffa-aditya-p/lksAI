import crypto from "crypto";

export interface QRPayload {
  id: string; // Kasus ID
  v: number; // Version
  ts: number; // Timestamp
  token: string; // HMAC Signature
}

const SECRET = process.env.AUTH_SECRET || "fallback_secret_for_dev";

/**
 * Menerima Kasus ID dan mengembalikan string JSON payload untuk QR Code.
 */
export function generateQrPayload(kasusId: string): string {
  const ts = Date.now();
  const v = 1;

  const dataToSign = `${kasusId}:${v}:${ts}`;
  const token = crypto.createHmac("sha256", SECRET).update(dataToSign).digest("hex");

  const payload: QRPayload = {
    id: kasusId,
    v,
    ts,
    token,
  };

  return JSON.stringify(payload);
}

/**
 * Memverifikasi keabsahan payload JSON dari QR Code.
 */
export function verifyQrPayload(payloadStr: string): { valid: boolean; id?: string; error?: string } {
  try {
    const payload = JSON.parse(payloadStr) as QRPayload;

    if (!payload.id || !payload.token || !payload.ts || !payload.v) {
      return { valid: false, error: "Format QR tidak sesuai standar." };
    }

    if (payload.v !== 1) {
      return { valid: false, error: "Versi QR tidak didukung." };
    }

    // Cek kedaluwarsa QR Code: berlaku maksimal 24 jam (24 * 60 * 60 * 1000 ms)
    // Toleransi clock skew 5 menit ke masa depan
    const now = Date.now();
    const MAX_AGE_MS = 24 * 60 * 60 * 1000;
    const CLOCK_SKEW_MS = 5 * 60 * 1000;

    if (payload.ts > now + CLOCK_SKEW_MS) {
      return { valid: false, error: "Waktu QR Code tidak valid (terlalu jauh di masa depan)." };
    }

    if (now - payload.ts > MAX_AGE_MS) {
      return { valid: false, error: "QR Code sudah kedaluwarsa (maksimal 24 jam)." };
    }

    const dataToSign = `${payload.id}:${payload.v}:${payload.ts}`;
    const expectedToken = crypto.createHmac("sha256", SECRET).update(dataToSign).digest("hex");

    // Gunakan timingSafeEqual untuk mencegah timing attack
    const tokenBuffer = Buffer.from(payload.token, "hex");
    const expectedBuffer = Buffer.from(expectedToken, "hex");

    if (tokenBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(tokenBuffer, expectedBuffer)) {
      return { valid: false, error: "Tanda tangan (Signature) QR tidak sah." };
    }

    return { valid: true, id: payload.id };
  } catch (err) {
    return { valid: false, error: "Gagal membaca QR Code." };
  }
}
