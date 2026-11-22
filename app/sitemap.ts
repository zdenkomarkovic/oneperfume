import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getCategories, getProducts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const now = new Date();
  const staticPages: [string, number, "daily" | "weekly" | "monthly" | "yearly"][] = [
    ["", 1, "daily"],
    ["/parfemi", 0.9, "daily"],
    ...categories.map((c): [string, number, "daily"] => [`/parfemi/${c.slug}`, 0.8, "daily"]),
    ["/brendovi", 0.7, "weekly"],
    ["/o-nama", 0.5, "yearly"],
    ["/kontakt", 0.5, "yearly"],
    ["/isporuka-i-placanje", 0.4, "yearly"],
    ["/reklamacije-i-povracaj", 0.3, "yearly"],
    ["/uslovi-koriscenja", 0.2, "yearly"],
    ["/politika-privatnosti", 0.2, "yearly"],
    ["/politika-kolacica", 0.2, "yearly"],
  ];
  return [
    ...staticPages.map(([p, priority, changeFrequency]) => ({ url: SITE_URL + p, lastModified: now, changeFrequency, priority })),
    ...products.map((p) => ({
      url: `${SITE_URL}/proizvod/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      ...(p.image && { images: [p.image.startsWith("http") ? p.image : SITE_URL + p.image] }),
    })),
  ];
}
