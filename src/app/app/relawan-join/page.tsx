import { auth } from "@/auth";
import { getDaftarKegiatanRelawan } from "@/app/actions/volunteer";
import RelawanJoinClient from "./RelawanJoinClient";

export const metadata = {
  title: "Pendaftaran Relawan — SATU AI",
  description: "Daftar sebagai relawan lapangan dan bantu penanganan korban bencana.",
};

export const dynamic = "force-dynamic";

export default async function RelawanJoinPage() {
  const session = await auth();
  const kegiatanList = await getDaftarKegiatanRelawan();

  return (
    <RelawanJoinClient
      initialKegiatan={kegiatanList}
      user={{
        name: session?.user?.name || null,
        email: session?.user?.email || null,
      }}
    />
  );
}
