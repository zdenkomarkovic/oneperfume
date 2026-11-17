import { NextResponse } from "next/server";
import { z } from "zod";
import { sendMail } from "@/lib/mail";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(150),
  message: z.string().trim().min(5).max(3000),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Neispravni podaci" }, { status: 400 });
  const { name, email, message } = parsed.data;
  const ok = await sendMail(`Nova poruka sa sajta – ${name}`, `Ime: ${name}\nEmail: ${email}\n\n${message}`, email);
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
