"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/shop/CartProvider";
import type { Category } from "@/lib/products";

export function Header({ categories }: { categories: Category[] }) {
  const nav = [
    { href: "/parfemi", label: "Parfemi" },
    ...categories.map((c) => ({ href: `/parfemi/${c.slug}`, label: c.name.replace(/\s*parfemi$/i, "") })),
    { href: "/brendovi", label: "Brendovi" },
    { href: "/o-nama", label: "O nama" },
    { href: "/kontakt", label: "Kontakt" },
  ];
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          scrolled ? "border-line bg-bg/90 backdrop-blur-md" : "border-transparent bg-bg"
        }`}
      >
        <div className="container-x flex h-24 items-center justify-between">
          <button className="lg:hidden" onClick={() => setMenu(true)} aria-label="Meni">
            <span className="block h-px w-6 bg-ink" />
            <span className="mt-2 block h-px w-6 bg-ink" />
            <span className="mt-2 block h-px w-4 bg-ink" />
          </button>

          <Link href="/" aria-label="One Perfume – početna" className="shrink-0">
            <Image src="/logo-dark.png" alt="One Perfume" width={637} height={346} priority className="h-[4.5rem] w-auto" />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Glavna navigacija">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="nav-link text-[0.74rem] font-medium uppercase tracking-[0.2em] text-ink/80 transition-colors hover:text-gold">
                {n.label}
              </Link>
            ))}
          </nav>

          <button onClick={() => setOpen(true)} className="relative flex items-center gap-2 text-[0.74rem] font-medium uppercase tracking-[0.2em] hover:text-gold" aria-label="Korpa">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d="M5 8h14l-1 12H6L5 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="hidden sm:inline">Korpa</span>
            {count > 0 && (
              <span key={count} className="pop flex h-5min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[0.65rem] font-bold text-bg">{count}</span>
            )}
          </button>
        </div>
      </header>

      <div className={`fixed inset-0 z-[70] lg:hidden ${menu ? "" : "pointer-events-none"}`}>
        <div onClick={() => setMenu(false)} className={`absolute inset-0 bg-black/70 transition-opacity ${menu ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute left-0 top-0 flex h-full w-4/5 max-w-sm flex-col bg-surface p-8 transition-transform duration-300 ${menu ? "translate-x-0" : "-translate-x-full"}`}>
          <button onClick={() => setMenu(false)} className="mb-10 self-end text-3xl text-muted" aria-label="Zatvori">×</button>
          <nav className="flex flex-col gap-6">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setMenu(false)} className="font-serif text-3xl hover:text-gold">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
