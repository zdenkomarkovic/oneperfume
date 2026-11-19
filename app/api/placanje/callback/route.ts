import { NextResponse } from "next/server";
import { markFailed, markPaid } from "@/lib/orders";
import { getProvider } from "@/lib/payments";

/**
 * Server-to-server obaveštenje procesora o ishodu plaćanja.
 * Jedino ovde (i nikad na osnovu povratka kupca na sajt) porudžbina postaje plaćena.
 * Provera potpisa je odgovornost provider.parseCallback – nevažeći zahtev se odbija.
 */
export async function POST(req: Request) {
  const provider = getProvider();
  if (!provider) return NextResponse.json({ error: "Plaćanje nije uključeno" }, { status: 404 });

  let result;
  try {
    result = await provider.parseCallback(req);
  } catch (e) {
    console.error("[payment:callback]", e);
    return NextResponse.json({ error: "Neispravan zahtev" }, { status: 400 });
  }
  if (!result) return NextResponse.json({ ok: true });

  if (result.status === "placeno") {
    const r = await markPaid(result.token, result.transactionId, result.amount);
    if (!r.ok) return NextResponse.json({ error: r.reason }, { status: 422 });
  } else {
    await markFailed(result.token);
  }
  return NextResponse.json({ ok: true });
}
