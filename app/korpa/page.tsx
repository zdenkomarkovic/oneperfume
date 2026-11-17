"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/shop/CartProvider";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const { lines, total, setQty, remove } = useCart();

  return (
    <div className="container-x pt-16">
      <p className="eyebrow">Korpa</p>
      <h1 className="mt-3 mb-12 font-serif text-5xl md:text-6xl">Vaša korpa</h1>

      {lines.length === 0 ? (
        <div className="py-20 text-center">
          <p className="font-serif text-3xl text-muted">Korpa je prazna</p>
          <Link href="/parfemi" className="btn btn-gold mt-8">Nastavi kupovinu</Link>
        </div>
      ) : (
        <div className="grid gap-12 lg:grid-cols-[1fr_22rem]">
          <ul className="divide-y divide-line border-y border-line">
            {lines.map(({ key, product: p, variant, price, qty }) => (
              <li key={key} className="flex gap-5 py-6">
                <div className="relative h-32 w-24 shrink-0 overflow-hidden bg-surface-2">
                  <Image src={p.image} alt={p.name} fill sizes="96px" className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="eyebrow !text-[0.62rem]">{p.brand}</span>
                  <Link href={`/proizvod/${p.slug}`} className="font-serif text-2xl hover:text-gold">{p.name}</Link>
                  <span className="text-xs text-muted">{variant ?? p.volume} · {formatPrice(price)}</span>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center border border-line text-sm">
                      <button className="px-3 py-1.5 hover:text-gold" onClick={() => setQty(key, qty - 1)} aria-label="Smanji">−</button>
                      <span className="w-8 text-center">{qty}</span>
                      <button className="px-3 py-1.5 hover:text-gold" onClick={() => setQty(key, qty + 1)} aria-label="Povećaj">+</button>
                    </div>
                    <div className="flex items-center gap-5">
                      <span>{formatPrice(price * qty)}</span>
                      <button onClick={() => remove(key)} className="text-xs uppercase tracking-widest text-muted hover:text-ink">Ukloni</button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit border border-line bg-surface p-8">
            <h2 className="font-serif text-3xl">Pregled</h2>
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted">Međuzbir</span><span>{formatPrice(total)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Dostava</span><span>Obračunava se pri slanju</span></div>
            </div>
            <div className="mt-6 flex items-baseline justify-between border-t border-line pt-6">
              <span className="eyebrow !text-muted">Ukupno</span>
              <span className="font-serif text-3xl">{formatPrice(total)}</span>
            </div>
            <Link href="/porudzbina" className="btn btn-gold mt-8 w-full">Završi porudžbinu</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
