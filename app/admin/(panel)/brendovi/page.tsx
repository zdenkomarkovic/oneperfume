import { deleteBrandAction, renameBrandAction } from "@/app/admin/actions";
import { BrandAddForm } from "@/components/admin/BrandAddForm";
import { query } from "@/lib/db";

export const metadata = { title: "Brendovi" };

export default async function Page() {
  const brands = await query<{ id: number; name: string; n: number }>(
    "SELECT b.id, b.name, (SELECT COUNT(*) FROM products p WHERE p.brand = b.name) n FROM brands b ORDER BY b.name",
  );

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-4xl">Brendovi <span className="text-xl text-muted">({brands.length})</span></h1>
      <p className="mt-3 text-sm text-muted">
        Preimenovanje menja naziv na svim proizvodima tog brenda. Brend sa proizvodima se ne može obrisati. Na sajtu se prikazuju samo brendovi koji imaju proizvode.
      </p>

      <h2 className="mt-8 mb-4 font-serif text-2xl">Novi brend</h2>
      <BrandAddForm />

      <div className="mt-10 divide-y divide-line border-y border-line">
        {brands.map((b) => (
          <div key={b.id} className="flex flex-wrap items-center gap-3 py-4">
            <form action={renameBrandAction} className="flex flex-1 flex-wrap items-center gap-3">
              <input type="hidden" name="id" value={b.id} />
              <input name="name" defaultValue={b.name} required className="field !w-64 flex-1" aria-label="Naziv" />
              <button className="text-xs uppercase tracking-widest text-gold">Sačuvaj</button>
            </form>
            <span className="text-xs text-muted">{b.n} proizvoda</span>
            {b.n > 0 ? (
              <span className="text-xs text-muted/60" title="Prvo premestite ili obrišite proizvode">zaključan</span>
            ) : (
              <form action={deleteBrandAction}>
                <input type="hidden" name="id" value={b.id} />
                <button className="text-xs uppercase tracking-widest text-red-300">Obriši</button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
