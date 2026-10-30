import { NextResponse, type NextRequest } from "next/server";

// Español primero: toda ruta pública sin prefijo de idioma va a /es/...
// ("/" → "/es", "/precios" → "/es/precios"). Así ninguna página recibe un
// idioma inválido.
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const first = pathname.split("/")[1];
  if (first === "es" || first === "en") return NextResponse.next();
  const url = new URL(`/es${pathname === "/" ? "" : pathname}${search}`, req.url);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next|api|admin|icon|robots\\.txt|sitemap\\.xml|favicon\\.ico).*)"],
};
