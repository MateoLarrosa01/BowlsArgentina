import Link from "next/link";
import { redirect } from "next/navigation";
import { esRolAdministracion } from "@/lib/auth/requerir-admin";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { createServerSupabaseClientOpcional } from "@/lib/supabase/server";

function etiquetaRol(rol) {
  if (rol === "super_admin") return "Superadministrador";
  if (rol === "admin_fab") return "Administrador FAB";
  if (rol === "capitan") return "Capitán";
  return rol ?? "—";
}

export default async function PanelPage() {
  const supabase = await createServerSupabaseClientOpcional();

  if (!supabase) {
    return (
      <ContenedorPagina>
        <h1 className="text-2xl font-bold text-stone-900">Mi panel</h1>
        <p className="mt-4 text-base text-stone-600">
          Configurá Supabase en{" "}
          <code className="rounded bg-stone-200 px-1.5 py-0.5 text-sm">
            .env.local
          </code>{" "}
          para usar el panel con sesión.
        </p>
      </ContenedorPagina>
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/iniciar-sesion?siguiente=/panel");
  }

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("rol, creado_en")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <ContenedorPagina>
      <h1 className="text-2xl font-bold text-stone-900">Mi panel</h1>
      <p className="mt-2 text-base text-stone-600">
        Resumen de tu sesión. Desde acá accedés a la administración si tenés rol
        de federación.
      </p>

      {esRolAdministracion(perfil?.rol) && (
        <div className="mt-6">
          <Link
            href="/panel/admin"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-700 px-6 text-base font-semibold text-white shadow-sm hover:bg-emerald-600"
          >
            Ir a administración (demo MVP)
          </Link>
        </div>
      )}

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <dl className="space-y-4 text-base">
          <div>
            <dt className="text-sm font-medium text-stone-500">Correo</dt>
            <dd className="mt-1 font-medium text-stone-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-stone-500">Rol en la app</dt>
            <dd className="mt-1 font-medium text-stone-900">
              {perfil ? etiquetaRol(perfil.rol) : "Sin fila en perfiles (revisá migraciones)"}
            </dd>
          </div>
        </dl>

        {(perfil?.rol === "super_admin" || perfil?.rol === "admin_fab") && (
          <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            Podés cargar <strong>clubes</strong>, armar un <strong>torneo</strong>{" "}
            (divisiones, equipos y encuentros) y <strong>publicarlo</strong> para
            que se vea en la vista pública sin necesidad de cuenta.
          </div>
        )}

        <p className="mt-6 text-sm text-stone-500">
          <Link href="/torneos" className="font-medium text-emerald-800 hover:underline">
            Ir a torneos públicos
          </Link>
        </p>
      </section>
    </ContenedorPagina>
  );
}
