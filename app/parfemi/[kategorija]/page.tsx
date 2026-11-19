import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalog } from "@/components/shop/Catalog";
import { getCategories, getProducts } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ kategorija: string }> }): Promise<Metadata> {
  const { kategorija } = await params;
  const label = (await getCategories()).find((c) => c.slug === kategorija)?.name;
  return { title: label ?? "Parfemi", description: label ? `${label}` : undefined };
}

export default async function Page({ params }: { params: Promise<{ kategorija: string }> }) {
  const { kategorija } = await params;
  const label = (await getCategories()).find((c) => c.slug === kategorija)?.name;
  if (!label) notFound();
  const list = (await getProducts()).filter((p) => p.categories.includes(kategorija));
  return (
    <div className="container-x pt-16">
      <p className="eyebrow">Kolekcija</p>
      <h1 className="mt-3 mb-12 font-serif text-5xl md:text-6xl">{label}</h1>
      <Catalog products={list} />
    </div>
  );
}
