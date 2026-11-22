import type { Metadata } from "next";
import { LegalPage, Sec } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Politika kolačića", description: "Informacije o kolačićima na sajtu One Perfume.", alternates: { canonical: "/politika-kolacica" } };

export default function Page() {
  return (
    <LegalPage title="Politika kolačića">
      <Sec title="Šta su kolačići">
        <p>Kolačići su male tekstualne datoteke koje sajt čuva u vašem pregledaču.</p>
      </Sec>
      <Sec title="Šta koristimo">
        <p>Sajt koristi isključivo tehnički neophodne podatke potrebne za rad prodavnice (npr. čuvanje sadržaja korpe u vašem pregledaču). Ne koristimo kolačiće za analitiku, praćenje niti oglašavanje, pa za njih nije potrebna saglasnost.</p>
        <p>Ako u budućnosti uvedemo analitičke ili marketinške kolačiće, tražićemo vašu saglasnost i ažurirati ovu stranicu.</p>
      </Sec>
      <Sec title="Upravljanje kolačićima">
        <p>Kolačiće možete obrisati ili blokirati u podešavanjima pregledača. Blokiranje tehničkih podataka može uticati na rad korpe.</p>
      </Sec>
    </LegalPage>
  );
}
