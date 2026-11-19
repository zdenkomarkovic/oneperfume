import Image from "next/image";
import Link from "next/link";
import { toggleProductAction } from "@/app/admin/actions";
import { query } from "@/lib/db";
import { formatPrice } from "@/lib/products";

export const metadata = { title: "Proizvodi" };

interface Row {
  id: number;
  slug: string;
  sku: string | null;
  name: string;
  brand: string;
  price: number;
  volume: string;
  images: string | null;
  sold_out: number;
  best_seller: number;
}

const PER_PAGE = 25;

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; saved?: string }> }) {
  const { q = "", page = "1", saved } = await searchParams;
  const like = `%${q.trim()}%`;
  const where = q.trim() ? "WHERE name LIKE ? OR brand LIKE ? OR sku LIKE ?" : "";
  const args = q.trim() ? [like, like, like] : [];
  const [{ n } = { n: 0 }] = await query<{ n: number }>(`SELECT COUNT(*) n FROM products ${where}`, args);
  const pages = Math.max(1, Math.ceil(n / PER_PAGE));
  const cur = Math.min(Math.max(1, Number(page) || 1), pages);
  const rows = await query<Row>(`SELECT * FROM products ${where} ORDER BY sort_order, id LIMIT ? OFFSET ?`, [...args, PER_PAGE, (cur - 1) * PER_PAGE]);
  const href = (p: number) => `/admin/proizvodi?${new URLSearchParams({ ...(q && { q }), page: String(p) })}`;

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-4xl">Proizvodi <span className="text-xl text-muted">({n})</span></h1>
        <Link href="/admin/proizvodi/novi" className="btn btn-gold">+ Novi proizvod</Link>
      </div>
      {saved && <p className="mt-4 border border-emerald-400/40 px-4 py-2 text-sm text-emerald-300">Proizvod je sačuvan.</p>}

      <form className="mt-6 flex gap-3">
        <input name="q" defaultValue={q} placeholder="Pretraga po nazivu, brendu ili šifri…" className="field max-w-sm" />
        <button className="btn btn-ghost">Traži</button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-muted">
            <tr><th className="pb-3 font-normal">Proizvod</th><th className="pb-3 font-normal">Cena</th><th className="pb-3 font-normal">Status</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-line border-y border-line">
            {rows.map((p) => {
              const img = (JSON.parse(p.images ?? "[]") as string[])[0];
              return (
                <tr key={p.id} className="hover:bg-surface">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/proizvodi/${p.id}`} className="flex items-center gap-4">
                      <span className="relative h-14 w-14 shrink-0 overflow-hidden bg-surface-2">
                        {img && <Image src={img} alt="" fill sizes="56px" className="object-cover" />}
                      </span>
                      <span>
                        <span className="block text-[0.65rem] uppercase tracking-widest text-muted">{p.brand}{p.sku ? ` · ${p.sku}` : ""}</span>
                        <span className="hover:text-gold">{p.name}</span> <span className="text-muted">{p.volume}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">{formatPrice(p.price)}</td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-2">
                      {(["sold_out", "best_seller"] as const).map((f) => (
                        <form key={f} action={toggleProductAction}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="field" value={f} />
                          <button
                            title="Klikni za promenu"
                            className={`border px-2 py-0.5 text-[0.65rem] uppercase tracking-widest ${
                              p[f] ? "border-gold text-gold" : "border-line text-muted/60 hover:text-muted"
                            }`}
                          >
                            {f === "sold_out" ? "Rasprodato" : "Best seller"}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <Link href={`/admin/proizvodi/${p.id}`} className="text-xs uppercase tracking-widest text-gold">Izmeni</Link>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={4} className="py-10 text-center text-muted">Nema proizvoda.</td></tr>}
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
