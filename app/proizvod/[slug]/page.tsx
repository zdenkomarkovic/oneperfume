import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/shop/AddToCart";
import { Gallery } from "@/components/shop/Gallery";
import { ProductCard } from "@/components/shop/ProductCard";
import { genderLabels, getProduct, priceLabel, products, related, SHOP } from "@/lib/products";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) return {};
  return {
    title: `${p.brand} ${p.name} ${p.volume}`,
    description: `${p.brand} ${p.name} (${p.volume}) – ${priceLabel(p)}.`,
    openGraph: { images: [p.image] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();

  const images = p.images;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.brand} ${p.name}`,
    brand: { "@type": "Brand", name: p.brand },
    image: images,
    offers: {
      "@type": "Offer",
      priceCurrency: "RSD",
      price: p.price,
      availability: p.soldOut ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <div className="container-x pt-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-8 text-xs uppercase tracking-[0.18em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gold">Početna</Link> /{" "}
        <Link href={`/parfemi/${p.gender}`} className="hover:text-gold">{genderLabels[p.gender]}</Link> / <span className="text-ink">{p.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        <Gallery images={images} alt={`${p.brand} ${p.name}`} />

        <div className="lg:pt-6">
          <Link href={`/parfemi?brend=${encodeURIComponent(p.brand)}`} className="eyebrow hover:text-gold-soft">
            {p.brand}
          </Link>
          <h1 className="mt-3 font-serif text-5xl leading-tight md:text-6xl">{p.name}</h1>
          <div className="mt-4 flex items-center gap-4 text-sm text-muted">
            <span>{p.volume}</span>
            <span>·</span>
            <span>{genderLabels[p.gender]}</span>
            {p.rating ? (
              <>
                <span>·</span>
                <span className="text-gold">★ {p.rating.toFixed(1)}</span>
              </>
            ) : null}
          </div>

          {!p.variants && <p className="mt-8 font-serif text-4xl">{priceLabel(p)}</p>}

          <div className="mt-8 max-w-md">
            <AddToCart slug={p.slug} soldOut={p.soldOut} variants={p.variants} />
          </div>

          <ul className="mt-10 space-y-3 border-t border-line pt-8 text-sm text-ink/80">
            <li>✦ Prodavnica u Leskovcu, Janka Veselinovića 3</li>
            <li>✦ Pitanja o mirisu? Pozovite {SHOP.phone}</li>
          </ul>

          {p.description && (
            <div className="mt-10 space-y-4 border-t border-line pt-8 leading-relaxed text-ink/80">
              {p.description.map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          )}

          {p.notes && (
            <div className="mt-10 border-t border-line pt-8">
              <h2 className="eyebrow mb-6">Piramida mirisa</h2>
              <dl className="space-y-5">
                {(
                  [
                    ["Gornje note", p.notes.top],
                    ["Srednje note", p.notes.heart],
                    ["Baza", p.notes.base],
                  ] as const
                ).map(([label, list]) => (
                  <div key={label} className="grid grid-cols-[8rem_1fr] gap-4">
                    <dt className="text-xs uppercase tracking-[0.18em] text-muted">{label}</dt>
                    <dd className="font-serif text-xl">{list.join(" · ")}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      <section className="mt-28">
        <h2 className="mb-10 font-serif text-4xl">Možda će vam se svideti</h2>
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {related(p).map((r) => (
            <ProductCard key={r.slug} product={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
