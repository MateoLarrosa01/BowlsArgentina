import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para el navegador (componentes cliente y hooks).
 * Requiere NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan variables de entorno de Supabase. Copiá .env.example a .env.local y completá los valores.",
    );
  }

  return createBrowserClient(url, anonKey);
}
