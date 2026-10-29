import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LaporWizardClient from "./LaporWizardClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Laporkan Kondisi Darurat — SATU AI",
  description: "Laporkan kondisi darurat dan kebutuhan bantuan Anda secara cepat",
};

export default async function LaporPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <LaporWizardClient
      user={{
        name: session.user.name,
        username: session.user.username,
        email: session.user.email,
      }}
    />
  );
}
