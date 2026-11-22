"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { CATALOG_TAG } from "@/lib/catalog";
import { exec, query, tx } from "@/lib/db";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/order-status";
import { deleteUpload, saveUpload } from "@/lib/uploads";
import { createHash, randomBytes } from "node:crypto";
import { sendMail } from "@/lib/mail";
import { SITE_URL } from "@/lib/constants";

export interface FormState {
  error?: string;
  ok?: string;
}

const refreshShop = () => {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/đ/g, "dj")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ─── Auth ────────────────────────────────────────────────────────────────────

const attempts = new Map<string, { n: number; until: number }>();

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const h = await headers();
  const key = `${h.get("x-forwarded-for") ?? "local"}|${email}`;
  const a = attempts.get(key);
  if (a && a.n >= 5 && a.until > Date.now()) return { error: "Previše pokušaja. Pokušajte ponovo za 15 minuta." };

  const [admin] = await query<{ id: number; email: string; password_hash: string }>("SELECT * FROM admins WHERE email = ?", [email]);
  // Poređenje se radi i kad nalog ne postoji, da vreme odgovora ne otkriva email.
  const ok = await bcrypt.compare(password, admin?.password_hash ?? "$2a$11$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!admin || !ok) {
    attempts.set(key, { n: (a?.n ?? 0) + 1, until: Date.now() + 15 * 60_000 });
    return { error: "Pogrešan email ili lozinka." };
  }
  attempts.delete(key);
  await createSession({ id: admin.id, email: admin.email });
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const s = await requireAdmin();
  const cur = String(fd.get("current") ?? "");
  const next = String(fd.get("next") ?? "");
  if (next.length < 8) return { error: "Nova lozinka mora imati bar 8 karaktera." };
  if (next !== String(fd.get("repeat") ?? "")) return { error: "Lozinke se ne poklapaju." };
  const [a] = await query<{ password_hash: string }>("SELECT password_hash FROM admins WHERE id = ?", [s.id]);
  if (!a || !(await bcrypt.compare(cur, a.password_hash))) return { error: "Trenutna lozinka nije ispravna." };
  await exec("UPDATE admins SET password_hash = ? WHERE id = ?", [await bcrypt.hash(next, 11), s.id]);
  return { ok: "Lozinka je promenjena." };
}

// ─── Reset lozinke i upravljanje administratorima ───────────────────────────

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const RESET_TTL_MIN = 60;
let resetTable: Promise<unknown> | null = null;
/** Tabela se pravi i ovde, da radi i na bazi koja je postavljena pre ove funkcije. */
const ensureResetTable = () =>
  (resetTable ??= exec(`CREATE TABLE IF NOT EXISTS admin_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    token_hash CHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE
  ) ENGINE=InnoDB`).catch((e) => {
    resetTable = null;
    throw e;
  }));

const resetAttempts = new Map<string, { n: number; until: number }>();

export async function forgotPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const generic: FormState = { ok: "Ako nalog sa tom adresom postoji, poslali smo link za promenu lozinke. Link važi 1 sat." };
  if (!z.string().email().safeParse(email).success) return { error: "Unesite ispravnu email adresu." };

  const h = await headers();
  const key = `${h.get("x-forwarded-for") ?? "local"}`;
  const a = resetAttempts.get(key);
  const live = a && a.until > Date.now();
  if (live && a.n >= 5) return { error: "Previše zahteva. Pokušajte ponovo kasnije." };
  resetAttempts.set(key, { n: (live ? a.n : 0) + 1, until: live ? a.until : Date.now() + 15 * 60_000 });

  await ensureResetTable();
  const [admin] = await query<{ id: number; email: string }>("SELECT id, email FROM admins WHERE email = ?", [email]);
  if (!admin) return generic;

  const token = randomBytes(32).toString("hex");
  await exec("DELETE FROM admin_resets WHERE admin_id = ? OR expires_at < NOW()", [admin.id]);
  await exec("INSERT INTO admin_resets (admin_id, token_hash, expires_at) VALUES (?,?, DATE_ADD(NOW(), INTERVAL ? MINUTE))", [admin.id, sha(token), RESET_TTL_MIN]);

  const link = `${SITE_URL}/admin/reset-lozinke?token=${token}`;
  await sendMail(
    "One Perfume – promena lozinke",
    `Primili smo zahtev za promenu lozinke za admin panel.

Kliknite na link (važi ${RESET_TTL_MIN} minuta):
${link}

Ako niste Vi tražili promenu, slobodno ignorišite ovu poruku.`,
    undefined,
    { to: admin.email },
  ).catch(() => false);
  return generic;
}

