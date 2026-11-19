import "server-only";
import { revalidatePath } from "next/cache";
import { exec, query } from "./db";
import { sendMail } from "./mail";
import { customerConfirmationHtml, customerConfirmationText } from "./mail-templates";
import { formatPrice } from "./products";

interface OrderRow {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  note: string | null;
  total: number;
  payment_method: "pouzece" | "kartica";
  payment_status: "cekanje" | "placeno" | "neuspelo" | "vraceno";
  status: string;
  public_token: string;
}

export const paymentText = (o: Pick<OrderRow, "payment_method" | "payment_status">) =>
  o.payment_method === "kartica"
    ? o.payment_status === "placeno"
      ? "Plaćeno karticom"
      : "Plaćanje karticom"
    : "Plaćanje pouzećem kuriru";

export async function getOrderByToken(token: string) {
  if (!/^[a-f0-9]{32}$/.test(token)) return null;
  const [o] = await query<OrderRow>("SELECT * FROM orders WHERE public_token = ?", [token]);
  return o ?? null;
}

/** Šalje vlasniku obaveštenje o novoj porudžbini i kupcu potvrdu. Poziva se kad je porudžbina "stvarna" (pouzeće odmah, kartica tek posle uspešnog plaćanja). */
export async function notifyOrder(orderId: number) {
  const [o] = await query<OrderRow>("SELECT * FROM orders WHERE id = ?", [orderId]);
  if (!o) return false;
  const items = await query<{ title: string; qty: number; unit_price: number }>(
    "SELECT title, qty, unit_price FROM order_items WHERE order_id = ? ORDER BY id",
    [orderId],
  );
  const rows = items.map((i) => ({ qty: i.qty, title: i.title, price: formatPrice(i.unit_price * i.qty) }));
  const pay = paymentText(o);

  const text = [
    `Porudžbina #${o.id}`,
    `Kupac: ${o.name}`,
    `Telefon: ${o.phone}`,
    `Email: ${o.email}`,
    `Adresa: ${o.address}, ${o.zip} ${o.city}`,
    "Isporuka: kurirska služba",
    o.note ? `Napomena: ${o.note}` : "",
    "",
    ...rows.map((r) => `${r.qty} × ${r.title} – ${r.price}`),
    "",
    `Ukupno: ${formatPrice(o.total)} (${pay})`,
  ].join("\n");

  const ok = await sendMail(`Nova porudžbina #${o.id} – ${o.name}`, text, o.email);

  // Greška pri slanju potvrde kupcu ne sme da obori porudžbinu koja je već stigla vlasniku.
  if (ok) {
    const mail = { name: o.name, rows, total: formatPrice(o.total), address: `${o.address}, ${o.zip} ${o.city}`, payment: pay };
    await sendMail("Primili smo vašu porudžbinu – One Perfume", customerConfirmationText(mail), undefined, {
      to: o.email,
      html: customerConfirmationHtml(mail),
    }).catch((e) => console.error("[mail:confirm]", e));
  }
  return ok;
}

/**
 * Plaćanje je uspelo. Idempotentno – procesori često šalju isto obaveštenje više puta,
 * a mejlovi se šalju samo jednom. `amount` (ako ga procesor šalje) mora da se poklapa sa iznosom porudžbine.
 */
export async function markPaid(token: string, transactionId?: string, amount?: number) {
  const o = await getOrderByToken(token);
  if (!o || o.payment_method !== "kartica") return { ok: false as const, reason: "nepoznata porudžbina" };
  if (amount !== undefined && amount !== o.total) {
    console.error(`[payment] iznos se ne poklapa za #${o.id}: očekivano ${o.total}, stiglo ${amount}`);
    await exec("UPDATE orders SET payment_status = 'neuspelo', admin_note = CONCAT(COALESCE(admin_note,''), '\nIznos plaćanja se ne poklapa: ', ?) WHERE id = ? AND payment_status <> 'placeno'", [
      String(amount),
      o.id,
    ]);
    return { ok: false as const, reason: "iznos se ne poklapa" };
  }
  const r = await exec(
    "UPDATE orders SET payment_status = 'placeno', status = 'novo', transaction_id = ? WHERE id = ? AND payment_status <> 'placeno'",
    [transactionId ?? null, o.id],
  );
  if (r.affectedRows > 0) {
    await notifyOrder(o.id).catch((e) => console.error("[notify]", e));
    revalidatePath("/admin", "layout");
  }
  return { ok: true as const };
}

/** Plaćanje nije uspelo (odbijeno, otkazano). Porudžbina ostaje u "čeka plaćanje" da kupac može da pokuša ponovo. */
export async function markFailed(token: string) {
  const o = await getOrderByToken(token);
  if (!o || o.payment_method !== "kartica") return;
  await exec("UPDATE orders SET payment_status = 'neuspelo' WHERE id = ? AND payment_status = 'cekanje'", [o.id]);
  revalidatePath("/admin", "layout");
}
