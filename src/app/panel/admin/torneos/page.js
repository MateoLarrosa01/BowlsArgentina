import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ContenedorPagina } from "@/components/contenedor-pagina";

export default async function AdminTorneosPage({ searchParams }) {
  const supabase = await createServerSupabaseClient();
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";

  const { data: torneos, error } = await supabase
    .from("torneos")
    .select("id, nombre, temporada, estado, actualizado_en")
    .order("actualizado_en", { ascending: false });

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/panel/admin" className="font-medium text-emerald-800 hover:underline">
          Administración
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Torneos</span>
      </nav>

      <header className="mt-4 flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Torneos</h1>
          <p className="mt-2 max-w-xl text-base text-stone-600">
            Gestioná el ciclo de vida: borrador → publicado para mostrar al público.
          </p>
        </div>
        <Link
          href="/panel/admin/torneos/nuevo"
          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-700 px-5 text-base font-semibold text-white hover:bg-emerald-600"
        >
          Nuevo torneo
        </Link>
      </header>

      {mensaje && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {mensaje}
        </p>
      )}
      {ok && (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          Listo.
        </p>
      )}

      {error && (
        <p className="mt-6 text-sm text-red-700">{error.message}</p>
      )}

      {!torneos?.length && !error && (
        <p className="mt-10 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-stone-600">
          No hay torneos todavía. Creá el primero para la demo.
        </p>
      )}

      <ul className="mt-8 space-y-3">
        {(torneos ?? []).map((t) => (
          <li key={t.id}>
            <Link
              href={`/panel/admin/torneos/${t.id}`}
              className="flex flex-col gap-1 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <span className="text-lg font-semibold text-emerald-950">{t.nombre}</span>
                <p className="text-sm text-stone-500">
                  {t.temporada} ·{" "}
                  <span className="capitalize font-medium text-stone-700">{t.estado}</span>
                </p>
              </div>
              <span className="text-sm font-medium text-emerald-800">Editar →</span>
            </Link>
          </li>
        ))}
      </ul>
    </ContenedorPagina>
  );
}
