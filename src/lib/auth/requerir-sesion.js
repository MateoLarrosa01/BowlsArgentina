import { redirect } from "next/navigation";
import { createServerSupabaseClientOpcional } from "@/lib/supabase/server";

/** Exige usuario autenticado; devuelve supabase, user y perfil. */
export async function requerirSesion(rutaSiguiente = "/panel") {
  const supabase = await createServerSupabaseClientOpcional();
  if (!supabase) {
    redirect(rutaSiguiente);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/iniciar-sesion?siguiente=${encodeURIComponent(rutaSiguiente)}`);
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, perfil };
}
