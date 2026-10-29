import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { validateResetTokenAndConsume } from "@/lib/otp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resetPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Format email tidak valid"),
  resetToken: z
    .string()
    .min(32, "Token reset tidak valid"),
  newPassword: z
    .string()
    .min(6, "Kata sandi baru minimal 6 karakter"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const { email, resetToken, newPassword } = parsed.data;

    // 1. Validasi resetToken dan konsumsi (hanya bisa 1x pakai)
    const tokenResult = await validateResetTokenAndConsume(email, resetToken);
    if (!tokenResult.ok) {
      return NextResponse.json(
        { ok: false, error: tokenResult.error },
        { status: 403 }
      );
    }

    // 2. Cari akun user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "Akun dengan email tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    // 3. Hash kata sandi baru
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // 4. Update kata sandi user
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({
      ok: true,
      message: "Kata sandi Anda telah berhasil diperbarui. Silakan masuk.",
    });
  } catch (err) {
    console.error("[/api/auth/reset-password]", err);
    return NextResponse.json(
      { ok: false, error: "Gagal memperbarui kata sandi. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
