import { NextResponse } from "next/server";
import { cardPaymentsEnabled } from "@/lib/payments";

export const dynamic = "force-dynamic";

/** Da li je kartično plaćanje uključeno (checkout po tome prikazuje izbor načina plaćanja). */
export async function GET() {
  return NextResponse.json({ card: cardPaymentsEnabled() });
}
