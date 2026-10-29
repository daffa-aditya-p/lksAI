import { auth } from "@/auth";
import { getDaftarKampanye } from "@/app/actions/donasi";
import DonasiClient from "./DonasiClient";

export const metadata = {
  title: "Donasi Bencana — SATU AI",
  description: "Salurkan donasi bantuan logistik dan dana darurat untuk korban terdampak bencana.",
};

export const dynamic = "force-dynamic";

export default async function DonasiPage() {
  const session = await auth();
  const kampanyeList = await getDaftarKampanye();

  return (
    <DonasiClient
      initialKampanye={kampanyeList}
      user={{
        name: session?.user?.name || null,
        email: session?.user?.email || null,
      }}
    />
  );
}
