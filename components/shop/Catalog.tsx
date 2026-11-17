"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/products";

type Sort = "default" | "asc" | "desc" | "az";

export function Catalog({ products, initialBrand = "" }: { products: Product[]; initialBrand?: string }) {
  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);
  const [brand, setBrand] = useState(brands.includes(initialBrand) ? initialBrand : "");
  const [sort, setSort] = useState<Sort>("default");
  const [q, setQ] = useState("");
  const [hideSold, setHideSold] = useState(false);

  const list = useMemo(() => {
    let r = products.filter(
      (p) =>
        (!brand || p.brand === brand) &&
        (!hideSold || !p.soldOut) &&
        `${p.brand} ${p.name}`.toLowerCase().includes(q.trim().toLowerCase()),
    );
    if (sort === "asc") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "desc") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "az") r = [...r].sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`));
    return r;
  }, [products, brand, sort, q, hideSold]);

  return (
    <div>
      <div className="mb-10 grid gap-4 border-y border-line py-5 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Pretraži parfeme…"
          className="field"
          aria-label="Pretraga"
        />
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="field md:w-52" aria-label="Brend">
          <option value="">Svi brendovi</option>
          {brands.map((b) => (
            <option key={b} value={b} className="bg-surface">
              {b}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field md:w-52" aria-label="Sortiranje">
          <option value="default" className="bg-surface">Podrazumevano</option>
          <option value="asc" className="bg-surface">Cena: rastuće</option>
          <option value="desc" className="bg-surface">Cena: opadajuće</option>
          <option value="az" className="bg-surface">Naziv A–Z</option>
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={hideSold} onChange={(e) => setHideSold(e.target.checked)} className="accent-[#e8dfcf]" />
          Samo dostupno
        </label>
      </div>

      <p className="mb-6 text-xs uppercase tracking-[0.2em] text-muted">{list.length} proizvoda</p>

      {list.length === 0 ? (
        <p className="py-24 text-center font-serif text-2xl text-muted">Nema rezultata za zadate filtere.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard key={p.slug} product={p} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
