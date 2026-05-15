import Link from "next/link";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { createServerSupabaseClientOpcional } from "@/lib/supabase/server";

export const metadata = {
  title: "Torneos",
};

export default async function TorneosPage() {
  const supabase = await createServerSupabaseClientOpcional();

  if (!supabase) {
    return (
      <ContenedorPagina>
        <h1 className="text-2xl font-bold text-stone-900">Torneos</h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-600">
          Para listar torneos reales, configurá{" "}
          <code className="rounded bg-stone-200 px-1.5 py-0.5 text-sm">
            .env.local
          </code>{" "}
          con las variables de Supabase indicadas en el README.
        </p>
      </ContenedorPagina>
    );
  }

  const { data: torneos, error } = await supabase
    .from("torneos")
    .select("id, nombre, temporada, estado, actualizado_en")
    .eq("estado", "publicado")
    .order("actualizado_en", { ascending: false });

  return (
    <ContenedorPagina>
      <header className="border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          Torneos publicados
        </h1>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          Torneos visibles para todos los visitantes. Los borradores solo los ven
          usuarios con rol de administración.
        </p>
      </header>

      {error && (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-base text-amber-950">
          No se pudo cargar la lista: {error.message}
        </p>
      )}

      {!error && (!torneos || torneos.length === 0) && (
        <p className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-base text-stone-600">
          Aún no hay torneos en estado{" "}
          <strong className="text-stone-800">publicado</strong>. Cuando la
          federación publique uno, aparecerá aquí.
        </p>
      )}

      {torneos && torneos.length > 0 && (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {torneos.map((t) => (
            <li key={t.id}>
              <Link
                href={`/torneos/${t.id}`}
                className="flex min-h-[52px] flex-col justify-center rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
              >
                <span className="text-lg font-semibold text-emerald-950">
                  {t.nombre}
                </span>
                <span className="mt-1 text-sm text-stone-500">
                  Temporada {t.temporada}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </ContenedorPagina>
  );
}
