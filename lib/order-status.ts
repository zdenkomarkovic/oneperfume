export const ORDER_STATUSES = ["ceka_placanje", "novo", "potvrdjeno", "poslato", "isporuceno", "otkazano"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  ceka_placanje: "Čeka plaćanje",
  novo: "Nova",
  potvrdjeno: "Potvrđena",
  poslato: "Poslata",
  isporuceno: "Isporučena",
  otkazano: "Otkazana",
};

export const STATUS_STYLE: Record<OrderStatus, string> = {
  ceka_placanje: "border-line text-muted",
  novo: "border-amber-400/50 text-amber-300",
  potvrdjeno: "border-sky-400/50 text-sky-300",
  poslato: "border-violet-400/50 text-violet-300",
  isporuceno: "border-emerald-400/50 text-emerald-300",
  otkazano: "border-red-400/40 text-red-300",
};

export const PAYMENT_STATUSES = ["cekanje", "placeno", "neuspelo", "vraceno"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  cekanje: "Na čekanju",
  placeno: "Plaćeno",
  neuspelo: "Neuspelo",
  vraceno: "Vraćeno",
};

export const PAYMENT_METHOD_LABEL = { pouzece: "Pouzećem (kuriru)", kartica: "Kartica" } as const;
