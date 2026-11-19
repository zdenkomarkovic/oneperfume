import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin" }, robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  const [[o], [m]] = await Promise.all([
    query<{ n: number }>("SELECT COUNT(*) n FROM orders WHERE status = 'novo'"),
    query<{ n: number }>("SELECT COUNT(*) n FROM messages WHERE is_read = 0 AND deleted_at IS NULL"),
  ]);

  return (
    <div className="admin-light min-h-screen lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="border-b border-line bg-surface lg:min-h-screen lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block lg:py-8">
          <Link href="/admin" className="font-serif text-2xl">
            One Perfume <span className="block text-[0.65rem] font-sans uppercase tracking-[0.25em] text-muted">Admin</span>
          </Link>
        </div>
        <AdminNav newOrders={Number(o?.n ?? 0)} unread={Number(m?.n ?? 0)} />
        <div className="hidden space-y-3 border-t border-line px-5 py-5 text-xs text-muted lg:block">
          <p className="truncate">{session.email}</p>
          <Link href="/" target="_blank" className="block hover:text-gold">↗ Otvori sajt</Link>
          <form action={logoutAction}>
            <button className="hover:text-gold">Odjavi se</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 p-5 md:p-10">{children}</main>
    </div>
  );
}
