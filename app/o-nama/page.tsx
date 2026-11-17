import type { Metadata } from "next";
import Link from "next/link";
import { SHOP } from "@/lib/products";

export const metadata: Metadata = { title: "O nama", description: "One Perfume – mirisom ispričana priča." };

export default function Page() {
  return (
    <div className="container-x pt-16">
      <p className="eyebrow">O nama</p>
      <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">One Perfume – mirisom ispričana priča</h1>
      <div className="mt-14 grid gap-12 md:grid-cols-2">
        <div className="space-y-6 text-lg leading-relaxed text-ink/80">
          <p>Dobrodošli u One Perfume, novo domaće preduzeće nastalo iz ljubavi prema svetu mirisa.</p>
          <p>
            Naša misija je jednostavna: da vam približimo parfeme na pravi način i pomognemo vam da pronađete onaj koji savršeno izražava vašu ličnost.
          </p>
          <p>
            Verujemo da parfem ima moć da probudi emocije, oživi uspomene i istakne vašu autentičnost. Zato pažljivo osluškujemo tržište, prateći vaše želje i potrebe, kako bismo stalno rasli i napredovali zajedno sa vama.
          </p>
          <p className="font-serif text-2xl text-gold-soft">
            U One Perfume svetu svaka kap mirisa nosi priču – priču o ukusu, stilu i karakteru. Svaki miris ima svoju priču, a vi ste njen najvažniji deo.
          </p>
          <Link href="/parfemi" className="btn btn-gold mt-4">Pogledaj ponudu</Link>
        </div>
        <div className="h-fit border border-line bg-surface p-10">
          <h2 className="font-serif text-3xl">Posetite nas</h2>
          <p className="mt-4 text-muted">{SHOP.address}</p>
          <ul className="mt-6 space-y-2 text-sm">
            {SHOP.hours.map(([d, h]) => (
              <li key={d} className="flex justify-between border-b border-line pb-2"><span>{d}</span><span className="text-gold">{h}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
