export interface PaymentSession {
  /** Adresa na koju se kupac preusmerava (stranica za unos kartice). */
  url: string;
}

export interface PaymentOrder {
  id: number;
  token: string; // public_token porudžbine
  total: number; // RSD
  email: string;
  name: string;
  description: string;
}

export interface CallbackResult {
  token: string;
  status: "placeno" | "neuspelo";
  transactionId?: string;
  amount?: number; // RSD, ako ga procesor šalje – proverava se sa iznosom porudžbine
}

export interface PaymentProvider {
  name: string;
  /** Pravi sesiju plaćanja kod procesora i vraća adresu za preusmeravanje. */
  createSession(order: PaymentOrder): Promise<PaymentSession>;
  /**
   * Obrađuje server-to-server obaveštenje procesora. MORA da proveri potpis/autentičnost
   * zahteva i baci grešku ako nije ispravan. Vraća null ako zahtev nije od interesa.
   */
  parseCallback(req: Request): Promise<CallbackResult | null>;
}
