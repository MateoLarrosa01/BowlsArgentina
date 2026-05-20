import { createAdminSupabaseClient } from "@/lib/supabase/admin";

/** Lista capitanes (perfil + correo) usando service role; solo desde servidor. */
export async function listarCapitanes() {
  const admin = createAdminSupabaseClient();

  const { data: perfiles, error: errPerfiles } = await admin
    .from("perfiles")
    .select("id, creado_en")
    .eq("rol", "capitan")
    .order("creado_en", { ascending: false });

  if (errPerfiles) {
    return { capitanes: [], error: errPerfiles.message };
  }

  const ids = new Set((perfiles ?? []).map((p) => p.id));
  if (!ids.size) {
    return { capitanes: [], error: null };
  }

  const { data: listado, error: errAuth } = await admin.auth.admin.listUsers({
    perPage: 1000,
  });

  if (errAuth) {
    return { capitanes: [], error: errAuth.message };
  }

  const porId = Object.fromEntries((perfiles ?? []).map((p) => [p.id, p.creado_en]));

  const capitanes = (listado.users ?? [])
    .filter((u) => ids.has(u.id))
    .map((u) => ({
      id: u.id,
      correo: u.email ?? "—",
      creado_en: porId[u.id] ?? u.created_at,
    }))
    .sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));

  return { capitanes, error: null };
}
