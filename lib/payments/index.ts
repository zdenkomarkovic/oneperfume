import "server-only";
import { allsecure } from "./allsecure";
import { mock } from "./mock";
import type { PaymentProvider } from "./types";

export type { PaymentProvider, PaymentSession } from "./types";

/**
 * Aktivni procesor kartičnog plaćanja bira se promenljivom PAYMENT_PROVIDER:
 *   (prazno)   – kartično plaćanje je isključeno, sajt radi samo sa pouzećem
 *   mock       – lažni gateway za razvoj/testiranje (ne radi u produkciji)
 *   allsecure  – AllSecure (vidi lib/payments/allsecure.ts)
 * Ceo ostatak sajta zna samo za ovaj interfejs, pa promena banke/procesora menja samo jedan fajl.
 */
export function getProvider(): PaymentProvider | null {
  switch (process.env.PAYMENT_PROVIDER) {
    case "mock":
      return process.env.NODE_ENV === "production" ? null : mock;
    case "allsecure":
      return allsecure;
    default:
      return null;
  }
}

export const cardPaymentsEnabled = () => getProvider() !== null;
