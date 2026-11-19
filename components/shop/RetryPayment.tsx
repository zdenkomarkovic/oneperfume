"use client";

import { useState } from "react";

export function RetryPayment({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function retry() {
    setBusy(true);
    setErr("");
    try {
      const r = await fetch("/api/placanje/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.redirectUrl) {
        window.location.href = d.redirectUrl;
        return;
      }
      setErr(d.error ?? "Plaćanje trenutno nije moguće.");
    } catch {
      setErr("Greška u vezi. Pokušajte ponovo.");
    }
    setBusy(false);
  }

  return (
    <div className="mt-10">
      <button onClick={retry} disabled={busy} className="btn btn-gold">{busy ? "Preusmeravanje…" : "Pokušaj ponovo"}</button>
      {err && <p className="mt-4 text-sm text-red-400">{err}</p>}
    </div>
  );
}
