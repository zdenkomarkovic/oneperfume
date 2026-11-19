import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { SITE_URL } from "@/lib/constants";
import { getBestSellers, getBrands, getProducts } from "@/lib/catalog";
import { SHOP, brandSlug } from "@/lib/products";

export const metadata: Metadata = {
  title: { absolute: "Parfimerija Leskovac – parfemi Armaf, Lattafa, Afnan | One Perfume" },
  description:
    "One Perfume – parfimerija u Leskovcu. Muški, ženski i unisex parfemi: Armaf, Lattafa, Afnan, Paris Corner, Al Haramain i drugi. Poručite online.",
  alternates: { canonical: "/" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "PerfumeStore",
  name: "One Perfume",
  description: "Parfimerija u Leskovcu – muški, ženski i unisex parfemi.",
  url: SITE_URL,
  telephone: SHOP.phone,
  email: SHOP.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Janka Veselinovića 3",
    postalCode: "16000",
    addressLocality: "Leskovac",
    addressCountry: "RS",
  },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], opens: "09:00", closes: "17:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "10:00", closes: "15:00" },
  ],
};

const categories = [
  { cat: "muski", href: "/parfemi/muski", title: "Muški", sub: "Drvenasti, začinski, sveži", slug: "armaf-club-de-nuit-lion-heart-men-100ml" },
  { cat: "zenski", href: "/parfemi/zenski", title: "Ženski", sub: "Cvetni, voćni, slatki", slug: "armaf-club-de-nuit-maleka-luksuzan-zenski-parfem-koji-spaja-svezinu-citrusa-cvetne-note-i-toplinu-vanile-elegantan-i-postojan-miris" },
  { cat: "unisex", href: "/parfemi/unisex", title: "Unisex", sub: "Za sve one bez pravila", slug: "lattafa-khamrah-100ml" },
];

const sparkles = [
  { c: "left-[8%] top-[6%]", d: "0s", s: "1.1rem" },
  { c: "right-[10%] top-[2%]", d: "1.4s", s: "0.8rem" },
  { c: "left-[2%] top-[55%]", d: "2.6s", s: "0.9rem" },
  { c: "right-[2%] top-[62%]", d: "3.4s", s: "1.2rem" },
  { c: "left-[40%] bottom-[0%]", d: "0.8s", s: "0.8rem" },
];

const heroNotes = [
  { t: "Oud", c: "left-[2%] top-[18%]", d: "0s" },
  { t: "Vanilija", c: "right-[0%] top-[28%]", d: "1.2s" },
  { t: "Amber", c: "left-[0%] bottom-[30%]", d: "2.4s" },
  { t: "Bergamot", c: "right-[4%] bottom-[18%]", d: "3.6s" },
];

