import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Sec } from "@/components/legal/LegalPage";
import { SHOP } from "@/lib/products";

export const metadata: Metadata = { title: "Politika privatnosti", description: "Kako One Perfume obrađuje i štiti podatke o ličnosti." };

export default function Page() {
  return (
    <LegalPage title="Politika privatnosti" intro="Poštujemo vašu privatnost i podatke obrađujemo u skladu sa Zakonom o zaštiti podataka o ličnosti Republike Srbije.">
      <Sec title="Rukovalac podacima">
        <p>{SHOP.name} (OnePerfume), {SHOP.address}, MB {SHOP.company.mb}, PIB {SHOP.company.pib}. Kontakt: <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>, {SHOP.phone}.</p>
      </Sec>
      <Sec title="Koje podatke prikupljamo i zašto">
        <ul>
          <li><strong>Porudžbina:</strong> ime i prezime, adresa, poštanski broj, grad, telefon, email i sadržaj porudžbine. Pravni osnov: izvršenje ugovora i zakonske obaveze (računovodstvo, fiskalizacija). Koristimo ih za potvrdu, isporuku, naplatu i podršku.</li>
          <li><strong>Kontakt forma:</strong> ime, email i poruka. Pravni osnov: vaš zahtev i legitimni interes da vam odgovorimo.</li>
        </ul>
        <p>Podatke ne koristimo za marketing niti ih prodajemo trećim licima.</p>
      </Sec>
      <Sec title="Sa kim delimo podatke">
        <ul>
          <li>Kurirska služba (samo podaci neophodni za isporuku)</li>
          <li>Banka / procesor plaćanja, ako birate plaćanje karticom (podatke o kartici unosite isključivo na stranici banke; mi ih ne vidimo niti čuvamo)</li>
          <li>Računovodstvo, hosting i email usluge, u meri u kojoj je to neophodno</li>
          <li>Državni organi, kada to zahteva zakon</li>
        </ul>
      </Sec>
      <Sec title="Rok čuvanja">
        <p>Podatke o porudžbinama čuvamo u rokovima propisanim zakonom (računovodstvena dokumentacija), a ostale podatke dok je potrebno za svrhu zbog koje su prikupljeni.</p>
      </Sec>
      <Sec title="Vaša prava">
        <p>Imate pravo na pristup, ispravku, brisanje, ograničenje obrade, prenosivost podataka i prigovor na obradu. Zahtev šaljite na <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>. Imate pravo i da podnesete pritužbu Povereniku za informacije od javnog značaja i zaštitu podataka o ličnosti.</p>
      </Sec>
      <Sec title="Kolačići">
        <p>Informacije o kolačićima nalaze se u <Link href="/politika-kolacica">Politici kolačića</Link>.</p>
      </Sec>
    </LegalPage>
  );
}
