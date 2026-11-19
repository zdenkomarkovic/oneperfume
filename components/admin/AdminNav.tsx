"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Pregled", exact: true },
  { href: "/admin/porudzbine", label: "Porudžbine", badge: "orders" },
  { href: "/admin/proizvodi", label: "Proizvodi" },
  { href: "/admin/kategorije", label: "Kategorije" },
  { href: "/admin/brendovi", label: "Brendovi" },
  { href: "/admin/poruke", label: "Poruke", badge: "messages" },
  { href: "/admin/podesavanja", label: "Podešavanja" },
] as const;

export function AdminNav({ newOrders, unread }: { newOrders: number; unread: number }) {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3 lg:pb-6">
      {items.map((i) => {
        const on = "exact" in i ? path === i.href : path.startsWith(i.href);
        const n = "badge" in i ? (i.badge === "orders" ? newOrders : unread) : 0;
        return (
          <Link
            key={i.href}
            href={i.href}
            className={`flex shrink-0 items-center justify-between gap-3 px-3 py-2.5 text-sm transition-colors ${
              on ? "bg-surface-2 font-medium text-gold" : "text-ink/70 hover:text-gold"
            }`}
          >
            {i.label}
            {n > 0 && <span className="rounded-full bg-gold px-2 text-[0.65rem] font-bold text-bg">{n}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
