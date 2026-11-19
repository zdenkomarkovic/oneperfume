import type { Metadata } from "next";
import { LegalPage, Sec } from "@/components/legal/LegalPage";
import { SHOP } from "@/lib/products";

export const metadata: Metadata = { title: "Isporuka i plaćanje", description: "Načini plaćanja, rokovi i troškovi isporuke." };

export default function Page() {
  return (
    <LegalPage title="Isporuka i plaćanje">
      <Sec title="Isporuka">
        <p>Pošiljke isporučujemo kurirskom službom na teritoriji Republike Srbije. Nakon porudžbine javljamo vam se radi potvrde, a pošiljka se šalje u najkraćem mogućem roku, u pravilu u roku od 1–3 radna dana od potvrde.</p>
        <p>Cenu dostave obračunava kurirska služba prema svom cenovniku i plaća se kuriru pri preuzimanju, osim ako nije drugačije navedeno u potvrdi porudžbine.</p>
        <p>Prilikom preuzimanja proverite da li je ambalaža neoštećena. U slučaju vidnog oštećenja, napravite zapisnik sa kurirom i obavestite nas.</p>
      </Sec>
      <Sec title="Načini plaćanja">
        <ul>
          <li><strong>Pouzećem</strong> – gotovinom kuriru pri preuzimanju pošiljke.</li>
          <li><strong>Platnim karticama online</strong> (Visa, Mastercard, Dina) – plaćanje se vrši na zaštićenoj stranici banke. Podaci o kartici ne prolaze kroz naš sajt i ne čuvamo ih. Transakcije se izvršavaju u dinarima (RSD).</li>
        </ul>
        <div className="flex flex-wrap gap-3 pt-2 text-xs uppercase tracking-widest text-muted">
          <span className="border border-line px-3 py-1">Visa</span>
          <span className="border border-line px-3 py-1">Mastercard</span>
          <span className="border border-line px-3 py-1">Dina</span>
        </div>
      </Sec>
      <Sec title="Povraćaj novca">
        <p>U slučaju odustanka ili uspešne reklamacije novac se vraća istim sredstvom kojim je plaćanje izvršeno (za kartice – na karticu kojom je plaćeno), u roku propisanom zakonom.</p>
      </Sec>
      <Sec title="Kontakt">
        <p>Pitanja o isporuci i plaćanju: {SHOP.phone} (radnim danima 08–16h) ili {SHOP.email}.</p>
      </Sec>
    </LegalPage>
  );
}
