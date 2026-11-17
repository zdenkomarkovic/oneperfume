"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const SWIPE_PX = 50;

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const n = images.length;

  const go = useCallback((d: number) => setI((c) => (c + d + n) % n), [n]);

  // Tastatura + zaključavanje skrola dok je lightbox otvoren
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, go]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touch.current = { x: t.clientX, y: t.clientY };
    moved.current = false;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current;
    const t = e.changedTouches[0];
    touch.current = null;
    if (!s || !t || n < 2) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      moved.current = true;
      go(dx < 0 ? 1 : -1);
    }
  };

  const src = images[i] ?? images[0] ?? "";

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-square cursor-zoom-in overflow-hidden bg-surface-2"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => {
          if (moved.current) {
            moved.current = false;
            return;
          }
          setOpen(true);
        }}
        role="button"
        tabIndex={0}
        aria-label="Uvećaj sliku"
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(true)}
      >
        <Image src={src} alt={alt} fill priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <span className="pointer-events-none absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-bg/70 text-gold backdrop-blur-sm" aria-hidden>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4M11 8v6M8 11h6" />
          </svg>
        </span>
        {n > 1 && (
          <>
            <Arrow dir={-1} onClick={() => go(-1)} className="left-3 max-sm:hidden" />
            <Arrow dir={1} onClick={() => go(1)} className="right-3 max-sm:hidden" />
            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden" aria-hidden>
              {images.map((_, d) => (
                <span key={d} className={`h-1.5 rounded-full transition-all ${d === i ? "w-5 bg-gold" : "w-1.5 bg-white/40"}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {n > 1 && (
        <div className="flex gap-3 overflow-x-auto">
          {images.map((s, idx) => (
            <button
              key={s}
              onClick={() => setI(idx)}
              aria-label={`Slika ${idx + 1}`}
              className={`relative h-20 w-20 shrink-0 overflow-hidden bg-surface-2 ring-1 transition ${idx === i ? "ring-gold" : "ring-transparent opacity-60 hover:opacity-100"}`}
            >
              <Image src={s} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {open && (
        <div
          className="lightbox-in fixed inset-0 z-[90] flex items-center justify-center bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Pregled slike"
          onClick={() => setOpen(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            onClick={() => setOpen(false)}
            aria-label="Zatvori"
            className="absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center text-4xl leading-none text-ink/80 transition hover:rotate-90 hover:text-gold"
          >
            ×
          </button>
          {n > 1 && <span className="absolute left-5 top-6 z-10 text-xs tracking-[0.2em] text-muted">{i + 1} / {n}</span>}

          <div className="relative h-full w-full p-4 sm:p-12" onClick={(e) => e.stopPropagation()}>
            <Image key={src} src={src} alt={alt} fill sizes="100vw" className="lightbox-img object-contain" onClick={() => setOpen(false)} />
          </div>

          {n > 1 && (
            <>
              <Arrow dir={-1} onClick={() => go(-1)} className="left-3 sm:left-6" big />
              <Arrow dir={1} onClick={() => go(1)} className="right-3 sm:right-6" big />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Arrow({ dir, onClick, className = "", big = false }: { dir: 1 | -1; onClick: () => void; className?: string; big?: boolean }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={dir === 1 ? "Sledeća slika" : "Prethodna slika"}
      className={`absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full bg-bg/70 text-gold backdrop-blur-sm transition hover:bg-gold hover:text-bg ${big ? "h-12 w-12" : "h-10 w-10"} ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d={dir === 1 ? "m9 5 7 7-7 7" : "m15 5-7 7 7 7"} />
      </svg>
    </button>
  );
}
