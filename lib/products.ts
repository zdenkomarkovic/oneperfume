// Tipovi i pomoćne funkcije bezbedne za klijent i server.
// Podaci o proizvodima se čitaju iz MariaDB – vidi lib/catalog.ts.

export type Gender = "muski" | "zenski" | "unisex";

export interface Variant {
  label: string;
  price: number;
}

export interface Product {
  id: number;
  slug: string;
  sku?: string; // šifra (opciono)
  name: string;
  brand: string;
  price: number; // RSD
  volume: string;
  gender: Gender;
  categories: string[]; // slug-ovi kategorija
  images: string[];
  image: string;
  soldOut?: boolean;
  bestSeller?: boolean;
  rating?: number;
  description?: string[];
  notes?: { top: string[]; heart: string[]; base: string[] };
  variants?: Variant[];
  set?: boolean;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  sortOrder: number;
}

/** Minimalni snimak proizvoda koji se čuva u korpi (localStorage). */
export type CartProduct = Pick<Product, "slug" | "name" | "brand" | "image" | "volume" | "price" | "variants">;

export const toCartProduct = (p: Product): CartProduct => ({
  slug: p.slug,
  name: p.name,
  brand: p.brand,
  image: p.image,
  volume: p.volume,
  price: p.price,
  variants: p.variants,
});

export const brandSlug = (b: string) => b.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const formatPrice = (n: number) => new Intl.NumberFormat("sr-RS").format(n) + " RSD";

export const maxPrice = (p: Pick<Product, "price" | "variants">) =>
  p.variants?.length ? Math.max(...p.variants.map((v) => v.price)) : p.price;
export const priceLabel = (p: Pick<Product, "price" | "variants">) =>
  maxPrice(p) !== p.price ? `${formatPrice(p.price)} – ${formatPrice(maxPrice(p))}` : formatPrice(p.price);

/** Cena za konkretnu varijantu (ili osnovna ako nema varijante). */
export const unitPrice = (p: Pick<Product, "price" | "variants">, variant?: string) =>
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
