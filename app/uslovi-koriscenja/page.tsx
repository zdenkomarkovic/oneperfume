import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, Sec } from "@/components/legal/LegalPage";
import { SHOP } from "@/lib/products";

export const metadata: Metadata = { title: "Uslovi korišćenja", description: "Opšti uslovi korišćenja i kupovine na sajtu One Perfume." };

export default function Page() {
  return (
    <LegalPage title="Uslovi korišćenja" intro="Opšti uslovi prodaje i korišćenja sajta. Slanjem porudžbine potvrđujete da ste ih pročitali i da ih prihvatate.">
      <Sec title="1. Podaci o prodavcu">
        <ul>
          <li>Naziv: {SHOP.name} (OnePerfume)</li>
          <li>Adresa: {SHOP.address}</li>
          <li>Matični broj: {SHOP.company.mb}</li>
          <li>PIB: {SHOP.company.pib}</li>
          <li>Žiro račun: {SHOP.company.ziro}</li>
          <li>Telefon: <a href={`tel:${SHOP.phoneHref}`}>{SHOP.phone}</a></li>
          <li>Email: <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a></li>
        </ul>
      </Sec>
      <Sec title="2. Predmet">
        <p>Ovi uslovi uređuju kupovinu proizvoda putem sajta One Perfume. Prodajemo parfeme i srodne proizvode. Opisi, fotografije i cene na sajtu su informativnog karaktera; zadržavamo pravo ispravke očiglednih grešaka.</p>
      </Sec>
      <Sec title="3. Cene">
        <p>Sve cene su izražene u dinarima (RSD). Cena dostave nije uključena u cenu proizvoda; obračunava je kurirska služba prema svom cenovniku. Važi cena prikazana u trenutku slanja porudžbine.</p>
      </Sec>
      <Sec title="4. Porudžbina i zaključenje ugovora">
        <p>Porudžbinu šaljete popunjavanjem forme i potvrdom dugmeta za slanje. Ugovor je zaključen kada vam potvrdimo porudžbinu. Zadržavamo pravo da odbijemo ili otkažemo porudžbinu ako proizvod nije dostupan ili su podaci neispravni; u tom slučaju svaka eventualna uplata biće vraćena.</p>
      </Sec>
      <Sec title="5. Plaćanje i isporuka">
        <p>Načini plaćanja, rokovi i troškovi isporuke opisani su na stranici <Link href="/isporuka-i-placanje">Isporuka i plaćanje</Link>.</p>
      </Sec>
      <Sec title="6. Pravo na odustanak i reklamacije">
        <p>Uslovi za odustanak od ugovora, povraćaj robe i reklamacije opisani su na stranici <Link href="/reklamacije-i-povracaj">Reklamacije i povraćaj</Link>.</p>
      </Sec>
      <Sec title="7. Zaštita podataka">
        <p>Podatke o ličnosti obrađujemo u skladu sa <Link href="/politika-privatnosti">Politikom privatnosti</Link>.</p>
      </Sec>
      <Sec title="8. Intelektualna svojina">
        <p>Sadržaj sajta (tekstovi, fotografije, logotip) vlasništvo je prodavca ili se koristi uz dozvolu nosilaca prava. Zabranjeno je kopiranje bez pisane saglasnosti. Nazivi brendova pripadaju njihovim vlasnicima.</p>
      </Sec>
      <Sec title="9. Rešavanje sporova">
        <p>Sporove nastojimo da rešimo sporazumno. Potrošač ima pravo da se obrati nadležnom telu za vansudsko rešavanje potrošačkih sporova. Za sudske sporove nadležan je sud u skladu sa zakonom Republike Srbije.</p>
      </Sec>
      <Sec title="10. Izmene uslova">
        <p>Zadržavamo pravo izmene ovih uslova. Za porudžbinu važe uslovi objavljeni u trenutku njenog slanja.</p>
      </Sec>
    </LegalPage>
  );
}
