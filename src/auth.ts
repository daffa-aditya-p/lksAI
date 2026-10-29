import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

const credentialsSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

/**
 * Konfigurasi Auth.js lengkap (Node runtime).
 * Credentials provider memverifikasi username / email + password terhadap tabel User
 * dengan bcrypt. Mendukung role USER, RELAWAN, dan ADMIN.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        username: { label: "Username / Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { username, password } = parsed.data;
        const identifier = username.trim();

        // Cari berdasarkan username ATAU email
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { username: { equals: identifier, mode: "insensitive" } },
              { email: { equals: identifier.toLowerCase(), mode: "insensitive" } },
            ],
          },
        });

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        // Object ini menjadi `user` di callback jwt.
        return {
          id: user.id,
          username: user.username,
          email: user.email || undefined,
          role: user.role,
          name: user.namaLengkap || user.username,
        };
      },
    }),
  ],
});
