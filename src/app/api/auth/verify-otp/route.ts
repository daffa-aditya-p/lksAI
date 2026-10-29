import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyPasswordResetOtp } from "@/lib/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const verifyOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Format email tidak valid"),
  otp: z
    .string()
    .trim()
    .length(6, "Kode OTP harus tepat 6 digit angka")
    .regex(/^\d+$/, "Kode OTP hanya berupa angka"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Input OTP tidak valid" },
        { status: 400 }
      );
    }

    const { email, otp } = parsed.data;

    const result = await verifyPasswordResetOtp(email, otp);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error },
        { status: 400 }
      );
    }

    // OTP valid: berikan temporary resetToken sekali pakai untuk form password baru
    return NextResponse.json({
      ok: true,
      resetToken: result.resetToken,
      message: "Kode OTP berhasil diverifikasi.",
    });
  } catch (err) {
    console.error("[/api/auth/verify-otp]", err);
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan saat memverifikasi OTP. Coba lagi." },
      { status: 500 }
    );
  }
}
