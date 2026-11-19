"use client";

import { useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    try {
      const r = await fetch("/api/kontakt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      setState(r.ok ? "ok" : "err");
      if (r.ok) form.reset();
    } catch {
      setState("err");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-line bg-surface p-8 md:p-10">
      <h2 className="font-serif text-3xl">Pošaljite poruku</h2>
      <input name="name" required placeholder="Ime i prezime" className="field" />
      <input name="email" type="email" required placeholder="Email" className="field" />
      <textarea name="message" required rows={5} placeholder="Vaša poruka" className="field resize-none" />
      <button disabled={state === "sending"} className="btn btn-gold w-full">
        {state === "sending" ? "Slanje…" : "Pošalji"}
      </button>
      {state === "ok" && <p className="text-sm text-gold">Hvala! Poruka je poslata, javićemo vam se uskoro.</p>}
      {state === "err" && <p className="text-sm text-red-400">Došlo je do greške. Pokušajte ponovo ili nas pozovite.</p>}
    </form>
  );
}
