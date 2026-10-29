import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import RelawanDashboardClient, {
  KasusFeedItem,
  PoskoOption,
  DistribusiLogItem,
} from "./RelawanDashboardClient";

export const metadata = {
  title: "Pusat Operasional Lapangan & Posko — SATU AI",
};
export const dynamic = "force-dynamic";

export default async function RelawanPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // Hanya RELAWAN dan ADMIN yang berhak mengakses Dashboard Operasional Relawan
  if (session.user.role !== "RELAWAN" && session.user.role !== "ADMIN") {
    redirect("/app");
  }

  const [
    totalJiwa,
    totalMerah,
    totalKuning,
    totalHijau,
    terverifikasiCount,
    rawKasus,
    rawPosko,
    rawAuditLogs,
  ] = await Promise.all([
    prisma.kasus.count({ where: { isSpam: false } }),
    prisma.kasus.count({ where: { isSpam: false, levelPrioritas: "MERAH" } }),
    prisma.kasus.count({ where: { isSpam: false, levelPrioritas: "KUNING" } }),
    prisma.kasus.count({ where: { isSpam: false, levelPrioritas: "HIJAU" } }),
    prisma.kasus.count({ where: { isSpam: false, status: "terverifikasi" } }),
    prisma.kasus.findMany({
      where: { isSpam: false },
      take: 25,
      orderBy: { createdAt: "desc" },
    }),
    prisma.posko.findMany({
      orderBy: { namaPosko: "asc" },
      select: { id: true, namaPosko: true, areaPublik: true },
    }),
    prisma.auditLog.findMany({
      where: { aksi: "DISTRIBUSI_BANTUAN_POSKO" },
      take: 10,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const antreanKasus: KasusFeedItem[] = rawKasus.map((k) => ({
    id: k.id,
    kodeUnik: k.kodeUnik,
    namaKK: k.namaKK,
    usiaKK: k.usiaKK,
    asalLokasi: k.asalLokasi,
    levelPrioritas: k.levelPrioritas as "MERAH" | "KUNING" | "HIJAU",
    status: k.status,
    sumberInput: k.sumberInput,
    createdAt: k.createdAt.toISOString(),
    kondisiMedisKritis: Array.isArray(k.kondisiMedisKritis)
      ? (k.kondisiMedisKritis as string[])
      : [],
    obatTersedia: k.obatTersedia,
  }));

  const poskoList: PoskoOption[] = rawPosko.map((p) => ({
    id: p.id,
    namaPosko: p.namaPosko,
    areaPublik: p.areaPublik,
  }));

  const riwayatDistribusi: DistribusiLogItem[] = rawAuditLogs.map((log) => {
    const detail = (log.detail && typeof log.detail === "object" ? log.detail : {}) as Record<string, unknown>;
    return {
      id: log.id,
      penerima: (detail.namaPenerima as string) || "Keluarga Penerima Manfaat",
      bantuan: Array.isArray(detail.itemBantuan) ? (detail.itemBantuan as string[]) : ["Logistik Tanggap Darurat"],
      waktu: log.createdAt.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      posko: (detail.posko as string) || "Posko Siaga",
    };
  });

  return (
    <RelawanDashboardClient
      user={{
        username: session.user.username || session.user.name || "Relawan SATU",
        role: session.user.role,
      }}
      metrics={{
        totalJiwa,
        totalMerah,
        totalKuning,
        totalHijau,
        terverifikasiCount,
      }}
      antreanKasus={antreanKasus}
      poskoList={poskoList}
      riwayatDistribusi={riwayatDistribusi}
    />
  );
}
