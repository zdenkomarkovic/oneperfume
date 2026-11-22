import type { Metadata } from "next";
import Link from "next/link";
import { ForgotForm } from "@/components/admin/ForgotForm";

export const metadata: Metadata = { title: "Zaboravljena lozinka", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <div className="admin-light flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm border border-line bg-surface p-8">
        <p className="eyebrow">One Perfume</p>
        <h1 className="mt-2 mb-3 font-serif text-4xl">Zaboravljena lozinka</h1>
        <p className="mb-8 text-sm text-muted">Unesite email administratora i poslaćemo Vam link za postavljanje nove lozinke.</p>
        <ForgotForm />
        <Link href="/admin/login" className="mt-6 block text-center text-sm text-muted hover:text-gold">← Nazad na prijavu</Link>
      </div>
    </div>
  );
}
