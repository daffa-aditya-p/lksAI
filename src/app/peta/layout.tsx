import Link from "next/link";
import { auth } from "@/auth";
import { AppHeader } from "@/components/AppHeader";
import { Logo } from "@/components/Logo";

export default async function PetaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-50">
      {session?.user ? (
        <AppHeader username={session.user.username} role={session.user.role} />
      ) : (
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo size={28} withWordmark />
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-pmi px-3 py-1.5 text-xs font-bold text-white hover:bg-pmi-dark"
            >
              Masuk Petugas
            </Link>
          </div>
        </header>
      )}
      <main>{children}</main>
    </div>
  );
}
