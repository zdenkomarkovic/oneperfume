import type { Metadata } from "next";
import { ContactForm } from "@/components/shop/ContactForm";
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
            <h2 className="eyebrow mb-3">Telefon</h2>
            <a href={`tel:${SHOP.phoneHref}`} className="font-serif text-2xl hover:text-gold">{SHOP.phone}</a>
          </div>
          <div>
            <h2 className="eyebrow mb-3">Email</h2>
            <a href={`mailto:${SHOP.email}`} className="font-serif text-2xl hover:text-gold">{SHOP.email}</a>
          </div>
          <div>
            <h2 className="eyebrow mb-3">Radno vreme</h2>
            <p className="max-w-sm text-sm leading-relaxed">One Perfume web shop radi 00–24 / 365 dana u godini</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">
              Kontakt centar: radnim danima od 08–16h:{" "}
              <a href={`tel:${SHOP.phoneHref}`} className="text-gold hover:underline">{SHOP.phone}</a>
            </p>
          </div>
          <div className="text-xs leading-relaxed text-muted">
            OnePerfume · Matični broj: {SHOP.company.mb} · PIB: {SHOP.company.pib}
            <br />Žiro račun: {SHOP.company.ziro}
          </div>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
