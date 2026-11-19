import fs from "node:fs/promises";
import path from "node:path";
import { MIME, UPLOAD_DIR } from "@/lib/uploads";

// Služi slike koje su dodate kroz admin panel (public/ se ne osvežava posle build-a).
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await params;
  const name = path.basename(parts.join("/"));
  const type = MIME[path.extname(name).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });
  try {
    const data = await fs.readFile(path.join(UPLOAD_DIR, name));
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
