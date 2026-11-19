"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartProvider } from "@/components/shop/CartProvider";
import { CartDrawer } from "@/components/shop/CartDrawer";
import type { Category } from "@/lib/products";

/** Javni deo sajta (header, footer, korpa). Admin panel (/admin) ima sopstveni izgled. */
export function SiteShell({ categories, children }: { categories: Category[]; children: React.ReactNode }) {
  const path = usePathname();
  if (path.startsWith("/admin")) return <>{children}</>;
  return (
    <CartProvider>
      <Header categories={categories} />
      <main>{children}</main>
      <Footer categories={categories} />
      <CartDrawer />
    </CartProvider>
  );
}
