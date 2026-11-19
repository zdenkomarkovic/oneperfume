import Link from "next/link";
import { ClearCart } from "@/components/shop/ClearCart";
import { RetryPayment } from "@/components/shop/RetryPayment";
import { getOrderByToken } from "@/lib/orders";
import { formatPrice } from "@/lib/products";

export const metadata = { title: "Plaćanje", robots: { index: false, follow: false } };

/**
 * Kupac se vraća ovde sa stranice procesora. Stanje se čita ISKLJUČIVO iz baze
 * (koju ažurira callback), a ne iz parametara u adresi koje kupac može da izmeni.
 */
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const o = await getOrderByToken(token);

  if (!o || o.payment_method !== "kartica") {
    return (
      <div className="container-x py-32 text-center">
        <h1 className="font-serif text-5xl text-muted">Porudžbina nije pronađena</h1>
        <Link href="/parfemi" className="btn btn-gold mt-8">Nazad na prodavnicu</Link>
      </div>
    );
  }

  if (o.payment_status === "placeno") {
    return (
      <div className="container-x py-32 text-center">
        <ClearCart />
        <p className="eyebrow">Hvala vam</p>
        <h1 className="mt-4 font-serif text-6xl">Plaćanje je uspelo</h1>
        <p className="mx-auto mt-6 max-w-md text-muted">
          Porudžbina #{o.id} ({formatPrice(o.total)}) je primljena i plaćena. Potvrdu smo poslali na {o.email}. Pošiljku šaljemo kurirskom službom.
        </p>
        <Link href="/parfemi" className="btn btn-gold mt-10">Nastavi kupovinu</Link>
      </div>
    );
  }

  if (o.payment_status === "cekanje") {
    // Procesor još nije potvrdio uplatu – stranica se sama osvežava.
    return (
      <div className="container-x py-32 text-center">
        <meta httpEquiv="refresh" content="4" />
        <p className="eyebrow">Porudžbina #{o.id}</p>
        <h1 className="mt-4 font-serif text-5xl">Čekamo potvrdu plaćanja…</h1>
        <p className="mx-auto mt-6 max-w-md text-muted">Ne zatvarajte stranicu. Ovo obično traje nekoliko sekundi.</p>
      </div>
    );
  }

  return (
    <div className="container-x py-32 text-center">
      <p className="eyebrow">Porudžbina #{o.id}</p>
      <h1 className="mt-4 font-serif text-5xl">Plaćanje nije uspelo</h1>
      <p className="mx-auto mt-6 max-w-md text-muted">
        Sa kartice nije skinut novac, a porudžbina je sačuvana. Možete ponovo da pokušate sa istom ili drugom karticom, ili nas pozovite.
      </p>
      <RetryPayment token={o.public_token} />
    </div>
  );
}
