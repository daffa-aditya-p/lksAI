import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserBerandaClient from "./UserBerandaClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Beranda — SATU AI",
  description: "Aplikasi Tanggap Darurat & Layanan Perlindungan Pengungsian Berbasis Komunitas",
};

export default async function UserAppPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Jika admin atau relawan sengaja membuka /app, mereka tetap memiliki konteks,
  // namun UI role USER disajikan khusus dan terisolasi untuk modul aplikasi publik.
  return (
    <UserBerandaClient
      user={{
        id: session.user.id,
        name: session.user.name,
        username: session.user.username,
        email: session.user.email,
        role: session.user.role,
      }}
    />
  );
}
