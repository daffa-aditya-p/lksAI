import { Suspense } from "react";
import { redirect } from "next/navigation";
import ResetPasswordForm from "./ResetPasswordForm";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";

export default async function ForgotPasswordPage() {
  const session = await auth();
  if (session?.user) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "RELAWAN") redirect("/intake");
    redirect("/app");
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center px-6 py-12 bg-[#F8F9FA] selection:bg-amber-400 selection:text-slate-900">
      {/* Container Langsung Tanpa Kotak Card Sesuai Desain Figma */}
      <div className="w-full max-w-[360px] mx-auto">
        <Suspense fallback={<div className="h-[400px] animate-pulse rounded-2xl bg-slate-200/60" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