export default async function HomePage() {
  const [brands, products, bestSellers] = await Promise.all([getBrands(), getProducts(), getBestSellers()]);
  const marquee = [...brands, ...brands];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* HERO */}
      <section className="hero-bg relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 top-0 h-[40rem] w-[40rem] rounded-full bg-gold/15 blur-[140px]" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-[#7a3b2a]/20 blur-[140px]" />
        <span aria-hidden className="outline-text pointer-events-none absolute -bottom-6 left-0 select-none whitespace-nowrap font-serif text-[16rem] leading-none opacity-60 max-lg:hidden">PERFUME</span>
        <div className="container-x grid items-center gap-14 py-16 lg:grid-cols-[1.1fr_1fr] lg:py-28">
          <div className="fade-up">
            <p className="eyebrow">Parfimerija One Perfume · Leskovac</p>
            <h1 className="mt-6 font-serif text-6xl leading-[0.95] sm:text-7xl lg:text-[6.5rem]">
              Dobrodošli u <em className="text-gold italic">Vaš svet</em> parfema
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted">
              Mirisom ispričana priča – od arapskih klasika do dizajnerskih brendova. Pronađite svoj potpis.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/parfemi" className="btn btn-gold glow-pulse">Pogledaj parfeme</Link>
              <Link href="/o-nama" className="btn btn-ghost">O nama</Link>
            </div>
          </div>

          <div className="fade-up relative mx-auto flex w-full max-w-md items-center justify-center py-6 lg:max-w-lg" style={{ animationDelay: "0.15s" }}>
            <div className="relative w-[78%] max-w-sm">
              <div className="sway absolute -inset-3 rounded-t-[999px] border border-gold/30" aria-hidden />
              <div className="relative aspect-[722/1000] overflow-hidden rounded-t-[999px] shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                <Image
                  src="/2151890511.jpg"
                  alt="Parfem u ambar boji na vodi"
                  fill
                  priority
                  sizes="(min-width:1024px) 400px, 80vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/50 via-transparent to-transparent" />
              </div>
            </div>
            {sparkles.map((s, i) => (
              <span key={i} aria-hidden className={`sparkle ${s.c}`} style={{ animationDelay: s.d, fontSize: s.s }}>✦</span>
            ))}
            {heroNotes.map((n) => (
              <span
                key={n.t}
                style={{ animationDelay: n.d }}
                className={`float-y absolute ${n.c} border border-gold/40 bg-bg/60 px-4 py-2 font-serif text-lg italic text-gold-soft backdrop-blur-sm`}
              >
                {n.t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Brands marquee */}
      <section className="overflow-hidden bg-paper py-5 text-bg" aria-label="Brendovi">
        <div className="marquee flex w-max gap-14 whitespace-nowrap font-serif text-3xl">
          {marquee.map((b, i) => (
            <Link key={i} href={`/parfemi?brend=${encodeURIComponent(b)}`} className="transition-opacity hover:opacity-60">
              {b} <span className="ml-14 opacity-50">—</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-x mt-28">
        <div className="grid gap-5 md:grid-cols-3">
          {categories.map((c, i) => {
            const p = products.find((x) => x.slug === c.slug) ?? products.find((x) => x.gender === c.cat && x.image);
            if (!p) return null;
            return (
              <Reveal key={c.href} delay={i * 120}>
              <Link href={c.href} className="group relative flex aspect-[4/5] items-end overflow-hidden bg-surface-2 p-8">
                <Image src={p.image} alt="" fill sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/90 from-0% via-bg/30 via-40% to-transparent to-65%" />
                <div className="relative">
                  <h3 className="font-serif text-4xl">{c.title}</h3>
                  <p className="mt-1 text-sm text-muted">{c.sub}</p>
                  <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-gold">Istraži <span className="arrow-slide">→</span></span>
                </div>
              </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Best sellers */}
      <section className="band-warm relative mt-28 py-24">
       <div className="container-x">
        <Reveal className="mb-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Najprodavanije</p>
            <h2 className="mt-3 font-serif text-5xl md:text-6xl">Best seller</h2>
          </div>
          <Link href="/parfemi" className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-gold hover:text-gold-soft sm:block">
            Svi parfemi <span className="arrow-slide">→</span>
          </Link>
        </div>
        </Reveal>
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
          {bestSellers.slice(0, 8).map((p, i) => (
            <Reveal key={p.slug} delay={(i % 4) * 100}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
       </div>
      </section>

      {/* Brands */}
      <section className="container-x mt-28">
        <p className="eyebrow">Brendovi u ponudi</p>
        <h2 className="mt-3 mb-10 font-serif text-5xl md:text-6xl">Odaberite po brendu</h2>
        <div className="flex flex-wrap gap-3">
          {brands.map((b) => (
            <Link
              key={b}
              href={`/parfemi?brend=${encodeURIComponent(b)}`}
              data-slug={brandSlug(b)}
              className="chip border border-line px-6 py-3 text-sm hover:border-gold hover:text-gold"
            >
              {b} <span className="ml-1 text-muted">{products.filter((p) => p.brand === b).length}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* SEO tekst */}
      <section className="container-x mt-28">
        <div className="max-w-3xl">
          <p className="eyebrow">O ponudi</p>
          <h2 className="mt-3 font-serif text-4xl md:text-5xl">Parfimerija One Perfume u Leskovcu</h2>
          <div className="mt-6 space-y-4 leading-relaxed text-muted">
            <p>
              One Perfume je parfimerija u Leskovcu u kojoj možete pronaći{" "}
              <Link href="/parfemi/muski" className="text-ink underline decoration-gold/40 underline-offset-4 hover:text-gold">muške parfeme</Link>,{" "}
              <Link href="/parfemi/zenski" className="text-ink underline decoration-gold/40 underline-offset-4 hover:text-gold">ženske parfeme</Link> i{" "}
              <Link href="/parfemi/unisex" className="text-ink underline decoration-gold/40 underline-offset-4 hover:text-gold">unisex parfeme</Link>, kao i{" "}
              <Link href="/parfemi/zenski-setovi" className="text-ink underline decoration-gold/40 underline-offset-4 hover:text-gold">setove</Link>.
              U ponudi su popularni arapski i orijentalni parfemi brendova Lattafa, Armaf, Afnan, Paris Corner i Al Haramain, ali i dizajnerski mirisi kao što su Calvin Klein, Guess, Lalique i Mont Blanc.
            </p>
            <p>
              Parfeme možete poručiti online ili nas posetiti u radnji na adresi {SHOP.address.split(",")[0]}. Za savet pri izboru mirisa pozovite{" "}
              <a href={`tel:${SHOP.phoneHref}`} className="text-ink hover:text-gold">{SHOP.phone}</a>.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-x mt-32">
        <div className="relative overflow-hidden bg-paper px-8 py-24 text-center text-bg">
          <div aria-hidden className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2"><span className="spin-star block select-none whitespace-nowrap font-serif text-[14rem] leading-none text-bg/[0.06]">✦</span></div>
          <p className="relative text-xs font-semibold uppercase tracking-[0.28em]">Ne znate šta da izaberete?</p>
          <h2 className="relative mx-auto mt-4 max-w-2xl font-serif text-5xl leading-tight">Pomoći ćemo vam da nađete pravi miris</h2>
          <Link href="/kontakt" className="btn relative mt-10 border-bg bg-bg text-gold-soft hover:bg-transparent hover:text-bg">Kontaktirajte nas</Link>
        </div>
      </section>
    </>
  );
}
