import type { PaymentProvider } from "./types";

/**
 * AllSecure – PLACEHOLDER. Čeka se dokumentacija i test nalog.
 *
 * Kad stignu pristupni podaci, potrebno je popuniti samo ova dva metoda:
 *  1) createSession  – poziv API-ja procesora (iznos u RSD, valuta, orderId/token kao referenca,
 *                      success/failure/cancel URL-ovi ka /placanje/rezultat?token=..., callback URL
 *                      ka /api/placanje/callback) i vraćanje adrese stranice za plaćanje.
 *  2) parseCallback  – provera potpisa (HMAC/shared secret iz dokumentacije) i čitanje statusa,
 *                      ID-a transakcije i iznosa. Bez ispravnog potpisa se baca greška.
 *
 * Env promenljive (vidi .env.example): ALLSECURE_API_URL, ALLSECURE_API_KEY, ALLSECURE_SECRET.
 */
export const allsecure: PaymentProvider = {
  name: "allsecure",
  async createSession() {
    throw new Error("AllSecure integracija još nije podešena (lib/payments/allsecure.ts)");
  },
  async parseCallback() {
    throw new Error("AllSecure integracija još nije podešena (lib/payments/allsecure.ts)");
  },
};
