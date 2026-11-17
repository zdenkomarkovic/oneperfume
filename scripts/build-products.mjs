// Pretvara data/products.raw.json (preuzeto sa oneperfume.rs) u lib/products-data.json
import fs from "node:fs";

const raw = JSON.parse(fs.readFileSync("data/products.raw.json", "utf8"));

const BRANDS = [
  "Maison Alhambra", "Parfums De Marly", "Fragrance World", "French Avenue", "Karl Lagerfeld",
  "Calvin Klein", "Roberto Cavalli", "Paris Corner", "Al Haramain", "Mont Blanc", "Afnan",
  "Armaf", "Guess", "Iceberg", "Nautica", "Lalique", "Joop", "Lattafa",
];

const decode = (s) =>
  s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#8217;|&rsquo;/g, "’").replace(/&#8211;/g, "–").replace(/&quot;/g, '"').replace(/&#038;/g, "&");

const toText = (h) =>
  decode(h.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|li|div|h\d)>/gi, "\n").replace(/<[^>]+>/g, ""))
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();

const cap = (s) => s.trim().replace(/\s+/g, " ").replace(/^./, (c) => c.toUpperCase());
const list = (s) =>
  s
    .replace(/\.$/, "")
    .split(/,|·|\s\/\s/)
    .map(cap)
    .filter(Boolean);

const data = raw.map((p) => {
  const name0 = decode(p.name).replace(/^FW\s+/i, "").replace(/\s+/g, " ").trim();
  const brand =
    BRANDS.find((b) => name0.toLowerCase().startsWith(b.toLowerCase())) ??
    BRANDS.find((b) => name0.toLowerCase().includes(b.toLowerCase())) ??
    "One Perfume";
  let name = name0.slice(0, name0.toLowerCase().startsWith(brand.toLowerCase()) ? brand.length : 0).length
    ? name0.slice(brand.length).trim()
    : name0;
  name = name.replace(/^French Avenue\s+/i, brand === "Fragrance World" ? "French Avenue " : "");
  if (!p.categories.some((c) => c.endsWith("setovi"))) name = name.replace(/\s*\b\d{2,3}\s?ml\b(\/\d+ml)?/i, "");
  name = name.replace(/Mandrin/i, "Mandarin").replace(/\s+/g, " ").trim();

  const vol = (name0.match(/(\d{2,3})\s?ml/i) ?? p.slug.match(/(\d{2,3})ml/i))?.[1];
  const volume = p.type === "variable" ? "100ml / 200ml" : vol ? `${vol}ml` : "";

  const cats = p.categories.filter((c) => c !== "parfemi").map((c) => c.replace("-parfemi", ""));
  const gender = cats.includes("unisex") ? "unisex" : cats.some((c) => c.startsWith("zenski")) ? "zenski" : "muski";

  const text = toText(p.description);
  const grab = (re) => text.match(re)?.[1];
  const top = grab(/Gornje note:\s*([\s\S]*?)(?=Srednje note:|$)/i);
  const heart = grab(/Srednje note:\s*([\s\S]*?)(?=(?:Baza|Donje note|Bazne note|Donje):|$)/i);
  const base = grab(/(?:Baza|Donje note|Bazne note|Donje):\s*([^\n]*)/i);
  const notes = top && heart && base ? { top: list(top.split("\n")[0]), heart: list(heart.split("\n")[0]), base: list(base) } : undefined;

  const description = text
    .split("\n")
    .map((l) => l.trim())
    .map((l) => {
      const i = l.search(/Gornje note:/i);
      return i >= 0 ? l.slice(0, i).trim() : l;
    })
    .filter((l) => l && !/^(Srednje note|Baza|Donje note|Bazne note|Gornje note)/i.test(l))
    .filter((l) => l.toLowerCase() !== name0.toLowerCase());

  const variants =
    p.type === "variable"
      ? [{ label: "100ml", price: Math.min(...p.variations.map((v) => Number(v.price))) }, { label: "200ml", price: Math.max(...p.variations.map((v) => Number(v.price))) }]
      : undefined;

  return {
    slug: p.slug,
    name,
    fullName: name0,
    brand,
    price: p.price,
    volume,
    gender,
    categories: cats,
    images: p.images,
    soldOut: !p.inStock || undefined,
    rating: p.rating || undefined,
    reviewCount: p.reviewCount || undefined,
    description: description.length ? description : undefined,
    notes,
    variants,
    set: cats.includes("zenski-setovi") || cats.includes("muski-setovi") || undefined,
  };
});

fs.writeFileSync("lib/products-data.json", JSON.stringify(data, null, 1));
console.log(data.length, "proizvoda");
console.log(data.map((d) => `${d.brand} | ${d.name} | ${d.volume} | ${d.gender} | notes:${!!d.notes} | desc:${d.description?.length ?? 0}`).join("\n"));
