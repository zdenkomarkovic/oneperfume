import Image from "next/image";
import Link from "next/link";
import { SHOP, type Category } from "@/lib/products";

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-32 border-t border-line bg-surface">
      <div className="container-x grid gap-12 py-16 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="sm:col-span-2 md:col-span-1">
          <Link href="/" aria-label="One Perfume – početna">
            <Image src="/logo-dark.png" alt="One Perfume" width={637} height={346} className="h-28 w-auto" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Mirisom ispričana priča. Novo domaće preduzeće nastalo iz ljubavi prema svetu mirisa.
          </p>
        </div>

        <div>
          <h3 className="eyebrow mb-5">Prodavnica</h3>
          <ul className="space-y-3 text-sm text-ink/80">
            <li><Link className="hover:text-gold" href="/parfemi">Svi parfemi</Link></li>
            {categories.map((c) => (
              <li key={c.slug}><Link className="hover:text-gold" href={`/parfemi/${c.slug}`}>{c.name}</Link></li>
            ))}
            <li><Link className="hover:text-gold" href="/brendovi">Brendovi</Link></li>
            <li><Link className="hover:text-gold" href="/o-nama">O nama</Link></li>
            <li><Link className="hover:text-gold" href="/kontakt">Kontakt</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-5">Kontakt</h3>
          <ul className="space-y-3 text-sm text-ink/80">
            <li><a className="hover:text-gold" href={`tel:${SHOP.phoneHref}`}>{SHOP.phone}</a></li>
            <li><a className="hover:text-gold" href={`mailto:${SHOP.email}`}>{SHOP.email}</a></li>
          </ul>

          <h3 className="eyebrow mb-4 mt-8">Radno vreme</h3>
          <ul className="space-y-3 text-sm">
            <li className="text-ink/80">Web shop: 00–24 / 365 dana u godini</li>
            <li className="text-muted">Kontakt centar: radnim danima 08–16h</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col justify-between gap-2 py-6 text-xs text-muted md:flex-row">
          <span>© 2026 OnePerfume · PIB {SHOP.company.pib} · MB {SHOP.company.mb}</span>
          <span>
            Izrada sajta{" "}
            <a href="https://manikamwebsolutions.com/" target="_blank" rel="noopener noreferrer" className="hover:text-gold">
              Manikam Web Solutions
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
