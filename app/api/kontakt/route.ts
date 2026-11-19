import { NextResponse } from "next/server";
import { z } from "zod";
import { exec } from "@/lib/db";
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
  await exec("INSERT INTO messages (name, email, message) VALUES (?,?,?)", [name, email, message]).catch((e) => console.error("[contact:db]", e));
  const ok = await sendMail(`Nova poruka sa sajta – ${name}`, `Ime: ${name}\nEmail: ${email}\n\n${message}`, email);
  // Poruka je sačuvana u admin panelu bez obzira na mail.
  return NextResponse.json({ ok: true, mailSent: ok });
}
