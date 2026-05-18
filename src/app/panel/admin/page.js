import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ContenedorPagina } from "@/components/contenedor-pagina";

const tarjetas = [
  {
    titulo: "Clubes",
    descripcion: "Alta y edición de clubes afiliados.",
    href: "/panel/admin/clubes",
  },
  {
    titulo: "Torneos",
    descripcion: "Crear torneos, divisiones, equipos y encuentros de demostración.",
    href: "/panel/admin/torneos",
  },
];

export default async function PanelAdminInicioPage() {
  const supabase = await createServerSupabaseClient();
  const { count: nClubes } = await supabase
    .from("clubes")
    .select("id", { count: "exact", head: true });
  const { count: nTorneos } = await supabase
    .from("torneos")
    .select("id", { count: "exact", head: true });

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/panel" className="font-medium text-emerald-800 hover:underline">
          Mi panel
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Administración</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          Administración
        </h1>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          Herramientas de la federación: cargá clubes,
          un torneo en borrador, divisiones y equipos, publicá el torneo y
          revisá la vista pública con fixture básico.
        </p>
        <p className="mt-3 text-sm text-stone-500">
          Resumen rápido:{" "}
          <strong>{nClubes ?? 0}</strong> clubes ·{" "}
          <strong>{nTorneos ?? 0}</strong> torneos en base.
        </p>
      </header>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2">
        {tarjetas.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="flex h-full min-h-[120px] flex-col justify-center rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
            >
              <span className="text-lg font-semibold text-emerald-950">
                {t.titulo}
              </span>
              <span className="mt-2 text-sm leading-relaxed text-stone-600">
                {t.descripcion}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-center text-sm text-stone-500">
        <Link href="/torneos" className="font-medium text-emerald-800 hover:underline">
          Ver torneos publicados (vista pública)
        </Link>
      </p>
    </ContenedorPagina>
  );
}
