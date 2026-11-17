import type { Metadata } from "next";
import { Catalog } from "@/components/shop/Catalog";
import { products } from "@/lib/products";

export const metadata: Metadata = {
  title: "Parfemi",
  description: "Kompletna ponuda muških, ženskih i unisex parfema.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ brend?: string }> }) {
  const { brend } = await searchParams;
  return (
    <div className="container-x pt-16">
      <p className="eyebrow">Kolekcija</p>
      <h1 className="mt-3 mb-12 font-serif text-5xl md:text-6xl">Svi parfemi</h1>
      <Catalog products={products} initialBrand={brend ? decodeURIComponent(brend) : ""} />
    </div>
  );
}
