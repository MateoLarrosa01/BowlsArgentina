import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { rutaInstitucional } from "@/lib/contenido-institucional";
import { actualizarPaginaInstitucional } from "./actions";

export default async function GestionContenidoPage({ searchParams }) {
  const supabase = await createServerSupabaseClient();
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";

  const { data: paginas, error } = await supabase
    .from("paginas_institucionales")
    .select("id, slug, titulo, contenido, publicada, orden")
    .order("orden", { ascending: true })
    .order("titulo", { ascending: true });

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/gestion" className="font-medium text-emerald-800 hover:underline">
          Gestión
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Contenido institucional</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          Contenido institucional
        </h1>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          Editá textos visibles en el sitio público (por ejemplo Quiénes somos).
          El formulario de contacto está en la página Contacto. Los párrafos se
          separan con una línea en blanco.
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

      <ul className="mt-10 space-y-8">
        {(paginas ?? []).map((p) => (
          <li
            key={p.id}
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-emerald-950">{p.titulo}</h2>
              <span className="text-sm text-stone-500">
                Slug: <code className="rounded bg-stone-100 px-1.5 py-0.5">{p.slug}</code>
                {p.publicada ? (
                  <>
                    {" "}
                    ·{" "}
                    <Link
                      href={rutaInstitucional(p.slug)}
                      className="font-medium text-emerald-800 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver página pública →
                    </Link>
                  </>
                ) : (
                  <span className="text-amber-700"> · No publicada</span>
                )}
              </span>
            </div>

            <form action={actualizarPaginaInstitucional} className="mt-4 grid gap-4">
              <input type="hidden" name="id" value={p.id} />
              <div>
                <label
                  className="block text-sm font-medium text-stone-700"
                  htmlFor={`titulo-${p.id}`}
                >
                  Título
                </label>
                <input
                  id={`titulo-${p.id}`}
                  name="titulo"
                  required
                  defaultValue={p.titulo}
                  className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-stone-700"
                  htmlFor={`contenido-${p.id}`}
                >
                  Contenido
                </label>
                <textarea
                  id={`contenido-${p.id}`}
                  name="contenido"
                  rows={8}
                  defaultValue={p.contenido}
                  className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-base leading-relaxed"
                />
              </div>
              <label className="flex min-h-[44px] items-center gap-2 text-base text-stone-700">
                <input
                  type="checkbox"
                  name="publicada"
                  defaultChecked={p.publicada}
                  className="h-5 w-5 rounded border-stone-300"
                />
                Visible en el sitio público
              </label>
              <div>
                <button
                  type="submit"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-700 px-6 text-base font-semibold text-white hover:bg-emerald-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </li>
        ))}
      </ul>

      {!paginas?.length && !error && (
        <p className="mt-10 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-stone-600">
          No hay páginas. Ejecutá la migración{" "}
          <code className="text-sm">20260518120000_paginas_institucionales.sql</code> en
          Supabase.
        </p>
      )}
    </ContenedorPagina>
  );
}
