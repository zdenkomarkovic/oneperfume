import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { notifyOrder } from "@/lib/orders";
import { getProvider } from "@/lib/payments";
import type { ResultSetHeader } from "mysql2";
import { exec, query, tx } from "@/lib/db";
import { formatPrice } from "@/lib/products";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(150),
  address: z.string().trim().min(3).max(200),
  city: z.string().trim().min(2).max(100),
  zip: z.string().trim().min(3).max(10),
  note: z.string().trim().max(1000).optional(),
  accept: z.literal("on"),
  paymentMethod: z.enum(["pouzece", "kartica"]).default("pouzece"),
  items: z.array(z.object({ slug: z.string(), qty: z.number().int().min(1).max(20), variant: z.string().max(30).optional() })).min(1).max(50),
});

interface Row {
  id: number;
  slug: string;
  name: string;
  brand: string;
  price: number;
  volume: string;
  sold_out: number;
}

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Neispravni podaci" }, { status: 400 });
  const d = parsed.data;
  const provider = d.paymentMethod === "kartica" ? getProvider() : null;
  if (d.paymentMethod === "kartica" && !provider) return NextResponse.json({ error: "Plaćanje karticom trenutno nije dostupno" }, { status: 400 });

  // Cene se uvek računaju na serveru iz baze, ne veruje se klijentu.
  const slugs = [...new Set(d.items.map((i) => i.slug))];
  const prods = await query<Row>("SELECT id, slug, name, brand, price, volume, sold_out FROM products WHERE slug IN (?)", [slugs]);
  const vars = await query<{ product_id: number; label: string; price: number }>(
    "SELECT product_id, label, price FROM product_variants WHERE product_id IN (?)",
    [prods.length ? prods.map((p) => p.id) : [0]],
  );

  let total = 0;
  const items: { productId: number; title: string; variant: string | null; qty: number; price: number }[] = [];
  for (const it of d.items) {
    const p = prods.find((x) => x.slug === it.slug);
    if (!p || p.sold_out) return NextResponse.json({ error: `Proizvod nije dostupan: ${it.slug}` }, { status: 400 });
    const pv = vars.filter((v) => v.product_id === p.id);
    let price = p.price;
    if (it.variant) {
      const v = pv.find((x) => x.label === it.variant);
      if (!v) return NextResponse.json({ error: `Neispravna varijanta: ${it.slug}` }, { status: 400 });
      price = v.price;
    } else if (pv.length) {
      return NextResponse.json({ error: `Izaberite varijantu: ${it.slug}` }, { status: 400 });
    }
    total += price * it.qty;
    const title = `${p.brand} ${p.name} ${it.variant ?? p.volume}`.trim();
    items.push({ productId: p.id, title, variant: it.variant ?? null, qty: it.qty, price });
  }

  // Porudžbina se prvo upisuje u bazu – tako se ne gubi ni kad mail ne prođe.
  const token = crypto.randomBytes(16).toString("hex");
  let orderId: number;
  try {
    orderId = await tx(async (c) => {
      const [r] = await c.query<ResultSetHeader>(
        "INSERT INTO orders (name, phone, email, address, city, zip, note, total, payment_method, status, public_token) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
        [d.name, d.phone, d.email, d.address, d.city, d.zip, d.note || null, total, d.paymentMethod, d.paymentMethod === "kartica" ? "ceka_placanje" : "novo", token],
      );
      for (const i of items)
        await c.query("INSERT INTO order_items (order_id, product_id, title, variant, qty, unit_price) VALUES (?,?,?,?,?,?)", [
          r.insertId, i.productId, i.title, i.variant, i.qty, i.price,
        ]);
      return r.insertId;
    });
  } catch (e) {
    console.error("[order:db]", e);
    return NextResponse.json({ error: "Greška pri čuvanju porudžbine" }, { status: 500 });
  }

  // Kartica: porudžbina čeka plaćanje, mejlovi idu tek kad procesor potvrdi uplatu.
  if (provider) {
    try {
      const session = await provider.createSession({
        id: orderId,
        token,
        total,
        email: d.email,
        name: d.name,
        description: `Porudžbina #${orderId} – One Perfume`,
      });
      return NextResponse.json({ ok: true, orderId, total, token, redirectUrl: session.url });
    } catch (e) {
      console.error("[payment:create]", e);
      await exec("UPDATE orders SET payment_status = 'neuspelo' WHERE id = ?", [orderId]);
      return NextResponse.json({ ok: false, orderId, token, error: "Plaćanje karticom trenutno nije moguće. Pokušajte ponovo ili izaberite plaćanje pouzećem." }, { status: 502 });
    }
  }

  // Pouzeće: obaveštenja odmah. Porudžbina je sačuvana i vidljiva u admin panelu čak i ako mail ne prođe.
  const mailSent = await notifyOrder(orderId).catch((e) => {
    console.error("[notify]", e);
    return false;
  });
  return NextResponse.json({ ok: true, orderId, total, mailSent });
}
