import Image from "next/image";
import Link from "next/link";
import { MapEmbed } from "@/components/shop/MapEmbed";
import { SHOP } from "@/lib/products";

export function Footer() {
  return (
    <footer className="mt-32 border-t border-line bg-surface">
      <div className="container-x grid gap-12 py-16 md:grid-cols-4">
        <div className="md:col-span-1">
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
            <li><Link className="hover:text-gold" href="/parfemi/muski">Muški parfemi</Link></li>
            <li><Link className="hover:text-gold" href="/parfemi/zenski">Ženski parfemi</Link></li>
            <li><Link className="hover:text-gold" href="/parfemi/unisex">Unisex</Link></li>
            <li><Link className="hover:text-gold" href="/parfemi/zenski-setovi">Setovi</Link></li>
            <li><Link className="hover:text-gold" href="/brendovi">Brendovi</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-5">Kontakt</h3>
          <ul className="space-y-3 text-sm text-ink/80">
            <li>{SHOP.address}</li>
            <li><a className="hover:text-gold" href={`tel:${SHOP.phoneHref}`}>{SHOP.phone}</a></li>
            <li><a className="hover:text-gold" href={`mailto:${SHOP.email}`}>{SHOP.email}</a></li>
          </ul>

          <h3 className="eyebrow mb-4 mt-8">Radno vreme</h3>
          <ul className="space-y-3 text-sm text-ink/80">
            {SHOP.hours.map(([d, h]) => (
              <li key={d} className="flex justify-between gap-4">
                <span>{d}</span>
                <span className="text-muted">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow mb-5">Lokacija</h3>
          <MapEmbed className="h-52" />
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