export async function resetPasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const token = String(fd.get("token") ?? "");
  const next = String(fd.get("next") ?? "");
  if (next.length < 8) return { error: "Nova lozinka mora imati bar 8 karaktera." };
  if (next !== String(fd.get("repeat") ?? "")) return { error: "Lozinke se ne poklapaju." };
  await ensureResetTable();
  const [r] = await query<{ id: number; admin_id: number }>("SELECT id, admin_id FROM admin_resets WHERE token_hash = ? AND expires_at > NOW()", [sha(token)]);
  if (!r) return { error: "Link je neispravan ili je istekao. Zatražite novi." };
  await tx(async (c) => {
    await c.query("UPDATE admins SET password_hash = ? WHERE id = ?", [await bcrypt.hash(next, 11), r.admin_id]);
    await c.query("DELETE FROM admin_resets WHERE admin_id = ?", [r.admin_id]);
  });
  redirect("/admin/login?reset=1");
}

export async function addAdminAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!z.string().email().max(150).safeParse(email).success) return { error: "Unesite ispravnu email adresu." };
  if (password.length < 8) return { error: "Lozinka mora imati bar 8 karaktera." };
  const [dup] = await query("SELECT id FROM admins WHERE email = ?", [email]);
  if (dup) return { error: "Administrator sa tim emailom već postoji." };
  await exec("INSERT INTO admins (email, password_hash) VALUES (?,?)", [email, await bcrypt.hash(password, 11)]);
  revalidatePath("/admin/podesavanja");
  return { ok: `Administrator ${email} je dodat.` };
}

export async function deleteAdminAction(fd: FormData) {
  const s = await requireAdmin();
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id) || id === s.id) return;
  const [c] = await query<{ n: number }>("SELECT COUNT(*) n FROM admins");
  if (Number(c?.n ?? 0) <= 1) return;
  await exec("DELETE FROM admins WHERE id = ?", [id]);
  revalidatePath("/admin/podesavanja");
}

// ─── Proizvodi ───────────────────────────────────────────────────────────────

const lines = (s: FormDataEntryValue | null) =>
  String(s ?? "")
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

const productSchema = z.object({
  name: z.string().trim().min(1, "Naziv je obavezan").max(255),
  brand: z.string().trim().min(1, "Brend je obavezan").max(100),
  volume: z.string().trim().max(50),
  gender: z.enum(["muski", "zenski", "unisex"]),
  price: z.coerce.number().int("Cena mora biti ceo broj").min(0).max(10_000_000),
});

