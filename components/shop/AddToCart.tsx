"use client";

import { useState } from "react";
import { useCart } from "./CartProvider";
import { formatPrice, type Variant } from "@/lib/products";

export function AddToCart({ slug, soldOut, variants }: { slug: string; soldOut?: boolean; variants?: Variant[] }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [variant, setVariant] = useState(variants?.[0]?.label);
  const price = variants?.find((v) => v.label === variant)?.price;

  if (soldOut) return <button disabled className="btn btn-gold w-full">Rasprodato</button>;

  return (
    <div className="space-y-4">
      {variants && (
        <div className="flex gap-3" role="radiogroup" aria-label="Veličina">
          {variants.map((v) => (
            <button
              key={v.label}
              role="radio"
              aria-checked={variant === v.label}
              onClick={() => setVariant(v.label)}
              className={`border px-5 py-3 text-sm transition ${variant === v.label ? "border-gold text-gold" : "border-line text-muted hover:border-gold/60"}`}
            >
              {v.label} <span className="ml-2 text-ink/70">{formatPrice(v.price)}</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-3">
        <div className="flex items-center border border-line">
          <button className="px-4 py-3 hover:text-gold" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Smanji">−</button>
          <span className="w-8 text-center text-sm">{qty}</span>
          <button className="px-4 py-3 hover:text-gold" onClick={() => setQty((q) => Math.min(20, q + 1))} aria-label="Povećaj">+</button>
        </div>
        <button className="btn btn-gold flex-1" onClick={() => add(slug, qty, variant)}>
          Dodaj u korpu{price ? ` · ${formatPrice(price * qty)}` : ""}
        </button>
      </div>
    </div>
  );
}
