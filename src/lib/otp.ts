import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const OTP_PEPPER = process.env.AUTH_SECRET || "satu-ai-secure-otp-pepper";
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Generate 6-digit cryptographic numeric OTP
 */
export function generateNumericOtp(): string {
  // Rentang 100000 s/d 999999
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Hash OTP dengan HMAC-SHA256 terikat pada email & pepper server.
 * Plaintext OTP TIDAK PERNAH disimpan di database atau dikirim balik ke client.
 */
export function hashOtp(otp: string, email: string): string {
  return crypto
    .createHmac("sha256", OTP_PEPPER)
    .update(`${email.trim().toLowerCase()}:${otp.trim()}`)
    .digest("hex");
}

/**
 * Buat dan simpan OTP baru ke database secara aman.
 * Menghapus/menandai invalid OTP sebelumnya agar hanya ada 1 OTP aktif.
 */
export async function createPasswordResetOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Cek rate-limiting cooldown (jangan spam email dalam 60 detik)
  const recentOtp = await prisma.passwordResetOtp.findFirst({
    where: {
      email: normalizedEmail,
      createdAt: {
        gte: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentOtp) {
    const sisaDetik = Math.ceil(
      (recentOtp.createdAt.getTime() + RESEND_COOLDOWN_SECONDS * 1000 - Date.now()) / 1000
    );
    return {
      ok: false as const,
      error: `Harap tunggu ${sisaDetik > 0 ? sisaDetik : 1} detik sebelum meminta kode OTP baru.`,
    };
  }

  // 2. Nonaktifkan semua OTP aktif sebelumnya untuk email ini
  await prisma.passwordResetOtp.updateMany({
    where: {
      email: normalizedEmail,
      used: false,
    },
    data: { used: true },
  });

  // 3. Generate OTP baru & hash
  const rawOtp = generateNumericOtp();
  const hashed = hashOtp(rawOtp, normalizedEmail);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Cari user id jika terdaftar
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, namaLengkap: true, username: true },
  });

  await prisma.passwordResetOtp.create({
    data: {
      email: normalizedEmail,
      otpHash: hashed,
      expiresAt,
      userId: user?.id || null,
      attempts: 0,
      used: false,
    },
  });

  // Return rawOtp HANYA untuk dikirim lewat SMTP mailer (tidak pernah bocor ke API response)
  return {
    ok: true as const,
    rawOtp,
    user,
    expiresAt,
  };
}

/**
 * Verifikasi OTP dengan proteksi brute-force & timing-attack safe comparison.
 */
export async function verifyPasswordResetOtp(email: string, inputOtp: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const cleanOtp = inputOtp.trim();

  const record = await prisma.passwordResetOtp.findFirst({
    where: {
      email: normalizedEmail,
      used: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return { ok: false as const, error: "Kode OTP tidak valid atau belum diminta." };
  }

  // 1. Cek kedaluwarsa waktu
  if (new Date() > record.expiresAt) {
    await prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { used: true },
    });
    return { ok: false as const, error: "Kode OTP sudah kedaluwarsa. Silakan minta kode baru." };
  }

  // 2. Cek batas percobaan salah (brute force protection max 5x)
  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { used: true },
    });
    return {
      ok: false as const,
      error: "Batas percobaan terlampaui. Kode OTP dibatalkan demi keamanan. Silakan minta kode baru.",
    };
  }

  // 3. Timing-safe comparison
  const calculatedHash = hashOtp(cleanOtp, normalizedEmail);
  const a = Buffer.from(calculatedHash, "hex");
  const b = Buffer.from(record.otpHash, "hex");

  const isMatch = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!isMatch) {
    const updated = await prisma.passwordResetOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
      select: { attempts: true },
    });
    const sisa = MAX_ATTEMPTS - updated.attempts;
    return {
      ok: false as const,
      error:
        sisa > 0
          ? `Kode OTP salah. Sisa kesempatan: ${sisa} kali.`
          : "Kode OTP salah dan telah dibatalkan demi keamanan. Silakan minta kode baru.",
    };
  }

  // 4. OTP valid! Buat temporary resetToken (32 byte hex) untuk otorisasi form password baru
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHmac("sha256", OTP_PEPPER)
    .update(`${normalizedEmail}:${resetToken}`)
    .digest("hex");

  // Tandai OTP used dan simpan token hash dengan masa berlaku 15 menit
  await prisma.passwordResetOtp.update({
    where: { id: record.id },
    data: {
      used: true,
      resetTokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 menit untuk ganti password
    },
  });

  return {
    ok: true as const,
    userId: record.userId,
    resetToken,
  };
}

/**
 * Validasi resetToken dan konsumsi token secara atomik saat mengubah kata sandi baru.
 */
export async function validateResetTokenAndConsume(email: string, resetToken: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const tokenHash = crypto
    .createHmac("sha256", OTP_PEPPER)
    .update(`${normalizedEmail}:${resetToken.trim()}`)
    .digest("hex");

  const record = await prisma.passwordResetOtp.findFirst({
    where: {
      email: normalizedEmail,
      resetTokenHash: tokenHash,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return {
      ok: false as const,
      error: "Sesi reset kata sandi tidak valid atau telah kedaluwarsa. Silakan minta kode OTP baru.",
    };
  }

  // Hapus/konsumsi token secara permanen agar tidak bisa digunakan ulang
  await prisma.passwordResetOtp.update({
    where: { id: record.id },
    data: {
      resetTokenHash: null,
      expiresAt: new Date(0),
    },
  });

  return {
    ok: true as const,
    userId: record.userId,
  };
}
