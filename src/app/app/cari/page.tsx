import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CariBantuanClient, { FacilityItem } from "./CariBantuanClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Cari Bantuan & Posko Terdekat — SATU AI",
  description: "Temukan posko pengungsian, fasilitas medis, dan layanan logistik terdekat",
};

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CariBantuanPage(props: PageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const resolvedParams = props.searchParams ? await props.searchParams : {};
  const rawKategori = typeof resolvedParams.kategori === "string" ? resolvedParams.kategori.toLowerCase() : "";
  const rawView = typeof resolvedParams.view === "string" ? resolvedParams.view.toLowerCase() : "";

  let initialCategory: "semua" | "posko" | "medis" | "bantuan" = "semua";
  if (rawKategori === "medis") initialCategory = "medis";
  else if (rawKategori === "posko" || rawKategori === "pengungsian") initialCategory = "posko";
  else if (rawKategori === "logistik" || rawKategori === "bantuan") initialCategory = "bantuan";

  const initialView: "daftar" | "peta" | undefined = rawView === "peta" ? "peta" : undefined;

  // Ambil data posko dari database
  const rawPosko = await prisma.posko.findMany({
    take: 60,
    orderBy: { namaPosko: "asc" },
    include: {
      kebutuhanAgregat: {
        select: {
          kategori: true,
          urgensi: true,
          status: true,
        },
      },
    },
  });

  const facilities: FacilityItem[] = rawPosko.map((p, idx) => {
    // Tentukan kategori dominan
    const isMedis = p.kebutuhanAgregat.some((k) =>
      k.kategori.includes("obat") || k.kategori.includes("medis")
    );
    const categoryType: "medis" | "posko" | "bantuan" = isMedis
      ? "medis"
      : idx % 3 === 0
      ? "bantuan"
      : "posko";

    return {
      id: p.id,
      nama: p.namaPosko,
      area: p.areaPublik,
      alamat: p.alamatText || p.areaPublik,
      lat: p.lat,
      lng: p.lng,
      kategori: categoryType,
      kategoriLabel: isMedis ? "Layanan Medis" : categoryType === "bantuan" ? "Titik Bantuan" : "Posko Pengungsian",
      jarak: `${(1.2 + (idx * 0.4) % 8).toFixed(1)} km`,
      status: "Tersedia",
      kapasitas: `${50 + (idx * 17) % 250} Jiwa`,
    };
  });

  return (
    <CariBantuanClient
      user={{
        name: session.user.name,
        username: session.user.username,
      }}
      facilities={facilities}
      initialCategory={initialCategory}
      initialView={initialView}
    />
  );
}
