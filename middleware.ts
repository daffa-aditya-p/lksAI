import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Middleware memakai config edge-safe (tanpa Prisma). Cek role dari JWT.
const { auth } = NextAuth(authConfig);

/**
 * RBAC:
 *  - /admin/*, /rujukan/*, /peta/admin   -> hanya ADMIN
 *  - /intake/*                           -> RELAWAN atau ADMIN
 *  - /app/*                              -> USER, RELAWAN, atau ADMIN (wajib login)
 *  - /peta/instansi                      -> wajib login
 *  - /login                              -> publik; jika sudah login, redirect ke beranda role
 *  - /mandiri/*, /, /api/auth/*          -> publik
 */
export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const role = session?.user?.role;
  const isLoggedIn = !!session?.user;
  const path = nextUrl.pathname;

  const isAdminArea =
    path.startsWith("/admin") ||
    path.startsWith("/rujukan") ||
    path.startsWith("/peta/admin");

  const isRelawanArea = path.startsWith("/intake");
  const isUserAppArea = path.startsWith("/app");
  const isAuthArea = path.startsWith("/peta/instansi");
  const isAuthPage = path === "/login" || path === "/daftar" || path === "/lupa-sandi";

  // Helper beranda role
  const getHomeForRole = (r?: string) => {
    if (r === "ADMIN") return "/admin";
    if (r === "RELAWAN") return "/intake";
    return "/app";
  };

  // 1. Sudah login tapi membuka halaman autentikasi → arahkan ke beranda sesuai role.
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL(getHomeForRole(role), nextUrl));
  }

  // 2. Sudah login & membuka landing page "/" → arahkan ke beranda role
  if (path === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL(getHomeForRole(role), nextUrl));
  }

  // 3. Area terproteksi tapi belum login → ke /login (+ callback).
  if ((isAdminArea || isRelawanArea || isAuthArea || isUserAppArea) && !isLoggedIn) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }

  // 4. Area admin diakses non-admin → tolak ke beranda rolenya.
  if (isAdminArea && role !== "ADMIN") {
    return NextResponse.redirect(new URL(getHomeForRole(role), nextUrl));
  }

  // 5. Area intake relawan diakses oleh role USER biasa → tolak ke /app.
  if (isRelawanArea && role !== "RELAWAN" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/app", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Jalankan middleware di semua route kecuali aset statis & internal Next.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
