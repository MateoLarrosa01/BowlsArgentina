import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
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
import { urlPublicaGaleria } from "@/lib/galeria-fotos";
import { idEnEdicion, urlCancelarEdicion, urlEditar } from "@/lib/gestion/url-edicion";
import {
  actualizarFotoGaleria,
  eliminarFotoGaleria,
  subirFotoGaleria,
} from "./actions";

const RUTA = "/gestion/fotos";

export default async function GestionFotosPage({ searchParams }) {
  const supabase = await createServerSupabaseClient();
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";
  const editarId = idEnEdicion(sp);

  const { data: fotos, error } = await supabase
    .from("fotos_galeria")
    .select("id, titulo, ruta_storage, orden, publicada, creado_en")
    .order("orden", { ascending: true })
    .order("creado_en", { ascending: false });

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/gestion" className="font-medium text-emerald-800 hover:underline">
          Gestión
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Galería de fotos</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Galería de fotos</h1>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          Subí imágenes para la página pública{" "}
          <Link href="/fotos" className="font-medium text-emerald-800 hover:underline" target="_blank">
            Fotos
          </Link>
          . Formatos: JPG, PNG, WebP o GIF (máx. 5 MB).
        </p>
      </header>

      <AlertasFlash mensaje={mensaje} ok={ok} okTexto="Cambios guardados." />
      {error && <p className="mt-6 text-sm text-red-700">{error.message}</p>}

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-emerald-950">Subir foto</h2>
        <form action={subirFotoGaleria} className="mt-4 space-y-4" encType="multipart/form-data">
          <div>
            <label htmlFor="archivo" className="block text-sm font-medium text-stone-700">
              Imagen *
            </label>
            <input
              id="archivo"
              name="archivo"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required
              className="mt-1 block w-full text-sm"
            />
          </div>
          <div>
            <label htmlFor="titulo-nueva" className="block text-sm font-medium text-stone-700">
              Título (opcional)
            </label>
            <input
              id="titulo-nueva"
              name="titulo"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3"
            />
          </div>
          <div>
            <label htmlFor="orden-nueva" className="block text-sm font-medium text-stone-700">
              Orden
            </label>
            <input
              id="orden-nueva"
              name="orden"
              type="number"
              defaultValue={0}
              className="mt-1 w-24 min-h-[44px] rounded-lg border border-stone-300 px-3"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-emerald-800 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-900"
          >
            Subir
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Listado</h2>
        <TablaGestion vacio={!fotos?.length && !error ? "No hay fotos en la galería." : null}>
          <thead>
            <tr>
              <Th>Vista</Th>
              <Th>Título</Th>
              <Th>Orden</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {(fotos ?? []).map((f) => {
              const url = urlPublicaGaleria(supabase, f.ruta_storage);
              return (
                <Fragment key={f.id}>
                  <tr className={editarId === f.id ? "bg-emerald-50/40" : undefined}>
                    <Td>
                      {url ? (
                        <div className="relative h-14 w-20 overflow-hidden rounded-md bg-stone-100">
                          <Image src={url} alt="" fill className="object-cover" sizes="80px" />
                        </div>
                      ) : (
                        "—"
                      )}
                    </Td>
                    <Td>{f.titulo || "Sin título"}</Td>
                    <Td>{f.orden}</Td>
                    <Td>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          f.publicada
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {f.publicada ? "Publicada" : "Oculta"}
                      </span>
                    </Td>
                    <Td className="text-right">
                      {editarId !== f.id && <BotonEditar href={urlEditar(RUTA, f.id)} />}
                    </Td>
                  </tr>
                  {editarId === f.id && (
                    <FilaEdicion colSpan={5}>
                      <form action={actualizarFotoGaleria} className="grid gap-4 sm:max-w-lg">
                        <input type="hidden" name="id" value={f.id} />
                        <div>
                          <label className="text-sm font-medium text-stone-700">Título</label>
                          <input
                            name="titulo"
                            defaultValue={f.titulo ?? ""}
                            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                          />
                        </div>
                        <div className="flex flex-wrap items-end gap-4">
                          <div>
                            <label className="text-sm font-medium text-stone-700">Orden</label>
                            <input
                              name="orden"
                              type="number"
                              defaultValue={f.orden}
                              className="mt-1 w-24 rounded-lg border border-stone-300 px-3 py-2"
                            />
                          </div>
                          <label className="flex items-center gap-2 pb-2 text-sm">
                            <input name="publicada" type="checkbox" defaultChecked={f.publicada} />
                            Visible en el sitio
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="submit"
                            className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700"
                          >
                            Guardar
                          </button>
                          <BotonCancelarEdicion href={urlCancelarEdicion(sp, RUTA)} />
                        </div>
                      </form>
                      <form action={eliminarFotoGaleria} className="mt-4 border-t border-stone-200 pt-4">
                        <input type="hidden" name="id" value={f.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50"
                        >
                          Eliminar foto
                        </button>
                      </form>
                    </FilaEdicion>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </TablaGestion>
      </section>
    </ContenedorPagina>
  );
}
