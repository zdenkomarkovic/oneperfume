import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC = new Set(["/admin/login", "/admin/zaboravljena-lozinka", "/admin/reset-lozinke"]);

// Štiti ceo /admin (osim /admin/login) pre nego što se išta renderuje ili izvrši.
// Server akcije se šalju na iste putanje, pa su ovim pokrivene, a dodatno proveravaju sesiju same.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC.has(pathname)) return NextResponse.next();

  const token = req.cookies.get("op_admin")?.value;
  const secret = process.env.AUTH_SECRET;
  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.next();
    } catch {}
  }
  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = { matcher: ["/admin/:path*"] };
