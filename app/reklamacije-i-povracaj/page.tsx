import type { Metadata } from "next";
import { LegalPage, Sec } from "@/components/legal/LegalPage";
import { SHOP } from "@/lib/products";

export const metadata: Metadata = { title: "Reklamacije i povraćaj", description: "Pravo na odustanak, povraćaj robe i reklamacije." };

export default function Page() {
  return (
    <LegalPage title="Reklamacije i povraćaj">
      <Sec title="Pravo na odustanak (14 dana)">
        <p>Kao potrošač imate pravo da bez navođenja razloga odustanete od ugovora zaključenog na daljinu u roku od <strong>14 dana</strong> od dana prijema robe. Dovoljno je da nas obavestite izričitom izjavom (npr. emailom na {SHOP.email}) ili popunjavanjem obrasca ispod.</p>
        <p>Robu vraćate najkasnije 14 dana od dana kada ste nas obavestili o odustanku, u originalnom, neoštećenom stanju i ambalaži. Troškove vraćanja robe snosi kupac. Novac vraćamo u roku od 14 dana od prijema izjave o odustanku, istim sredstvom plaćanja.</p>
        <p><strong>Izuzetak:</strong> pravo na odustanak ne primenjuje se na proizvode zapakovane radi zaštite zdravlja ili higijene čija je zaštitna ambalaža otvorena nakon isporuke (npr. otpakovan parfem).</p>
      </Sec>
      <Sec title="Obrazac za odustanak">
        <p>Popunite i pošaljite na {SHOP.email} samo ako želite da odustanete od ugovora:</p>
        <div className="border border-line bg-surface p-6 text-sm">
          <p>Prodavac: {SHOP.name} (OnePerfume), {SHOP.address}, {SHOP.email}</p>
          <p className="mt-3">Ovim obaveštavam da odstupam od ugovora o prodaji sledeće robe: ____________________</p>
          <p className="mt-2">Datum porudžbine / prijema robe: ____________________</p>
          <p className="mt-2">Ime i prezime potrošača: ____________________</p>
          <p className="mt-2">Adresa potrošača: ____________________</p>
          <p className="mt-2">Broj računa za povraćaj novca (ako je plaćeno uplatom): ____________________</p>
          <p className="mt-2">Datum i potpis: ____________________</p>
        </div>
      </Sec>
      <Sec title="Reklamacije (saobraznost robe)">
        <p>Prodavac odgovara za nesaobraznost robe ugovoru u roku od <strong>dve godine</strong> od prijema robe. Ako primite oštećen proizvod ili proizvod koji ne odgovara porudžbini, reklamaciju možete uputiti na {SHOP.email} ili telefonom {SHOP.phone}. Priložite broj porudžbine, opis problema i, ako je moguće, fotografije.</p>
        <p>Na reklamaciju odgovaramo u roku od <strong>8 dana</strong>, a rešavamo je najkasnije u roku od <strong>15 dana</strong> od prijema, zamenom, popravkom, sniženjem cene ili povraćajem novca, u skladu sa zakonom.</p>
      </Sec>
      <Sec title="Vansudsko rešavanje sporova">
        <p>Ako niste zadovoljni rešenjem reklamacije, možete se obratiti nadležnom telu za vansudsko rešavanje potrošačkih sporova ili Ministarstvu trgovine, turizma i telekomunikacija.</p>
      </Sec>
    </LegalPage>
  );
}
