import type { Metadata } from "next";
import { ContactForm } from "@/components/shop/ContactForm";
import { MapEmbed } from "@/components/shop/MapEmbed";
import { SHOP } from "@/lib/products";

export const metadata: Metadata = { title: "Kontakt", description: "Kontaktirajte One Perfume – Leskovac." };

export default function Page() {
  return (
    <div className="container-x pt-16">
      <p className="eyebrow">Kontakt</p>
      <h1 className="mt-3 mb-14 font-serif text-5xl md:text-6xl">Javite nam se</h1>
      <div className="grid gap-16 lg:grid-cols-2">
        <div className="space-y-10">
          <div>
            <h2 className="eyebrow mb-3">Adresa</h2>
            <p className="font-serif text-2xl">{SHOP.address}</p>
          </div>
          <div>
            <h2 className="eyebrow mb-3">Telefon</h2>
            <a href={`tel:${SHOP.phoneHref}`} className="font-serif text-2xl hover:text-gold">{SHOP.phone}</a>
          </div>
          <div>
            <h2 className="eyebrow mb-3">Email</h2>
            <a href={`mailto:${SHOP.email}`} className="font-serif text-2xl hover:text-gold">{SHOP.email}</a>
          </div>
          <div>
            <h2 className="eyebrow mb-3">Radno vreme</h2>
            <ul className="max-w-sm space-y-2">
              {SHOP.hours.map(([d, h]) => (
                <li key={d} className="flex justify-between border-b border-line pb-2 text-sm"><span>{d}</span><span className="text-gold">{h}</span></li>
              ))}
            </ul>
          </div>
          <div className="text-xs leading-relaxed text-muted">
            OnePerfume · Matični broj: {SHOP.company.mb} · PIB: {SHOP.company.pib}
            <br />Žiro račun: {SHOP.company.ziro}
          </div>
        </div>
        <ContactForm />
      </div>
      <div className="mt-20">
        <p className="eyebrow">Lokacija</p>
        <h2 className="mt-3 mb-8 font-serif text-4xl">Posetite nas u Leskovcu</h2>
        <MapEmbed className="h-[26rem]" />
      </div>
    </div>
  );
}
