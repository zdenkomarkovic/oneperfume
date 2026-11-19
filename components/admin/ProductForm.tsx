"use client";

import { startTransition, useActionState, useState } from "react";
import { ImageManager, existingItems, type ImgItem } from "./ImageManager";
import { saveProductAction, type FormState } from "@/app/admin/actions";

export interface ProductFormData {
  id: number;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  price: number;
  volume: string;
  gender: "muski" | "zenski" | "unisex";
  description: string;
  noteTop: string;
  noteHeart: string;
  noteBase: string;
  images: string[];
  rating: string;
  isSet: boolean;
  soldOut: boolean;
  bestSeller: boolean;
  categoryIds: number[];
  variants: { label: string; price: number }[];
}

const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <span className="mb-2 block text-xs uppercase tracking-[0.18em] text-muted">
    {children} {hint && <span className="normal-case tracking-normal text-muted/60">– {hint}</span>}
  </span>
);

export function ProductForm({
  data,
  categories,
  brands,
}: {
  data: ProductFormData | null;
  categories: { id: number; name: string }[];
  brands: string[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProductAction, {});
  const d = data;
  const [items, setItems] = useState<ImgItem[]>(() => existingItems(d?.images ?? []));

  // Šalje se ručno (bez automatskog reseta forme) da se ništa ne izgubi ako server vrati grešku.
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    for (const it of items) fd.append("imageOrder", it.url ?? "new");
    for (const it of items) if (it.file) fd.append("files", it.file);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {d && <input type="hidden" name="id" value={d.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <Label>Naziv</Label>
          <input name="name" required defaultValue={d?.name} className="field" placeholder="npr. Khamrah EDP" />
        </label>
        <label className="block">
          <Label hint="opciono">Šifra</Label>
          <input name="sku" defaultValue={d?.sku} maxLength={60} className="field" placeholder="npr. LT-0123" />
        </label>
        <label className="block">
          <Label>Brend</Label>
          <input name="brand" required list="brands" defaultValue={d?.brand} className="field" placeholder="npr. Lattafa" />
          <datalist id="brands">{brands.map((b) => <option key={b} value={b} />)}</datalist>
        </label>
        <label className="block">
          <Label>Zapremina</Label>
          <input name="volume" defaultValue={d?.volume} className="field" placeholder="100ml" />
        </label>
        <label className="block">
          <Label hint="RSD, ako nema varijanti">Cena</Label>
          <input name="price" type="number" min={0} step={1} defaultValue={d?.price} className="field" />
        </label>
        <label className="block">
          <Label hint="određuje breadcrumb">Pol</Label>
          <select name="gender" defaultValue={d?.gender ?? "unisex"} className="field">
            <option value="muski" className="bg-surface">Muški</option>
            <option value="zenski" className="bg-surface">Ženski</option>
            <option value="unisex" className="bg-surface">Unisex</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <Label hint="prazno = automatski iz naziva">Slug (URL)</Label>
          <input name="slug" defaultValue={d?.slug} className="field" placeholder="lattafa-khamrah-100ml" />
        </label>
      </div>

      <fieldset>
        <Label>Kategorije</Label>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {categories.map((c) => (
            <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" name="categories" value={c.id} defaultChecked={d?.categoryIds.includes(c.id)} className="accent-[#1d4ed8]" />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <Label hint="opciono – ako postoje, cena se uzima iz varijante (najniža je osnovna)">Varijante</Label>
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-[1fr_9rem] gap-3">
              <input name={`vlabel${i}`} defaultValue={d?.variants[i]?.label} placeholder={i === 0 ? "npr. 50ml" : "Oznaka"} className="field" />
              <input name={`vprice${i}`} type="number" min={0} defaultValue={d?.variants[i]?.price} placeholder="Cena" className="field" />
            </div>
          ))}
        </div>
      </fieldset>

      <div>
        <Label>Slike</Label>
        <ImageManager items={items} setItems={setItems} />
      </div>

      <label className="block">
        <Label hint="paragrafi odvojeni praznim redom">Opis</Label>
        <textarea name="description" rows={6} defaultValue={d?.description} className="field" />
      </label>

      <fieldset>
        <Label hint="odvojene zarezom">Piramida mirisa</Label>
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="noteTop" defaultValue={d?.noteTop} placeholder="Gornje note" className="field" />
          <input name="noteHeart" defaultValue={d?.noteHeart} placeholder="Srednje note" className="field" />
          <input name="noteBase" defaultValue={d?.noteBase} placeholder="Baza" className="field" />
        </div>
      </fieldset>

      <div className="flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-line pt-6">
        {(
          [
            ["soldOut", "Rasprodato", d?.soldOut],
            ["bestSeller", "Best seller (početna)", d?.bestSeller],
            ["isSet", "Set", d?.isSet],
          ] as const
        ).map(([n, l, v]) => (
          <label key={n} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" name={n} defaultChecked={v} className="accent-[#1d4ed8]" /> {l}
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm">
          Ocena
          <input name="rating" type="number" step="0.1" min={0} max={5} defaultValue={d?.rating} className="field !w-20 !py-1.5" />
        </label>
      </div>

      {state.error && <p className="border border-red-400/40 px-4 py-3 text-sm text-red-300">{state.error}</p>}
      <button disabled={pending} className="btn btn-gold">{pending ? "Čuvanje…" : "Sačuvaj proizvod"}</button>
    </form>
  );
}
