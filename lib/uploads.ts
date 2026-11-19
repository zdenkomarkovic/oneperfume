import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads"));
export const MAX_UPLOAD = 6 * 1024 * 1024;

export const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

/** Prepoznaje tip slike po sadržaju (ne veruje imenu/MIME-u koji šalje klijent). */
function sniff(b: Buffer): ".jpg" | ".png" | ".webp" | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return ".jpg";
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return ".png";
  if (b.length > 12 && b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return ".webp";
  return null;
}

/** Čuva upload i vraća javnu putanju (/uploads/...). */
export async function saveUpload(file: File): Promise<string> {
  if (file.size > MAX_UPLOAD) throw new Error(`Slika "${file.name}" je veća od 6 MB`);
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) throw new Error(`"${file.name}" nije podržana slika (JPG, PNG ili WebP)`);
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(5).toString("hex")}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/${name}`;
}

export async function deleteUpload(publicPath: string) {
  if (!publicPath.startsWith("/uploads/")) return;
  const file = path.join(UPLOAD_DIR, path.basename(publicPath));
  await fs.unlink(file).catch(() => {});
}
