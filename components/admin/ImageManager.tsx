"use client";

import Image from "next/image";
import { useRef, useState } from "react";

/** Slika u listi: postojeća (url) ili tek izabrana (file). Redosled u listi je redosled na sajtu, prva je glavna. */
export interface ImgItem {
  id: string;
  src: string; // url ili objectURL za pregled
  url?: string;
  file?: File;
}

let seq = 0;
export const existingItems = (urls: string[]): ImgItem[] => urls.map((u) => ({ id: `e${seq++}`, src: u, url: u }));

const MAX_SIDE = 1600;
const LIMIT = 5.5 * 1024 * 1024;

/** Smanjuje velike fotografije (max 1600px) i pretvara u WebP – manji upload i brži sajt. */
async function optimize(file: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/webp", 0.86));
    if (!blob) return file;
    // Zadrži original samo ako je već mali i nije veći od WebP verzije.
    if (blob.size >= file.size && file.size < LIMIT && /^image\/(jpeg|png|webp)$/.test(file.type)) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export function ImageManager({
  items,
  setItems,
}: {
  items: ImgItem[];
  setItems: React.Dispatch<React.SetStateAction<ImgItem[]>>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  async function add(list: FileList | File[] | null) {
    const files = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    setBusy(true);
    const done = await Promise.all(files.map(optimize));
    setItems((p) => [...p, ...done.map((file) => ({ id: `n${seq++}`, src: URL.createObjectURL(file), file }))]);
    setBusy(false);
  }

  const move = (i: number, to: number) =>
    setItems((p) => {
      if (to < 0 || to >= p.length) return p;
      const n = [...p];
      const [x] = n.splice(i, 1);
      n.splice(to, 0, x!);
      return n;
    });

  return (
    <div>
      <div
        onClick={() => input.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && input.current?.click()}
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files")) {
            e.preventDefault();
            setOver(true);
          }
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          if (!e.dataTransfer.files.length) return;
          e.preventDefault();
          setOver(false);
          add(e.dataTransfer.files);
        }}
        onPaste={(e) => add(e.clipboardData.files)}
        tabIndex={0}
        role="button"
        className={`cursor-pointer border-2 border-dashed px-6 py-8 text-center text-sm transition-colors ${
          over ? "border-gold bg-surface-2" : "border-line hover:border-gold/60"
        }`}
      >
        {busy ? (
          "Obrada slika…"
        ) : (
          <>
            <span className="font-medium text-gold">Kliknite</span> ili prevucite slike ovde
            <span className="mt-1 block text-xs text-muted">
              može i Ctrl+V za nalepljenu sliku · više slika odjednom · velike slike se same smanjuju
            </span>
          </>
        )}
        <input
          ref={input}
          type="file"
          accept="image/*"
          multiple
          hidden
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {items.length > 0 && (
        <>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {items.map((it, i) => (
              <li
                key={it.id}
                draggable
                onDragStart={() => setDragId(it.id)}
                onDragEnd={() => setDragId(null)}
                onDragOver={(e) => !e.dataTransfer.types.includes("Files") && e.preventDefault()}
                onDrop={(e) => {
                  if (e.dataTransfer.types.includes("Files")) return;
                  e.preventDefault();
                  const from = items.findIndex((x) => x.id === dragId);
                  if (from >= 0) move(from, i);
                }}
                className={`border border-line bg-surface p-2 ${dragId === it.id ? "opacity-40" : ""}`}
              >
                <div className="relative aspect-square cursor-grab overflow-hidden bg-surface-2">
                  {it.file ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.src} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Image src={it.src} alt="" fill sizes="200px" className="object-cover" />
                  )}
                  {i === 0 && (
                    <span className="absolute left-1 top-1 bg-gold px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-widest">
                      Glavna
                    </span>
                  )}
                  {it.file && <span className="absolute bottom-1 left-1 bg-black/60 px-1.5 text-[0.6rem] text-white">nova</span>}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="flex gap-1">
                    <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="px-1.5 py-0.5 hover:text-gold disabled:opacity-25" aria-label="Pomeri levo">←</button>
                    <button type="button" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} className="px-1.5 py-0.5 hover:text-gold disabled:opacity-25" aria-label="Pomeri desno">→</button>
                    {i > 0 && (
                      <button type="button" onClick={() => move(i, 0)} className="px-1.5 py-0.5 hover:text-gold" title="Postavi kao glavnu">★</button>
                    )}
                  </span>
                  <button type="button" onClick={() => setItems((p) => p.filter((x) => x.id !== it.id))} className="px-1.5 py-0.5 text-red-300" aria-label="Ukloni">✕</button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted">
            Prva slika je glavna. Redosled menjate strelicama ili prevlačenjem. Izmene se čuvaju tek na „Sačuvaj proizvod“.
          </p>
        </>
      )}
    </div>
  );
}
