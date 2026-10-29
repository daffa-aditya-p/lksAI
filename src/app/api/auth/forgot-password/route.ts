import { NextResponse } from "next/server";
import { z } from "zod";
import { createPasswordResetOtp } from "@/lib/otp";
import { sendPasswordResetOtpEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Format email tidak valid"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Email tidak valid" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // 1. Buat kode OTP secara aman di database (terenkripsi/hash SHA-256)
    const otpResult = await createPasswordResetOtp(email);

    if (!otpResult.ok) {
      return NextResponse.json(
        { ok: false, error: otpResult.error },
        { status: 429 } // Too Many Requests / Rate-limited
      );
    }

    // 2. Kirim kode OTP via SMTP email asli
    // Plaintext OTP HANYA berada di memori server dan dikirim via SMTP
    try {
      await sendPasswordResetOtpEmail({
        toEmail: email,
        otpCode: otpResult.rawOtp,
        nama: otpResult.user?.namaLengkap || otpResult.user?.username,
      });
    } catch (mailErr) {
      console.error("[/api/auth/forgot-password] Gagal mengirim email SMTP:", mailErr);
      return NextResponse.json(
        {
          ok: false,
          error: "Gagal mengirimkan email verifikasi. Pastikan konfigurasi SMTP aktif atau coba lagi nanti.",
        },
        { status: 502 }
      );
    }

    // 3. Respon ke client: OTP TIDAK PERNAH DIBOCORKAN DI RESPONSE
    return NextResponse.json({
      ok: true,
      message: "Kode OTP 6-digit telah dikirimkan ke alamat email Anda. Periksa kotak masuk atau folder spam.",
    });
  } catch (err) {
    console.error("[/api/auth/forgot-password]", err);
    return NextResponse.json(
      { ok: false, error: "Gagal memproses permintaan reset kata sandi. Coba lagi." },
      { status: 500 }
    );
  }
}
