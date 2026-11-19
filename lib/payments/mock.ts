import type { PaymentProvider } from "./types";

/** Lažni gateway za lokalni razvoj: preusmerava na /placanje/mock/[token] gde se plaćanje "odobri" ili "odbije". */
export const mock: PaymentProvider = {
  name: "mock",
  async createSession(order) {
    return { url: `/placanje/mock/${order.token}` };
  },
  async parseCallback() {
    return null; // mock stranica direktno poziva markPaid/markFailed
  },
};
