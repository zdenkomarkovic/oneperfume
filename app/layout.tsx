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
  applicationName: SITE_NAME,
  keywords: ["parfimerija Leskovac", "parfemi", "arapski parfemi", "Armaf", "Lattafa", "Afnan", "Paris Corner", "Al Haramain", "originalni parfemi", "online prodavnica parfema"],
  openGraph: {
    type: "website",
    locale: "sr_RS",
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: "/logo-dark.png", width: 1088, height: 1088, alt: SITE_NAME }],
  },
  twitter: { card: "summary", images: ["/logo-dark.png"] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  ...(process.env.GOOGLE_SITE_VERIFICATION && { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }),
};

const siteJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "sr-RS",
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo-dark.png`,
    email: "oneperfume@oneperfume.rs",
    telephone: "+381 62 488 248",
  },
];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories().catch(() => []);
  return (
    <html lang="sr" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }} />
        <SiteShell categories={categories}>{children}</SiteShell>
      </body>
    </html>
  );
}
