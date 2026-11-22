import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "@/components/admin/ResetForm";

export const metadata: Metadata = { title: "Nova lozinka", robots: { index: false, follow: false } };

export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return (
    <div className="admin-light flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm border border-line bg-surface p-8">
        <p className="eyebrow">One Perfume</p>
        <h1 className="mt-2 mb-8 font-serif text-4xl">Nova lozinka</h1>
        {token ? (
          <ResetForm token={token} />
        ) : (
          <p className="text-sm text-muted">Link nije ispravan. <Link href="/admin/zaboravljena-lozinka" className="text-gold">Zatražite novi.</Link></p>
        )}
      </div>
    </div>
  );
}
