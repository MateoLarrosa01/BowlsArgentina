import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

/**
 * Refresca la sesión de Supabase en cada solicitud (cookies).
 * Sin variables públicas de Supabase, deja pasar la petición sin error (p. ej. CI o preview sin env).
 */
export async function actualizarSesionSupabase(request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.next({ request });
  }

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(lista) {
        lista.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        respuesta = NextResponse.next({ request });
        lista.forEach(({ name, value, options }) => {
          respuesta.cookies.set(name, value, options);
        });
      },
    },
  });

  await supabase.auth.getUser();

  return respuesta;
}
