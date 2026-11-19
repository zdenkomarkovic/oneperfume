import "server-only";
import { unstable_cache } from "next/cache";
import { query } from "./db";
import type { Category, Gender, Product } from "./products";

export const CATALOG_TAG = "catalog";

interface ProductRow {
  id: number;
  slug: string;
  sku: string | null;
  name: string;
  brand: string;
  price: number;
  volume: string;
  gender: Gender;
  description: string | null;
  notes: string | null;
  images: string | null;
  rating: string | null;
  is_set: number;
  sold_out: number;
  best_seller: number;
}

const parse = <T>(s: string | null, fallback: T): T => {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
};

async function loadProducts(): Promise<Product[]> {
  const [rows, cats, vars] = await Promise.all([
    query<ProductRow>("SELECT * FROM products ORDER BY sort_order, id"),
    query<{ product_id: number; slug: string }>(
      "SELECT pc.product_id, c.slug FROM product_categories pc JOIN categories c ON c.id = pc.category_id ORDER BY c.sort_order",
    ),
    query<{ product_id: number; label: string; price: number }>(
      "SELECT product_id, label, price FROM product_variants ORDER BY sort_order, id",
    ),
  ]);
  return rows.map((r) => {
    const images = parse<string[]>(r.images, []);
    const variants = vars.filter((v) => v.product_id === r.id).map((v) => ({ label: v.label, price: v.price }));
    return {
      id: r.id,
      slug: r.slug,
      sku: r.sku || undefined,
      name: r.name,
      brand: r.brand,
      price: r.price,
      volume: r.volume,
      gender: r.gender,
      categories: cats.filter((c) => c.product_id === r.id).map((c) => c.slug),
      images,
      image: images[0] ?? "",
      soldOut: !!r.sold_out || undefined,
      bestSeller: !!r.best_seller,
      rating: r.rating ? Number(r.rating) : undefined,
      description: parse<string[] | undefined>(r.description, undefined),
      notes: parse<Product["notes"]>(r.notes, undefined),
      variants: variants.length ? variants : undefined,
      set: !!r.is_set || undefined,
    };
  });
}

/** Ceo katalog (keširan; poništava se pri svakoj izmeni iz admin panela). */
export const getProducts = unstable_cache(loadProducts, ["catalog-products"], { tags: [CATALOG_TAG], revalidate: 300 });

export const getCategories = unstable_cache(
  async (): Promise<Category[]> =>
    (
      await query<{ id: number; slug: string; name: string; sort_order: number }>(
        "SELECT * FROM categories ORDER BY sort_order, id",
      )
    ).map((c) => ({ id: c.id, slug: c.slug, name: c.name, sortOrder: c.sort_order })),
  ["catalog-categories"],
  { tags: [CATALOG_TAG], revalidate: 300 },
);

export async function getProduct(slug: string) {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getBestSellers() {
  return (await getProducts()).filter((p) => p.bestSeller);
}

export async function getBrands() {
  return Array.from(new Set((await getProducts()).map((p) => p.brand))).sort();
}

export async function getRelated(p: Product, n = 4) {
  return (await getProducts())
    .filter((x) => x.slug !== p.slug && !x.soldOut && (x.brand === p.brand || x.gender === p.gender))
    .sort((a, b) => Number(b.brand === p.brand) - Number(a.brand === p.brand))
    .slice(0, n);
}
