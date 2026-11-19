import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin prijava", robots: { index: false, follow: false } };

export default async function Page() {
  if (await getSession()) redirect("/admin");
  return (
    <div className="admin-light flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm border border-line bg-surface p-8">
        <p className="eyebrow">One Perfume</p>
        <h1 className="mt-2 mb-8 font-serif text-4xl">Admin panel</h1>
        <LoginForm />
      </div>
    </div>
  );
}
