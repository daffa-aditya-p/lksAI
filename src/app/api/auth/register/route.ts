import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter")
    .max(30, "Username maksimal 30 karakter")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Username hanya boleh huruf, angka, titik, strip, dan underscore")
    .optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter"),
  namaLengkap: z
    .string()
    .trim()
    .max(100)
    .optional(),
  noHp: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,20}$/, "Format nomor HP tidak valid")
    .optional()
    .or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    let { username, email, password, namaLengkap, noHp } = parsed.data;

    // Generate username otomatis jika tidak disediakan (misal dari form sign up cepat)
    let finalUsername = username;
    if (!finalUsername) {
      const baseName = email.split("@")[0].replace(/[^a-zA-Z0-9_.-]/g, "").slice(0, 18) || "user";
      // Cek apakah username sudah ada, jika ya tambah suffix angka acak
      const count = await prisma.user.count({
        where: { username: { startsWith: baseName, mode: "insensitive" } },
      });
      finalUsername = count > 0 ? `${baseName}_${count + 1}` : baseName;
    }

    // 1. Cek ketersediaan username dan email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: finalUsername, mode: "insensitive" } },
          { email: { equals: email, mode: "insensitive" } },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === finalUsername.toLowerCase() && username) {
        return NextResponse.json(
          { ok: false, error: "Username sudah digunakan. Silakan pilih username lain." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { ok: false, error: "Email sudah terdaftar. Silakan gunakan email lain atau gunakan fitur Lupa Kata Sandi." },
        { status: 409 }
      );
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Simpan user baru (Role default: USER)
    const newUser = await prisma.user.create({
      data: {
        username: finalUsername,
        email,
        namaLengkap: namaLengkap || null,
        noHp: noHp || null,
        passwordHash,
        role: "USER",
      },
      select: {
        id: true,
        username: true,
        email: true,
        namaLengkap: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message: "Akun berhasil dibuat. Silakan masuk.",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[/api/auth/register]", err);
    return NextResponse.json(
      { ok: false, error: "Terjadi kesalahan internal pada server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
