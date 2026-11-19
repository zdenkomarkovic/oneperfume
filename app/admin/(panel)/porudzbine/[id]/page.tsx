import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrderAction } from "@/app/admin/actions";
import { query } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import {
  ORDER_STATUSES,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUSES,
  PAYMENT_STATUS_LABEL,
  STATUS_LABEL,
  STATUS_STYLE,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/order-status";

export const metadata = { title: "Porudžbina" };

interface Order {
  id: number;
  status: OrderStatus;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  note: string | null;
  admin_note: string | null;
  payment_method: "pouzece" | "kartica";
  payment_status: PaymentStatus;
  transaction_id: string | null;
  courier: string | null;
  tracking_number: string | null;
  total: number;
  created_at: Date;
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const [o] = await query<Order>("SELECT * FROM orders WHERE id = ?", [Number(id)]);
  if (!o) notFound();
  const items = await query<{ id: number; title: string; qty: number; unit_price: number; slug: string | null }>(
    `SELECT i.id, i.title, i.qty, i.unit_price, p.slug FROM order_items i LEFT JOIN products p ON p.id = i.product_id WHERE i.order_id = ? ORDER BY i.id`,
    [o.id],
  );

  return (
    <div className="max-w-4xl">
      <Link href="/admin/porudzbine" className="text-xs uppercase tracking-widest text-muted hover:text-gold">← Porudžbine</Link>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <h1 className="font-serif text-4xl">Porudžbina #{o.id}</h1>
        <span className={`border px-2 py-0.5 text-[0.7rem] uppercase tracking-widest ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
      </div>
      <p className="mt-2 text-sm text-muted">{new Date(o.created_at).toLocaleString("sr-RS")} · isporuka kurirskom službom</p>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="eyebrow mb-4">Kupac</h2>
          <dl className="space-y-1 text-sm">
            <dd className="font-serif text-2xl">{o.name}</dd>
            <dd><a href={`tel:${o.phone}`} className="hover:text-gold">{o.phone}</a></dd>
            <dd><a href={`mailto:${o.email}`} className="hover:text-gold">{o.email}</a></dd>
            <dd className="pt-2 text-ink/80">{o.address}<br />{o.zip} {o.city}</dd>
          </dl>
          {o.note && (
            <div className="mt-5 border-l-2 border-gold/50 pl-4 text-sm">
              <p className="text-xs uppercase tracking-widest text-muted">Napomena kupca</p>
              <p className="mt-1 whitespace-pre-wrap">{o.note}</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="eyebrow mb-4">Plaćanje</h2>
          <p className="mb-6 text-sm">
            {PAYMENT_METHOD_LABEL[o.payment_method]} · <span className="font-medium">{PAYMENT_STATUS_LABEL[o.payment_status]}</span>
            {o.transaction_id && <span className="block text-xs text-muted">Transakcija: {o.transaction_id}</span>}
          </p>
          <h2 className="eyebrow mb-4">Obrada</h2>
          <form action={updateOrderAction} className="space-y-3">
            <input type="hidden" name="id" value={o.id} />
            <select name="status" defaultValue={o.status} className="field">
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-surface">{STATUS_LABEL[s]}</option>
              ))}
            </select>
            <label className="block text-xs text-muted">
              Status plaćanja
              <select name="paymentStatus" defaultValue={o.payment_status} className="field mt-1">
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-surface">{PAYMENT_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input name="courier" defaultValue={o.courier ?? ""} placeholder="Kurirska služba" className="field" />
              <input name="tracking" defaultValue={o.tracking_number ?? ""} placeholder="Broj pošiljke" className="field" />
            </div>
            <textarea name="adminNote" rows={4} defaultValue={o.admin_note ?? ""} placeholder="Interna beleška (kupac je ne vidi)" className="field" />
            <button className="btn btn-gold">Sačuvaj</button>
          </form>
        </section>
      </div>

      <h2 className="eyebrow mb-4 mt-12">Stavke</h2>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-line border-y border-line">
          {items.map((i) => (
            <tr key={i.id}>
              <td className="py-3 pr-4">{i.slug ? <Link href={`/proizvod/${i.slug}`} target="_blank" className="hover:text-gold">{i.title}</Link> : i.title}</td>
              <td className="py-3 pr-4 text-muted">{i.qty} × {formatPrice(i.unit_price)}</td>
              <td className="py-3 text-right">{formatPrice(i.qty * i.unit_price)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2} className="pt-4 text-right text-xs uppercase tracking-widest text-muted">Ukupno</td>
            <td className="pt-4 text-right font-serif text-2xl">{formatPrice(o.total)}</td>
          </tr>
        </tfoot>
      </table>

    </div>
  );
}
