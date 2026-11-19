import Link from "next/link";
import { ClickableRow } from "@/components/admin/ClickableRow";
import { query } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import { ORDER_STATUSES, PAYMENT_STATUS_LABEL, STATUS_LABEL, STATUS_STYLE, type OrderStatus, type PaymentStatus } from "@/lib/order-status";

export const metadata = { title: "Porudžbine" };

const PER_PAGE = 30;

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  const { status = "", q = "", page = "1" } = await searchParams;
  const conds: string[] = [];
  const args: unknown[] = [];
  if ((ORDER_STATUSES as readonly string[]).includes(status)) {
    conds.push("o.status = ?");
    args.push(status);
  }
  if (q.trim()) {
    conds.push("(o.name LIKE ? OR o.email LIKE ? OR o.phone LIKE ? OR o.id = ?)");
    args.push(`%${q.trim()}%`, `%${q.trim()}%`, `%${q.trim()}%`, Number(q.replace("#", "")) || 0);
  }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const [{ n } = { n: 0 }] = await query<{ n: number }>(`SELECT COUNT(*) n FROM orders o ${where}`, args);
  const pages = Math.max(1, Math.ceil(n / PER_PAGE));
  const cur = Math.min(Math.max(1, Number(page) || 1), pages);
  const rows = await query<{ id: number; name: string; city: string; total: number; status: OrderStatus; created_at: Date; items: number; admin_note: string | null; payment_method: "pouzece" | "kartica"; payment_status: PaymentStatus }>(
    `SELECT o.id, o.name, o.city, o.total, o.status, o.created_at, o.admin_note, o.payment_method, o.payment_status,
       (SELECT COALESCE(SUM(qty),0) FROM order_items i WHERE i.order_id = o.id) items
     FROM orders o ${where} ORDER BY o.id DESC LIMIT ? OFFSET ?`,
    [...args, PER_PAGE, (cur - 1) * PER_PAGE],
  );
  const href = (p: number, s = status) => `/admin/porudzbine?${new URLSearchParams({ ...(s && { status: s }), ...(q && { q }), page: String(p) })}`;

  return (
    <div className="max-w-6xl">
      <h1 className="font-serif text-4xl">Porudžbine <span className="text-xl text-muted">({n})</span></h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {[["", "Sve"], ...ORDER_STATUSES.map((s) => [s, STATUS_LABEL[s]])].map(([s, l]) => (
          <Link
            key={s}
            href={href(1, s)}
            className={`border px-3 py-1.5 text-xs uppercase tracking-widest ${status === s ? "border-gold text-gold" : "border-line text-muted hover:text-gold"}`}
          >
            {l}
          </Link>
        ))}
      </div>
      <form className="mt-4 flex gap-3">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Ime, email, telefon ili broj porudžbine…" className="field max-w-sm" />
        <button className="btn btn-ghost">Traži</button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[48rem] text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-muted">
            <tr><th className="pb-3 font-normal">#</th><th className="pb-3 font-normal">Kupac</th><th className="pb-3 font-normal">Datum</th><th className="pb-3 text-right font-normal">Iznos</th><th className="pb-3 text-right font-normal">Status</th><th className="pb-3 pl-6 font-normal">Beleška</th></tr>
          </thead>
          <tbody className="divide-y divide-line border-y border-line">
            {rows.map((o) => (
              <ClickableRow key={o.id} href={`/admin/porudzbine/${o.id}`}>
                <td className="py-3 pr-4"><Link href={`/admin/porudzbine/${o.id}`} className="text-gold">#{o.id}</Link></td>
                <td className="py-3 pr-4">{o.name} <span className="text-muted">· {o.city} · {o.items} kom</span></td>
                <td className="py-3 pr-4 whitespace-nowrap text-muted">{new Date(o.created_at).toLocaleString("sr-RS")}</td>
                <td className="py-3 pr-4 text-right whitespace-nowrap">{formatPrice(o.total)}</td>
                <td className="py-3 text-right">
                  <span className={`border px-2 py-0.5 text-[0.65rem] uppercase tracking-widest ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                  <span className="mt-1 block text-[0.65rem] text-muted">
                    {o.payment_method === "kartica" ? `Kartica · ${PAYMENT_STATUS_LABEL[o.payment_status]}` : "Pouzećem"}
                  </span>
                </td>
                <td className="max-w-[16rem] py-3 pl-6 text-muted">
                  {o.admin_note ? <span className="line-clamp-2 whitespace-pre-wrap text-ink/80" title={o.admin_note}>{o.admin_note}</span> : null}
                </td>
              </ClickableRow>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted">Nema porudžbina.</td></tr>}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          {cur > 1 && <Link href={href(cur - 1)} className="pg flex items-center">←</Link>}
          <span className="text-muted">{cur} / {pages}</span>
          {cur < pages && <Link href={href(cur + 1)} className="pg flex items-center">→</Link>}
        </div>
      )}
    </div>
  );
}
