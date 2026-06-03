import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  // Solo interceptamos si intentan ir a /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = request.cookies.get("admin_session");
    
    // Si no tiene la cookie de sesión, lo mandamos al login
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Si tiene la cookie o va a otra página (como el catálogo), lo dejamos pasar normal
  return NextResponse.next();
}

// Configuración opcional para decirle a Next.js en qué rutas exactas correr esto
export const config = {
  matcher: ["/admin/:path*"],
};
