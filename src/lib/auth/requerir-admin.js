import { redirect } from "next/navigation";
import { createServerSupabaseClientOpcional } from "@/lib/supabase/server";

export function esRolAdministracion(rol) {
  return rol === "super_admin" || rol === "admin_fab";
}

/**
 * Exige sesión y rol admin_fab o super_admin. Devuelve cliente Supabase y datos de sesión.
 */
export async function requerirAdministrador() {
  const supabase = await createServerSupabaseClientOpcional();
  if (!supabase) {
    redirect("/panel");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/iniciar-sesion?siguiente=/gestion");
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol")
    .eq("id", user.id)
    .maybeSingle();

  if (!esRolAdministracion(perfil?.rol)) {
    redirect("/panel");
  }

  return { supabase, user, perfil };
}