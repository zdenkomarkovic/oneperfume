"use client";

import { useEffect } from "react";
import { useCart } from "./CartProvider";

/** Prazni korpu kad je kartično plaćanje potvrđeno. */
export function ClearCart() {
  const { clear } = useCart();
  useEffect(() => clear(), [clear]);
  return null;
}
