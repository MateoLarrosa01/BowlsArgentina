import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { actualizarClub, crearClub } from "./actions";

export default async function AdminClubesPage({ searchParams }) {
  const supabase = await createServerSupabaseClient();

  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";

  const { data: clubes, error } = await supabase
    .from("clubes")
    .select("id, nombre, nombre_corto, correo_contacto, telefono, activo")
    .order("nombre");

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/gestion" className="font-medium text-emerald-800 hover:underline">
          Gestión
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Clubes</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Clubes</h1>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          Alta y edición de clubes afiliados. Los cambios impactan en equipos e
          inscripciones.
        </p>
      </header>

      {mensaje && (
        <p
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {mensaje}
        </p>
      )}
      {ok && (
        <p
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Guardado correctamente.
        </p>
      )}

      {error && (
        <p className="mt-6 text-sm text-red-700">Error al cargar: {error.message}</p>
      )}

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Nuevo club</h2>
        <form action={crearClub} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-stone-700" htmlFor="n-nombre">
              Nombre
            </label>
            <input
              id="n-nombre"
              name="nombre"
              required
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700" htmlFor="n-corto">
              Nombre corto
            </label>
            <input
              id="n-corto"
              name="nombre_corto"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700" htmlFor="n-mail">
              Correo
            </label>
            <input
              id="n-mail"
              name="correo_contacto"
              type="email"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-stone-700" htmlFor="n-tel">
              Teléfono
            </label>
            <input
              id="n-tel"
              name="telefono"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="min-h-[48px] rounded-xl bg-emerald-700 px-6 text-base font-semibold text-white hover:bg-emerald-600"
            >
              Crear club
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Listado</h2>
        {!clubes?.length && !error && (
          <p className="mt-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-stone-600">
            Todavía no hay clubes cargados.
          </p>
        )}
        <ul className="mt-4 space-y-6">
          {(clubes ?? []).map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <form action={actualizarClub} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="id" value={c.id} />
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700">
                    Nombre
                  </label>
                  <input
                    name="nombre"
                    required
                    defaultValue={c.nombre}
                    className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Nombre corto
                  </label>
                  <input
                    name="nombre_corto"
                    defaultValue={c.nombre_corto ?? ""}
                    className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Correo
                  </label>
                  <input
                    name="correo_contacto"
                    type="email"
                    defaultValue={c.correo_contacto ?? ""}
                    className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700">
                    Teléfono
                  </label>
                  <input
                    name="telefono"
                    defaultValue={c.telefono ?? ""}
                    className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
                  />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <input
                    id={`activo-${c.id}`}
                    name="activo"
                    type="checkbox"
                    value="true"
                    defaultChecked={c.activo}
                    className="h-5 w-5 rounded border-stone-400 text-emerald-700"
                  />
                  <label htmlFor={`activo-${c.id}`} className="text-sm text-stone-700">
                    Club activo
                  </label>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="min-h-[48px] rounded-xl border border-emerald-700 bg-white px-5 text-base font-semibold text-emerald-800 hover:bg-emerald-50"
                  >
                    Guardar cambios
                  </button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </ContenedorPagina>
  );
}
