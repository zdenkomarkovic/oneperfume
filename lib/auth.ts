import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";

const COOKIE = "op_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

const key = () => {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET mora imati bar 32 karaktera");
  return new TextEncoder().encode(s);
};

export interface Session {
  id: number;
  email: string;
}

export async function createSession(s: Session) {
  const token = await new SignJWT({ email: s.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(s.id))
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return { id: Number(payload.sub), email: String(payload.email) };
  } catch {
    return null;
  }
}

/** Za server stranice i server akcije – preusmerava na login ako nije prijavljen. */
export async function requireAdmin(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}
