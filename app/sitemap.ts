import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getCategories, getProducts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const pages = ["", "/parfemi", ...categories.map((c) => `/parfemi/${c.slug}`), "/brendovi", "/o-nama", "/kontakt"];
  return [
    ...pages.map((p) => ({ url: SITE_URL + p, lastModified: new Date(), priority: p === "" ? 1 : 0.8 })),
    ...products.map((p) => ({ url: `${SITE_URL}/proizvod/${p.slug}`, lastModified: new Date(), priority: 0.6 })),
  ];
}
