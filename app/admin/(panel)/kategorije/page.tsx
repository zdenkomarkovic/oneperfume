import { deleteCategoryAction, updateCategoryAction } from "@/app/admin/actions";
import { CategoryAddForm } from "@/components/admin/CategoryAddForm";
import { query } from "@/lib/db";

export const metadata = { title: "Kategorije" };

const SYSTEM = ["muski", "zenski", "unisex"];

export default async function Page() {
  const cats = await query<{ id: number; slug: string; name: string; sort_order: number; n: number }>(
    `SELECT c.*, (SELECT COUNT(*) FROM product_categories pc WHERE pc.category_id = c.id) n
     FROM categories c ORDER BY sort_order, id`,
  );

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-4xl">Kategorije</h1>
      <p className="mt-3 text-sm text-muted">
        Kategorije se automatski pojavljuju u meniju i podnožju sajta, na adresi <code>/parfemi/slug</code>.
      </p>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {cats.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 py-4">
            <form action={updateCategoryAction} className="flex flex-1 flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={c.id} />
              <input name="name" defaultValue={c.name} required className="field !w-56 flex-1" aria-label="Naziv" />
              <input name="sort" type="number" defaultValue={c.sort_order} className="field !w-20" aria-label="Redosled" title="Redosled" />
              <button className="text-xs uppercase tracking-widest text-gold">Sačuvaj</button>
            </form>
            <span className="w-full text-xs text-muted sm:w-auto">/{c.slug} · {c.n} proizvoda</span>
            {SYSTEM.includes(c.slug) ? (
              <span className="text-xs text-muted/60" title="Osnovna kategorija – koristi se za pol proizvoda">zaštićena</span>
            ) : (
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={c.id} />
                <button className="text-xs uppercase tracking-widest text-red-300">Obriši</button>
              </form>
            )}
          </div>
        ))}
      </div>

      <h2 className="mt-12 mb-4 font-serif text-2xl">Nova kategorija</h2>
      <CategoryAddForm />
    </div>
  );
}
