"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/components/shop/CartProvider";
import { formatPrice } from "@/lib/products";

export default function CheckoutPage() {
  const { lines, total, clear } = useCart();
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");
  const [cardEnabled, setCardEnabled] = useState(false);
  const [method, setMethod] = useState<"pouzece" | "kartica">("pouzece");
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    fetch("/api/placanje/config")
      .then((r) => r.json())
      .then((d) => setCardEnabled(!!d.card))
      .catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const form = Object.fromEntries(new FormData(e.currentTarget));
    try {
      const r = await fetch("/api/porudzbina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, paymentMethod: method, items: lines.map((l) => ({ slug: l.product.slug, qty: l.qty, variant: l.variant })) }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.redirectUrl) {
        // Kartica: porudžbina je sačuvana, korpa se prazni, a kupac ide na stranicu za plaćanje.
        clear();
        window.location.href = d.redirectUrl;
        return;
      }
      if (r.ok) {
        clear();
        setState("ok");
      } else {
        setErrMsg(d.error ?? "");
        setState("err");
      }
    } catch {
      setState("err");
    }
  }

  if (state === "ok") {
    return (
      <div className="container-x py-32 text-center">
        <p className="eyebrow">Hvala vam</p>
        <h1 className="mt-4 font-serif text-6xl">Porudžbina je primljena</h1>
        <p className="mx-auto mt-6 max-w-md text-muted">Javićemo vam se uskoro radi potvrde. Pošiljku šaljemo kurirskom službom, a plaćate kuriru pri preuzimanju.</p>
        <Link href="/parfemi" className="btn btn-gold mt-10">Nastavi kupovinu</Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="container-x py-32 text-center">
        <h1 className="font-serif text-5xl text-muted">Korpa je prazna</h1>
        <Link href="/parfemi" className="btn btn-gold mt-8">Pogledaj parfeme</Link>
      </div>
    );
  }

  return (
    <div className="container-x pt-16">
      <p className="eyebrow">Porudžbina</p>
      <h1 className="mt-3 mb-12 font-serif text-5xl md:text-6xl">Podaci za dostavu</h1>
      <form onSubmit={onSubmit} className="grid gap-12 lg:grid-cols-[1fr_24rem]">
        <div className="grid gap-4 sm:grid-cols-2">
          <input name="name" required placeholder="Ime i prezime" className="field sm:col-span-2" autoComplete="name" />
          <input name="phone" required placeholder="Telefon" type="tel" className="field" autoComplete="tel" />
          <input name="email" required placeholder="Email" type="email" className="field" autoComplete="email" />
          <input name="address" required placeholder="Ulica i broj" className="field sm:col-span-2" autoComplete="street-address" />
          <input name="zip" required placeholder="Poštanski broj" className="field" autoComplete="postal-code" />
          <input name="city" required placeholder="Grad" className="field" autoComplete="address-level2" />
          <textarea name="note" rows={4} placeholder="Napomena (opciono)" className="field resize-none sm:col-span-2" />

          <fieldset className="mt-4 sm:col-span-2">
            <legend className="eyebrow mb-4">Način plaćanja</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["pouzece", "Pouzećem", "Plaćate kuriru pri preuzimanju pošiljke"],
                  ...(cardEnabled ? [["kartica", "Karticom online", "Visa, Mastercard, Dina – bezbedno na stranici banke"]] : []),
                ] as const
              ).map(([v, t, d]) => (
                <label
                  key={v}
                  className={`flex cursor-pointer gap-3 border p-4 transition-colors ${method === v ? "border-gold bg-surface" : "border-line hover:border-gold/50"}`}
                >
                  <input type="radio" name="pm" checked={method === v} onChange={() => setMethod(v as "pouzece" | "kartica")} className="mt-1 accent-[#e8dfcf]" />
                  <span>
                    <span className="block text-sm font-medium">{t}</span>
                    <span className="block text-xs text-muted">{d}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <aside className="h-fit border border-line bg-surface p-8">
          <h2 className="font-serif text-3xl">Vaša porudžbina</h2>
          <ul className="mt-6 space-y-3 text-sm">
            {lines.map(({ key, product: p, variant, price, qty }) => (
              <li key={key} className="flex justify-between gap-4">
                <span>{qty} × {p.brand} {p.name}{variant ? ` (${variant})` : ""}</span>
                <span className="shrink-0">{formatPrice(price * qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-baseline justify-between border-t border-line pt-6">
            <span className="eyebrow !text-muted">Ukupno</span>
            <span className="font-serif text-3xl">{formatPrice(total)}</span>
          </div>
          <p className="mt-4 text-xs text-muted">Cene su u dinarima (RSD). Pošiljku isporučuje kurirska služba, a cenu dostave obračunava kurir prema svom cenovniku i ona nije uključena u iznos iznad. Više u <Link href="/isporuka-i-placanje" className="text-gold underline">Isporuka i plaćanje</Link>.</p>
          <label className="mt-6 flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-muted">
            <input type="checkbox" name="accept" required className="mt-0.5 accent-[#e8dfcf]" />
            <span>
              Pročitao/la sam i prihvatam <Link href="/uslovi-koriscenja" target="_blank" className="text-gold underline">Uslove korišćenja</Link>,{" "}
              <Link href="/politika-privatnosti" target="_blank" className="text-gold underline">Politiku privatnosti</Link> i{" "}
              <Link href="/reklamacije-i-povracaj" target="_blank" className="text-gold underline">uslove povraćaja</Link>.
            </span>
          </label>
          <button disabled={state === "sending"} className="btn btn-gold mt-6 w-full">
            {state === "sending" ? "Slanje…" : "Poručujem sa obavezom plaćanja"}
          </button>
          {state === "err" && <p className="mt-4 text-sm text-red-400">{errMsg || "Došlo je do greške. Pokušajte ponovo ili nas pozovite."}</p>}
        </aside>
      </form>
    </div>
  );
}
