import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mail";
import { customerConfirmationHtml, customerConfirmationText } from "@/lib/mail-templates";
import { formatPrice, getProduct, unitPrice } from "@/lib/products";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(150),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  zip: z.string().trim().min(3).max(10),
  note: z.string().trim().max(1000).optional(),
  items: z.array(z.object({ slug: z.string(), qty: z.number().int().min(1).max(20), variant: z.string().max(30).optional() })).min(1).max(50),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Neispravni podaci" }, { status: 400 });
  const d = parsed.data;

  // Cene se uvek računaju na serveru, ne veruje se klijentu.
  let total = 0;
  const lines: string[] = [];
  const rows: { qty: number; title: string; price: string }[] = [];
  for (const it of d.items) {
    const p = getProduct(it.slug);
    if (!p || p.soldOut) return NextResponse.json({ error: `Proizvod nije dostupan: ${it.slug}` }, { status: 400 });
    const price = unitPrice(p, it.variant);
    total += price * it.qty;
    rows.push({ qty: it.qty, title: `${p.brand} ${p.name} ${it.variant ?? p.volume}`, price: formatPrice(price * it.qty) });
    lines.push(`${it.qty} × ${p.brand} ${p.name} ${it.variant ?? p.volume} – ${formatPrice(price * it.qty)}`);
  }

  const text = [
    `Kupac: ${d.name}`,
    `Telefon: ${d.phone}`,
    `Email: ${d.email}`,
    `Adresa: ${d.address}, ${d.zip} ${d.city}`,
    d.note ? `Napomena: ${d.note}` : "",
    "",
    ...lines,
    "",
    `Ukupno: ${formatPrice(total)} (plaćanje pouzećem)`,
  ].join("\n");

  const ok = await sendMail(`Nova porudžbina – ${d.name}`, text, d.email);

  // Potvrda kupcu – greška ovde ne sme da obori porudžbinu koja je već stigla vlasniku.
  if (ok) {
    const mail = { name: d.name, rows, total: formatPrice(total), address: `${d.address}, ${d.zip} ${d.city}` };
    await sendMail("Primili smo vašu porudžbinu – One Perfume", customerConfirmationText(mail), undefined, {
      to: d.email,
      html: customerConfirmationHtml(mail),
    }).catch((e) => console.error("[mail:confirm]", e));
  }

  return NextResponse.json({ ok, total }, { status: ok ? 200 : 502 });
}
