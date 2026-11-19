import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { SiteShell } from "@/components/layout/SiteShell";
import { getCategories } from "@/lib/catalog";

// Katalog dolazi iz baze – stranice se ne prave u build-u.
export const dynamic = "force-dynamic";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
});
const manrope = Manrope({ subsets: ["latin", "latin-ext"], variable: "--font-manrope" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${SITE_NAME} – Vaš svet parfema`, template: `%s | ${SITE_NAME}` },
  description:
    "One Perfume – Mirisom ispričana priča. Parfemi Armaf, Lattafa, Afnan, Paris Corner, Al Haramain i drugih brendova. Leskovac.",
  openGraph: { type: "website", locale: "sr_RS", url: SITE_URL, siteName: SITE_NAME },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories().catch(() => []);
  return (
    <html lang="sr" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <SiteShell categories={categories}>{children}</SiteShell>
      </body>
    </html>
  );
}
