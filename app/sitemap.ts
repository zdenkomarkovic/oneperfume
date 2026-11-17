import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { products } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/parfemi", "/parfemi/muski", "/parfemi/zenski", "/parfemi/unisex", "/parfemi/zenski-setovi", "/brendovi", "/o-nama", "/kontakt"];
  return [
    ...pages.map((p) => ({ url: SITE_URL + p, lastModified: new Date(), priority: p === "" ? 1 : 0.8 })),
    ...products.map((p) => ({ url: `${SITE_URL}/proizvod/${p.slug}`, lastModified: new Date(), priority: 0.6 })),
  ];
}
