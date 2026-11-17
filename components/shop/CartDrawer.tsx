"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/products";

export function CartDrawer() {
  const { open, setOpen, lines, total, setQty, remove } = useCart();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label="Korpa"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-surface transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-serif text-2xl">Vaša korpa</h2>
          <button onClick={() => setOpen(false)} aria-label="Zatvori" className="text-2xl text-muted hover:text-ink">
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <p className="font-serif text-2xl text-muted">Korpa je prazna</p>
            <Link href="/parfemi" onClick={() => setOpen(false)} className="btn btn-ghost">
              Pogledaj parfeme
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {lines.map(({ key, product: p, variant, price, qty }) => (
                <li key={key} className="flex gap-4 py-5">
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-surface-2">
                    <Image src={p.image} alt={p.name} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="eyebrow !text-[0.6rem]">{p.brand}</span>
                    <Link href={`/proizvod/${p.slug}`} onClick={() => setOpen(false)} className="font-serif text-lg leading-tight hover:text-gold">
                      {p.name}
                    </Link>
                    <span className="text-xs text-muted">{variant ?? p.volume}</span>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-line text-sm">
                        <button className="px-3 py-1 hover:text-gold" onClick={() => setQty(key, qty - 1)} aria-label="Smanji">−</button>
                        <span className="w-6 text-center">{qty}</span>
                        <button className="px-3 py-1 hover:text-gold" onClick={() => setQty(key, qty + 1)} aria-label="Povećaj">+</button>
                      </div>
                      <span className="text-sm">{formatPrice(price * qty)}</span>
                    </div>
                  </div>
                  <button onClick={() => remove(key)} aria-label="Ukloni" className="self-start text-muted hover:text-ink">
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <div className="space-y-4 border-t border-line px-6 py-6">
              <div className="flex items-baseline justify-between">
                <span className="eyebrow !text-muted">Ukupno</span>
                <span className="font-serif text-2xl">{formatPrice(total)}</span>
              </div>
              <Link href="/porudzbina" onClick={() => setOpen(false)} className="btn btn-gold w-full">
                Završi porudžbinu
              </Link>
              <Link href="/korpa" onClick={() => setOpen(false)} className="btn btn-ghost w-full">
                Pogledaj korpu
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
