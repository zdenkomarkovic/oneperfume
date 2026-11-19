import Link from "next/link";
import { ClickableRow } from "@/components/admin/ClickableRow";
import { query } from "@/lib/db";
import { formatPrice } from "@/lib/products";
import { STATUS_LABEL, STATUS_STYLE, type OrderStatus } from "@/lib/order-status";

export const metadata = { title: "Pregled" };

export default async function Page() {
  const [[s0], recent] = await Promise.all([
    query<{ products: number; sold: number; orders: number; fresh: number; month: number; today: number; msgs: number }>(
      `SELECT
        (SELECT COUNT(*) FROM products) products,
        (SELECT COUNT(*) FROM products WHERE sold_out = 1) sold,
        (SELECT COUNT(*) FROM orders) orders,
        (SELECT COUNT(*) FROM orders WHERE status = 'novo') fresh,
        (SELECT COALESCE(SUM(total),0) FROM orders WHERE status NOT IN ('otkazano','ceka_placanje') AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) month,
        (SELECT COALESCE(SUM(total),0) FROM orders WHERE status NOT IN ('otkazano','ceka_placanje') AND DATE(created_at) = CURDATE()) today,
        (SELECT COUNT(*) FROM messages WHERE is_read = 0 AND deleted_at IS NULL) msgs`,
    ),
    query<{ id: number; name: string; total: number; status: OrderStatus; created_at: Date }>(
      "SELECT id, name, total, status, created_at FROM orders ORDER BY id DESC LIMIT 8",
    ),
  ]);

  const s = s0!;
  const cards = [
    { l: "Nove porudžbine", v: s.fresh, href: "/admin/porudzbine?status=novo", hot: s.fresh > 0 },
    { l: "Promet danas", v: formatPrice(Number(s.today)) },
    { l: "Promet ovog meseca", v: formatPrice(Number(s.month)) },
    { l: "Ukupno porudžbina", v: s.orders, href: "/admin/porudzbine" },
    { l: "Proizvoda", v: s.products, href: "/admin/proizvodi" },
    { l: "Rasprodato", v: s.sold, href: "/admin/proizvodi" },
    { l: "Nepročitane poruke", v: s.msgs, href: "/admin/poruke", hot: s.msgs > 0 },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="font-serif text-4xl">Pregled</h1>
      <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const inner = (
            <div className="h-full bg-surface p-6">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">{c.l}</p>
              <p className={`mt-3 font-serif text-3xl ${c.hot ? "text-gold-soft" : ""}`}>{c.v}</p>
            </div>
          );
          return c.href ? (
            <Link key={c.l} href={c.href} className="block transition-colors hover:[&>div]:bg-surface-2">
              {inner}
            </Link>
          ) : (
            <div key={c.l}>{inner}</div>
          );
        })}
      </div>

      <div className="mt-12 flex items-baseline justify-between">
        <h2 className="font-serif text-2xl">Poslednje porudžbine</h2>
        <Link href="/admin/porudzbine" className="text-xs uppercase tracking-widest text-gold">Sve →</Link>
      </div>
      {recent.length === 0 ? (
        <p className="mt-6 text-muted">Još nema porudžbina.</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <tbody className="divide-y divide-line border-y border-line">
            {recent.map((o) => (
              <ClickableRow key={o.id} href={`/admin/porudzbine/${o.id}`}>
                <td className="py-3 pr-4"><Link href={`/admin/porudzbine/${o.id}`} className="text-gold">#{o.id}</Link></td>
                <td className="py-3 pr-4">{o.name}</td>
                <td className="py-3 pr-4 text-muted">{new Date(o.created_at).toLocaleString("sr-RS")}</td>
                <td className="py-3 pr-4 text-right">{formatPrice(o.total)}</td>
                <td className="py-3 text-right">
                  <span className={`border px-2 py-0.5 text-[0.65rem] uppercase tracking-widest ${STATUS_STYLE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                </td>
              </ClickableRow>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
