import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { simpanKasusIntake } from "@/lib/simpanKasus";
import { konfirmasiSchema } from "@/lib/kasusSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/offline/sync
 * Dipanggil oleh Service Worker (Background Sync) untuk mengirim antrian
 * intake yang direkam saat offline (IndexedDB). Sesi relawan diambil dari
 * cookie sesi yang sama (same-origin fetch menyertakan cookie otomatis).
 *
 * Body: { items: [{ id: string(lokal), kasus: KonfirmasiInput }] }
 * Return: { ok, saved: [{id, kodeUnik}], failed: [{id, error}] }
 */
const bodySchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      kasus: z.unknown(),
    })
  ),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Tidak terautentikasi" }, { status: 401 });
    }

    if (session.user.role !== "RELAWAN" && session.user.role !== "ADMIN") {
      return NextResponse.json({ ok: false, error: "Akses ditolak: Hanya Relawan atau Admin yang dapat menyinkronkan data intake." }, { status: 403 });
    }

    const json = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? "Format payload tidak valid" },
        { status: 400 }
      );
    }

    const saved: Array<{ id: string; kodeUnik: string }> = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const item of parsed.data.items) {
      const kasusParsed = konfirmasiSchema.safeParse(item.kasus);
      if (!kasusParsed.success) {
        failed.push({
          id: item.id,
          error: kasusParsed.error.issues[0]?.message ?? "Data kasus tidak valid",
        });
        continue;
      }

      try {
        const hasil = await simpanKasusIntake(
          kasusParsed.data,
          session.user.id,
          session.user.username
        );
        saved.push({ id: item.id, kodeUnik: hasil.kodeUnik });
      } catch (err: any) {
        failed.push({ id: item.id, error: err?.message ?? "Gagal menyimpan ke database" });
      }
    }

    revalidatePath("/admin");
    revalidatePath("/rujukan");

    return NextResponse.json({ ok: true, saved, failed });
  } catch (err) {
    console.error("[/api/offline/sync]", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
