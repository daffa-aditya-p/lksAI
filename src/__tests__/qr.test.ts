import { describe, it, expect } from "vitest";
import { generateQrPayload, verifyQrPayload, type QRPayload } from "@/lib/qr";

describe("Keamanan & Verifikasi QR Code (HMAC-SHA256)", () => {
  it("harus menghasilkan payload QR yang valid dengan tanda tangan HMAC yang sah", () => {
    const kasusId = "kasus-test-123";
    const payloadStr = generateQrPayload(kasusId);

    expect(typeof payloadStr).toBe("string");
    const payload = JSON.parse(payloadStr) as QRPayload;
    expect(payload.id).toBe(kasusId);
    expect(payload.v).toBe(1);
    expect(payload.ts).toBeTypeOf("number");
    expect(payload.token).toHaveLength(64); // SHA256 hex string

    const verif = verifyQrPayload(payloadStr);
    expect(verif.valid).toBe(true);
    expect(verif.id).toBe(kasusId);
    expect(verif.error).toBeUndefined();
  });

  it("harus menolak QR Code yang diubah/dimanipulasi (tampered kasusId)", () => {
    const payloadStr = generateQrPayload("kasus-asli-001");
    const payload = JSON.parse(payloadStr) as QRPayload;

    // Tampering payload ID
    payload.id = "kasus-palsu-999";
    const tamperedStr = JSON.stringify(payload);

    const verif = verifyQrPayload(tamperedStr);
    expect(verif.valid).toBe(false);
    expect(verif.error).toContain("Tanda tangan (Signature) QR tidak sah");
  });

  it("harus menolak QR Code yang kedaluwarsa (> 24 jam)", () => {
    const kasusId = "kasus-expired-002";
    const payloadStr = generateQrPayload(kasusId);
    const payload = JSON.parse(payloadStr) as QRPayload;

    // Mundurkan timestamp lebih dari 24 jam (misal 25 jam yang lalu)
    const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
    payload.ts = twentyFiveHoursAgo;

    const expiredStr = JSON.stringify(payload);
    const verif = verifyQrPayload(expiredStr);
    expect(verif.valid).toBe(false);
    expect(verif.error).toContain("QR Code sudah kedaluwarsa");
  });

  it("harus menolak QR Code dengan format rusak atau tidak lengkap", () => {
    expect(verifyQrPayload("bukan json").valid).toBe(false);
    expect(verifyQrPayload(JSON.stringify({ id: "123" })).valid).toBe(false);
    expect(verifyQrPayload(JSON.stringify({ id: "123", v: 2, ts: Date.now(), token: "abc" })).valid).toBe(false);
  });
});
