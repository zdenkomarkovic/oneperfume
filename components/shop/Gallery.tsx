"use client";

import Image from "next/image";
import { useState } from "react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        <Image src={images[i] ?? images[0] ?? ""} alt={alt} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, idx) => (
            <button
              key={src}
              onClick={() => setI(idx)}
              aria-label={`Slika ${idx + 1}`}
              className={`relative h-20 w-20 overflow-hidden bg-surface-2 ring-1 transition ${idx === i ? "ring-gold" : "ring-transparent opacity-60 hover:opacity-100"}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
