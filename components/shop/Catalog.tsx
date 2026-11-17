"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/lib/products";

type Sort = "default" | "asc" | "desc" | "az";

const PAGE_SIZE = 12;

export function Catalog({ products, initialBrand = "" }: { products: Product[]; initialBrand?: string }) {
  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))).sort(), [products]);
  const [brand, setBrand] = useState(brands.includes(initialBrand) ? initialBrand : "");
  const [sort, setSort] = useState<Sort>("default");
  const [q, setQ] = useState("");
  const [hideSold, setHideSold] = useState(false);

  const [page, setPage] = useState(1);
  const top = useRef<HTMLParagraphElement>(null);

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

  useEffect(() => setPage(1), [brand, sort, q, hideSold]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const goTo = (n: number) => {
    setPage(n);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const nums = Array.from({ length: pages }, (_, k) => k + 1).filter(
    (n) => n === 1 || n === pages || Math.abs(n - cur) <= 1,
  );

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

      <p ref={top} className="mb-6 scroll-mt-32 text-xs uppercase tracking-[0.2em] text-muted">{list.length} proizvoda</p>

      {list.length === 0 ? (
        <p className="py-24 text-center font-serif text-2xl text-muted">Nema rezultata za zadate filtere.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {shown.map((p, i) => (
            <ProductCard key={p.slug} product={p} priority={i < 4} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-16 flex flex-wrap items-center justify-center gap-2" aria-label="Paginacija">
          <button onClick={() => goTo(cur - 1)} disabled={cur === 1} className="pg" aria-label="Prethodna strana">←</button>
          {nums.map((n, k) => (
            <span key={n} className="flex items-center gap-2">
              {k > 0 && n - (nums[k - 1] ?? 0) > 1 && <span className="text-muted">…</span>}
              <button onClick={() => goTo(n)} aria-current={n === cur ? "page" : undefined} className={`pg ${n === cur ? "pg-on" : ""}`}>
                {n}
              </button>
            </span>
          ))}
          <button onClick={() => goTo(cur + 1)} disabled={cur === pages} className="pg" aria-label="Sledeća strana">→</button>
        </nav>
      )}
    </div>
  );
}
