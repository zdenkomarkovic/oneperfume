"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { unitPrice, type CartProduct } from "@/lib/products";

interface CartLine {
  slug: string;
  qty: number;
  variant?: string;
  product: CartProduct; // snimak proizvoda (cena se na serveru ponovo računa)
}

export interface CartItem {
  key: string;
  product: CartProduct;
  variant?: string;
  price: number;
  qty: number;
}

interface CartCtx {
  lines: CartItem[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (product: CartProduct, qty?: number, variant?: string) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const keyOf = (l: { slug: string; variant?: string }) => (l.variant ? `${l.slug}::${l.variant}` : l.slug);

const Ctx = createContext<CartCtx | null>(null);
const KEY = "oneperfume-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY);
      if (s) setRaw((JSON.parse(s) as CartLine[]).filter((l) => l?.product?.slug));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(raw));
    } catch {}
  }, [raw, ready]);

  const add = useCallback((product: CartProduct, qty = 1, variant?: string) => {
    const slug = product.slug;
    setRaw((prev) => {
      const k = keyOf({ slug, variant });
      const ex = prev.find((l) => keyOf(l) === k);
      if (ex) return prev.map((l) => (keyOf(l) === k ? { ...l, qty: Math.min(l.qty + qty, 20) } : l));
      return [...prev, { slug, qty, variant, product }];
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setRaw((prev) =>
      qty <= 0 ? prev.filter((l) => keyOf(l) !== key) : prev.map((l) => (keyOf(l) === key ? { ...l, qty: Math.min(qty, 20) } : l)),
    );
  }, []);
  const remove = useCallback((key: string) => setRaw((p) => p.filter((l) => keyOf(l) !== key)), []);
  const clear = useCallback(() => setRaw([]), []);

  const value = useMemo<CartCtx>(() => {
    const lines: CartItem[] = [];
    for (const l of raw) {
      lines.push({ key: keyOf(l), product: l.product, variant: l.variant, price: unitPrice(l.product, l.variant), qty: l.qty });
    }
    return {
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      total: lines.reduce((s, l) => s + l.price * l.qty, 0),
      open,
      setOpen,
      add,
      setQty,
      remove,
      clear,
    };
  }, [raw, open, add, setQty, remove, clear]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart mora biti unutar CartProvider");
  return c;
}
