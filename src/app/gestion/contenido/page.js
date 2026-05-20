import { Fragment } from "react";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { AlertasFlash } from "@/components/gestion/alertas-flash";
import {
  BotonCancelarEdicion,
  BotonEditar,
  FilaEdicion,
  TablaGestion,
  Td,
  Th,
} from "@/components/gestion/tabla-gestion";
import { rutaInstitucional } from "@/lib/contenido-institucional";
import { idEnEdicion, urlCancelarEdicion, urlEditar } from "@/lib/gestion/url-edicion";
import { actualizarPaginaInstitucional } from "./actions";

const RUTA = "/gestion/contenido";

export default async function GestionContenidoPage({ searchParams }) {
  const supabase = await createServerSupabaseClient();
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";
  const editarId = idEnEdicion(sp);

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
          Editá textos visibles en el sitio público (por ejemplo Quiénes somos). El formulario
          de contacto está en la página Contacto. Los párrafos se separan con una línea en blanco.
        </p>
      </header>

      <AlertasFlash mensaje={mensaje} ok={ok} />
      {error && <p className="mt-6 text-sm text-red-700">Error al cargar: {error.message}</p>}

      <section className="mt-10">
        <TablaGestion
          vacio={
            !paginas?.length && !error
              ? "No hay páginas. Ejecutá la migración de páginas institucionales en Supabase."
              : null
          }
        >
          <thead>
            <tr>
              <Th>Título</Th>
              <Th>Slug</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {(paginas ?? []).map((p) => (
              <Fragment key={p.id}>
                <tr className={editarId === p.id ? "bg-emerald-50/40" : undefined}>
                  <Td>
                    <span className="font-medium text-emerald-950">{p.titulo}</span>
                  </Td>
                  <Td>
                    <code className="rounded bg-stone-100 px-1.5 py-0.5 text-xs">{p.slug}</code>
                  </Td>
                  <Td>
                    {p.publicada ? (
                      <Link
                        href={rutaInstitucional(p.slug)}
                        className="text-sm font-medium text-emerald-800 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Publicada →
                      </Link>
                    ) : (
                      <span className="text-sm text-amber-700">No publicada</span>
                    )}
                  </Td>
                  <Td className="text-right">
                    {editarId !== p.id && <BotonEditar href={urlEditar(RUTA, p.id)} />}
                  </Td>
                </tr>
                {editarId === p.id && (
                  <FilaEdicion colSpan={4}>
                    <form action={actualizarPaginaInstitucional} className="grid gap-4">
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-700 px-6 text-base font-semibold text-white hover:bg-emerald-600"
                        >
                          Guardar
                        </button>
                        <BotonCancelarEdicion href={urlCancelarEdicion(sp, RUTA)} />
                      </div>
                    </form>
                  </FilaEdicion>
                )}
              </Fragment>
            ))}
          </tbody>
        </TablaGestion>
      </section>
    </ContenedorPagina>
  );
}
