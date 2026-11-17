import data from "./products-data.json";

export type Gender = "muski" | "zenski" | "unisex";
export type CategoryKey = Gender | "zenski-setovi" | "muski-setovi";

export interface Variant {
  label: string;
  price: number;
}

export interface Product {
  slug: string;
  name: string;
  brand: string;
  price: number; // RSD
  volume: string;
  gender: Gender;
  categories: string[];
  images: string[];
  image: string;
  soldOut?: boolean;
  bestSeller?: boolean;
  rating?: number;
  reviewCount?: number;
  description?: string[];
  notes?: { top: string[]; heart: string[]; base: string[] };
  variants?: Variant[];
  set?: boolean;
}

type Raw = Omit<Product, "image" | "bestSeller" | "gender"> & { gender: string };

// Podaci su preuzeti sa oneperfume.rs (scripts/build-products.mjs -> lib/products-data.json)
export const products: Product[] = (data as unknown as Raw[]).map((p, i) => ({
  ...p,
  gender: p.gender as Gender,
  image: p.images[0] ?? "",
  bestSeller: i < 8,
}));

export const brands = Array.from(new Set(products.map((p) => p.brand))).sort();

export const categoryLabels: Record<string, string> = {
  muski: "Muški parfemi",
  zenski: "Ženski parfemi",
  unisex: "Unisex",
  "zenski-setovi": "Ženski setovi",
};
export const genderLabels = categoryLabels;

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const bestSellers = () => products.filter((p) => p.bestSeller);
export const related = (p: Product, n = 4) =>
  products
    .filter((x) => x.slug !== p.slug && !x.soldOut && (x.brand === p.brand || x.gender === p.gender))
    .sort((a, b) => Number(b.brand === p.brand) - Number(a.brand === p.brand))
    .slice(0, n);
export const brandSlug = (b: string) => b.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const formatPrice = (n: number) => new Intl.NumberFormat("sr-RS").format(n) + " RSD";

export const maxPrice = (p: Product) => (p.variants ? Math.max(...p.variants.map((v) => v.price)) : p.price);
export const priceLabel = (p: Product) =>
  maxPrice(p) !== p.price ? `${formatPrice(p.price)} – ${formatPrice(maxPrice(p))}` : formatPrice(p.price);

/** Cena za konkretnu varijantu (ili osnovna ako nema varijante). */
export const unitPrice = (p: Product, variant?: string) =>
  p.variants?.find((v) => v.label === variant)?.price ?? p.price;

export const SHOP = {
  name: "One Perfume",
  address: "Janka Veselinovića 3, 16000 Leskovac, Srbija",
  email: "oneperfume@oneperfume.rs",
  phone: "+381 62 488 248",
  phoneHref: "+38162488248",
  hours: [
    ["Ponedeljak – Subota", "09:00 – 17:00"],
    ["Nedelja", "10:00 – 15:00"],
  ],
  company: { mb: "67773055", pib: "114683779", ziro: "265-8250310000216-26" },
};
