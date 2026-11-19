import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProductAction } from "@/app/admin/actions";
import { ProductForm, type ProductFormData } from "@/components/admin/ProductForm";
import { query } from "@/lib/db";

export const metadata = { title: "Proizvod" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "novi";
  if (!isNew && !/^\d+$/.test(id)) notFound();

  const [cats, brands] = await Promise.all([
    query<{ id: number; name: string }>("SELECT id, name FROM categories ORDER BY sort_order, id"),
    query<{ brand: string }>("SELECT name AS brand FROM brands ORDER BY name"),
  ]);

  let data: ProductFormData | null = null;
  if (!isNew) {
    const [p] = await query<Record<string, unknown>>("SELECT * FROM products WHERE id = ?", [Number(id)]);
    if (!p) notFound();
    const [pc, vars] = await Promise.all([
      query<{ category_id: number }>("SELECT category_id FROM product_categories WHERE product_id = ?", [Number(id)]),
      query<{ label: string; price: number }>("SELECT label, price FROM product_variants WHERE product_id = ? ORDER BY sort_order, id", [Number(id)]),
    ]);
    const json = <T,>(s: unknown, d: T): T => {
      try {
        return s ? (JSON.parse(String(s)) as T) : d;
      } catch {
        return d;
      }
    };
    const notes = json<{ top: string[]; heart: string[]; base: string[] }>(p.notes, { top: [], heart: [], base: [] });
    data = {
      id: Number(p.id),
      slug: String(p.slug),
      sku: String(p.sku ?? ""),
      name: String(p.name),
      brand: String(p.brand),
      price: Number(p.price),
      volume: String(p.volume),
      gender: p.gender as ProductFormData["gender"],
      description: json<string[]>(p.description, []).join("\n\n"),
      noteTop: notes.top.join(", "),
      noteHeart: notes.heart.join(", "),
      noteBase: notes.base.join(", "),
      images: json<string[]>(p.images, []),
      rating: p.rating ? String(p.rating) : "",
      isSet: !!p.is_set,
      soldOut: !!p.sold_out,
      bestSeller: !!p.best_seller,
      categoryIds: pc.map((c) => c.category_id),
      variants: vars,
    };
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/proizvodi" className="text-xs uppercase tracking-widest text-muted hover:text-gold">← Proizvodi</Link>
      <h1 className="mt-3 mb-8 font-serif text-4xl">{data ? data.name : "Novi proizvod"}</h1>
      <ProductForm data={data} categories={cats} brands={brands.map((b) => b.brand)} />

      {data && (
        <form action={deleteProductAction} className="mt-16 border-t border-line pt-8">
          <input type="hidden" name="id" value={data.id} />
          <p className="mb-3 text-sm text-muted">Brisanje proizvoda je trajno. Stare porudžbine ostaju sačuvane.</p>
          <button className="border border-red-400/40 px-5 py-2.5 text-xs uppercase tracking-widest text-red-300 hover:bg-red-400/10">
            Obriši proizvod
          </button>
        </form>
      )}
    </div>
  );
}