export async function saveProductAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(fd.get("id")) || 0;

  const parsed = productSchema.safeParse({
    name: fd.get("name"),
    brand: fd.get("brand"),
    volume: fd.get("volume") ?? "",
    gender: fd.get("gender"),
    price: fd.get("price") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Neispravni podaci" };
  const d = parsed.data;

  // Varijante (opciono) – osnovna cena je najniža varijanta.
  const variants: { label: string; price: number }[] = [];
  for (let i = 0; i < 4; i++) {
    const label = String(fd.get(`vlabel${i}`) ?? "").trim();
    const raw = String(fd.get(`vprice${i}`) ?? "").trim();
    if (!label && !raw) continue;
    const price = Number(raw);
    if (!label || !Number.isInteger(price) || price < 0) return { error: `Varijanta ${i + 1}: unesite naziv i celobrojnu cenu.` };
    variants.push({ label: label.slice(0, 50), price });
  }
  const basePrice = variants.length ? Math.min(...variants.map((v) => v.price)) : d.price;

  let slug = slugify(String(fd.get("slug") ?? "")) || slugify(`${d.brand} ${d.name} ${d.volume}`);
  if (!slug) return { error: "Nije moguće napraviti slug iz naziva." };
  const taken = await query<{ id: number }>("SELECT id FROM products WHERE slug = ? AND id <> ?", [slug, id]);
  if (taken.length) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;

  // Slike: redosled određuje klijent (imageOrder) – postojeća putanja ili "new" za sledeći uploadovani fajl.
  const order = fd.getAll("imageOrder").map(String);
  const newFiles = fd.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  const images: string[] = [];
  try {
    let n = 0;
    for (const t of order) {
      if (t === "new") {
        const f = newFiles[n++];
        if (f) images.push(await saveUpload(f));
      } else if (t.startsWith("/")) images.push(t);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Greška pri uploadu slike" };
  }
  if (images.length === 0) return { error: "Dodajte bar jednu sliku." };

  const desc = String(fd.get("description") ?? "")
    .split(/\n\s*\n|\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);
  const notes = { top: lines(fd.get("noteTop")), heart: lines(fd.get("noteHeart")), base: lines(fd.get("noteBase")) };
  const hasNotes = notes.top.length + notes.heart.length + notes.base.length > 0;
  const catIds = fd.getAll("categories").map(Number).filter(Boolean);
  const rating = Number(fd.get("rating"));

  const values = [
    slug, d.name, d.brand, basePrice, d.volume, d.gender,
    desc.length ? JSON.stringify(desc) : null,
    hasNotes ? JSON.stringify(notes) : null,
    JSON.stringify(images),
    rating > 0 && rating <= 5 ? rating : null,
    fd.get("isSet") ? 1 : 0,
    fd.get("soldOut") ? 1 : 0,
    fd.get("bestSeller") ? 1 : 0,
    String(fd.get("sku") ?? "").trim().slice(0, 60) || null,
  ];

  const oldImages = id ? await query<{ images: string }>("SELECT images FROM products WHERE id = ?", [id]) : [];

  const savedId = await tx(async (c) => {
    await c.query("INSERT IGNORE INTO brands (name) VALUES (?)", [d.brand]);
    let pid = id;
    if (id) {
      await c.query(
        "UPDATE products SET slug=?, name=?, brand=?, price=?, volume=?, gender=?, description=?, notes=?, images=?, rating=?, is_set=?, sold_out=?, best_seller=?, sku=? WHERE id=?",
        [...values, id],
      );
    } else {
      // Novi proizvodi idu na vrh liste.
      const [[m]] = (await c.query("SELECT COALESCE(MIN(sort_order), 0) - 1 AS s FROM products")) as unknown as [[{ s: number }]];
      const [r] = (await c.query(
        "INSERT INTO products (slug,name,brand,price,volume,gender,description,notes,images,rating,is_set,sold_out,best_seller,sku,sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        [...values, m.s],
      )) as unknown as [{ insertId: number }];
      pid = r.insertId;
    }
    await c.query("DELETE FROM product_categories WHERE product_id = ?", [pid]);
    for (const cid of catIds) await c.query("INSERT IGNORE INTO product_categories VALUES (?,?)", [pid, cid]);
    await c.query("DELETE FROM product_variants WHERE product_id = ?", [pid]);
    for (const [i, v] of variants.entries())
      await c.query("INSERT INTO product_variants (product_id,label,price,sort_order) VALUES (?,?,?,?)", [pid, v.label, v.price, i]);
    return pid;
  });

  // Obriši fajlove slika koje su uklonjene sa proizvoda.
  try {
    const before = JSON.parse(oldImages[0]?.images ?? "[]") as string[];
    for (const img of before.filter((x) => !images.includes(x))) await deleteUpload(img);
  } catch {}

  refreshShop();
  redirect(`/admin/proizvodi?saved=${savedId}`);
}

export async function deleteProductAction(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const [p] = await query<{ images: string }>("SELECT images FROM products WHERE id = ?", [id]);
  await exec("DELETE FROM products WHERE id = ?", [id]);
  try {
    for (const img of JSON.parse(p?.images ?? "[]") as string[]) await deleteUpload(img);
  } catch {}
  refreshShop();
  redirect("/admin/proizvodi");
}

export async function toggleProductAction(fd: FormData) {
  await requireAdmin();
  const field = String(fd.get("field"));
  if (field !== "sold_out" && field !== "best_seller") return;
  await exec(`UPDATE products SET ${field} = 1 - ${field} WHERE id = ?`, [Number(fd.get("id"))]);
  refreshShop();
  revalidatePath("/admin/proizvodi");
}

// ─── Brendovi ────────────────────────────────────────────────────────────────

export async function addBrandAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = String(fd.get("name") ?? "").trim().slice(0, 100);
  if (!name) return { error: "Unesite naziv brenda." };
  const r = await exec("INSERT IGNORE INTO brands (name) VALUES (?)", [name]);
  if (!r.affectedRows) return { error: "Taj brend već postoji." };
  revalidatePath("/admin/brendovi");
  return { ok: `Brend "${name}" je dodat.` };
}

export async function renameBrandAction(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const name = String(fd.get("name") ?? "").trim().slice(0, 100);
  const [old] = await query<{ name: string }>("SELECT name FROM brands WHERE id = ?", [id]);
  if (!old || !name || old.name === name) return;
  if ((await query("SELECT id FROM brands WHERE name = ? AND id <> ?", [name, id])).length) return;
  await tx(async (c) => {
    await c.query("UPDATE brands SET name = ? WHERE id = ?", [name, id]);
    await c.query("UPDATE products SET brand = ? WHERE brand = ?", [name, old.name]);
  });
  refreshShop();
  revalidatePath("/admin/brendovi");
}

export async function deleteBrandAction(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const [b] = await query<{ name: string; n: number }>(
    "SELECT name, (SELECT COUNT(*) FROM products p WHERE p.brand = brands.name) n FROM brands WHERE id = ?",
    [id],
  );
  if (!b || b.n > 0) return; // brend sa proizvodima se ne briše
  await exec("DELETE FROM brands WHERE id = ?", [id]);
  revalidatePath("/admin/brendovi");
}

// ─── Kategorije ──────────────────────────────────────────────────────────────

const SYSTEM_CATEGORIES = ["muski", "zenski", "unisex"];

export async function addCategoryAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return { error: "Unesite naziv kategorije." };
  const slug = slugify(String(fd.get("slug") ?? "")) || slugify(name);
  if (!slug) return { error: "Neispravan slug." };
  if ((await query("SELECT id FROM categories WHERE slug = ?", [slug])).length) return { error: "Kategorija sa tim slug-om već postoji." };
  const [m] = await query<{ s: number }>("SELECT COALESCE(MAX(sort_order), 0) + 1 AS s FROM categories");
  await exec("INSERT INTO categories (slug, name, sort_order) VALUES (?,?,?)", [slug, name.slice(0, 150), m?.s ?? 0]);
  refreshShop();
  revalidatePath("/admin/kategorije");
  return { ok: `Kategorija "${name}" je dodata.` };
}

