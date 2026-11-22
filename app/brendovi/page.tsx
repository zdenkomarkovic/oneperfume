import type { Metadata } from "next";
import Link from "next/link";
import { getBrands, getProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Brendovi", description: "Brendovi parfema u ponudi One Perfume parfimerije u Leskovcu: Armaf, Lattafa, Afnan, Paris Corner, Al Haramain i drugi.", alternates: { canonical: "/brendovi" } };

export default async function Page() {
  const [brands, products] = await Promise.all([getBrands(), getProducts()]);
  return (
    <div className="container-x pt-16">
      <p className="eyebrow">Kolekcija</p>
      <h1 className="mt-3 mb-12 font-serif text-5xl md:text-6xl">Brendovi u ponudi</h1>
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => {
          const n = products.filter((p) => p.brand === b).length;
          return (
            <Link key={b} href={`/parfemi?brend=${encodeURIComponent(b)}`} className="group flex items-center justify-between bg-bg p-10 transition-colors hover:bg-surface">
              <div>
                <h2 className="font-serif text-3xl transition-colors group-hover:text-gold">{b}</h2>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted">{n} {n === 1 ? "proizvod" : "proizvoda"}</p>
              </div>
              <span className="text-2xl text-gold transition-transform group-hover:translate-x-1">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
