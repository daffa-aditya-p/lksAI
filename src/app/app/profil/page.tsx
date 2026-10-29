import { auth } from "@/auth";
import { redirect } from "next/navigation";
import UserProfileClient from "./UserProfileClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Profil — SATU AI",
  description: "Pengaturan Profil & Riwayat Layanan Masyarakat",
};

export default async function UserProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <UserProfileClient
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