export async function updateCategoryAction(fd: FormData) {
  await requireAdmin();
  const name = String(fd.get("name") ?? "").trim();
  if (!name) return;
  await exec("UPDATE categories SET name = ?, sort_order = ? WHERE id = ?", [
    name.slice(0, 150),
    Number(fd.get("sort")) || 0,
    Number(fd.get("id")),
  ]);
  refreshShop();
  revalidatePath("/admin/kategorije");
}

export async function deleteCategoryAction(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const [c] = await query<{ slug: string }>("SELECT slug FROM categories WHERE id = ?", [id]);
  if (!c || SYSTEM_CATEGORIES.includes(c.slug)) return;
  await exec("DELETE FROM categories WHERE id = ?", [id]);
  refreshShop();
  revalidatePath("/admin/kategorije");
}

// ─── Porudžbine i poruke ─────────────────────────────────────────────────────

export async function updateOrderAction(fd: FormData) {
  await requireAdmin();
  const status = String(fd.get("status"));
  if (!(ORDER_STATUSES as readonly string[]).includes(status)) return;
  const id = Number(fd.get("id"));
  const pay = String(fd.get("paymentStatus"));
  const clip = (k: string, n: number) => String(fd.get(k) ?? "").trim().slice(0, n) || null;
  await exec(
    "UPDATE orders SET status = ?, payment_status = ?, courier = ?, tracking_number = ?, admin_note = ? WHERE id = ?",
    [status, (PAYMENT_STATUSES as readonly string[]).includes(pay) ? pay : "cekanje", clip("courier", 100), clip("tracking", 100), clip("adminNote", 2000), id],
  );
  revalidatePath("/admin", "layout");
  redirect("/admin/porudzbine");
}

export async function messageAction(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  switch (fd.get("op")) {
    case "read":
      await exec("UPDATE messages SET is_read = 1 WHERE id = ?", [id]);
      break;
    case "unread":
      await exec("UPDATE messages SET is_read = 0 WHERE id = ?", [id]);
      break;
    case "trash":
      await exec("UPDATE messages SET deleted_at = NOW() WHERE id = ?", [id]);
      break;
    case "restore":
      await exec("UPDATE messages SET deleted_at = NULL WHERE id = ?", [id]);
      break;
    case "purge": // trajno brisanje – samo iz foldera Obrisano
      await exec("DELETE FROM messages WHERE id = ? AND deleted_at IS NOT NULL", [id]);
      break;
  }
  revalidatePath("/admin", "layout");
}

export async function emptyTrashAction() {
  await requireAdmin();
  await exec("DELETE FROM messages WHERE deleted_at IS NOT NULL");
  revalidatePath("/admin", "layout");
}
