import { NextResponse } from "next/server";
import { z } from "zod";
import { exec } from "@/lib/db";
import { getOrderByToken } from "@/lib/orders";
import { getProvider } from "@/lib/payments";

/** Ponovni pokušaj plaćanja za porudžbinu koja čeka uplatu (npr. kartica odbijena). */
export async function POST(req: Request) {
  const parsed = z.object({ token: z.string() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Neispravan zahtev" }, { status: 400 });

  const o = await getOrderByToken(parsed.data.token);
  const provider = getProvider();
  if (!o || o.payment_method !== "kartica" || o.payment_status === "placeno" || o.status !== "ceka_placanje" || !provider) {
    return NextResponse.json({ error: "Plaćanje nije moguće" }, { status: 400 });
  }
  try {
    const session = await provider.createSession({
      id: o.id,
      token: o.public_token,
      total: o.total,
      email: o.email,
      name: o.name,
      description: `Porudžbina #${o.id} – One Perfume`,
    });
    await exec("UPDATE orders SET payment_status = 'cekanje' WHERE id = ?", [o.id]);
    return NextResponse.json({ ok: true, redirectUrl: session.url });
  } catch (e) {
    console.error("[payment:retry]", e);
    return NextResponse.json({ error: "Plaćanje trenutno nije moguće" }, { status: 502 });
  }
}
