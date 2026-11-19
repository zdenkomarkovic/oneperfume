"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { priceLabel, toCartProduct, type Product } from "@/lib/products";

export function ProductCard({ product: p, priority = false }: { product: Product; priority?: boolean }) {
  const { add } = useCart();
  return (
    <article className="group card-lift flex flex-col">
      <Link href={`/proizvod/${p.slug}`} className="card-img relative block aspect-square overflow-hidden bg-surface-2">
        <Image
          src={p.image}
          alt={`${p.brand} ${p.name}`}
          fill
          priority={priority}
          sizes="(min-width:1024px) 25vw, (min-width:640px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {p.soldOut && (
          <span className="absolute left-3 top-3 bg-bg px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold">
            Rasprodato
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col pt-4">
        <span className="eyebrow !text-[0.62rem]">{p.brand}</span>
        <Link href={`/proizvod/${p.slug}`} className="mt-1 font-serif text-xl leading-snug transition-colors hover:text-gold">
          {p.name}
        </Link>
        <span className="mt-1 text-xs text-muted">{p.volume}</span>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-sm font-medium">{priceLabel(p)}</span>
          {p.soldOut ? (
            <span className="text-[0.7rem] uppercase tracking-widest text-muted">Nema na stanju</span>
          ) : p.variants ? (
            <Link href={`/proizvod/${p.slug}`} className="text-[0.7rem] font-semibold uppercase tracking-widest text-gold hover:text-gold-soft">
              Izaberi
            </Link>
          ) : (
            <button
              onClick={() => add(toCartProduct(p))}
              className="add-btn text-[0.7rem] font-semibold uppercase tracking-widest text-gold transition-colors hover:text-gold-soft"
            >
              + Dodaj
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
