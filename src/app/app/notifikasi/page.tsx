import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NotificationClient from "./NotificationClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Notifikasi — SATU AI",
  description: "Pusat Informasi & Notifikasi Aktivitas Tanggap Darurat",
};

export default async function NotificationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <NotificationClient
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
