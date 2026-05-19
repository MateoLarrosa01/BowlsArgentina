import Link from "next/link";
import Image from "next/image";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { urlPublicaGaleria } from "@/lib/galeria-fotos";
import {
  actualizarFotoGaleria,
  eliminarFotoGaleria,
  subirFotoGaleria,
} from "./actions";

export default async function GestionFotosPage({ searchParams }) {
  const supabase = await createServerSupabaseClient();
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";

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

      {mensaje && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {mensaje}
        </p>
      )}
      {ok && (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          Cambios guardados.
        </p>
      )}
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
            <label htmlFor="titulo" className="block text-sm font-medium text-stone-700">
              Título (opcional)
            </label>
            <input
              id="titulo"
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

      <ul className="mt-10 space-y-6">
        {(fotos ?? []).map((f) => {
          const url = urlPublicaGaleria(supabase, f.ruta_storage);
          return (
            <li
              key={f.id}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row">
                {url && (
                  <div className="relative h-32 w-48 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                    <Image src={url} alt="" fill className="object-cover" sizes="192px" />
                  </div>
                )}
                <form action={actualizarFotoGaleria} className="flex flex-1 flex-col gap-3">
                  <input type="hidden" name="id" value={f.id} />
                  <div>
                    <label className="text-sm font-medium text-stone-700">Título</label>
                    <input
                      name="titulo"
                      defaultValue={f.titulo ?? ""}
                      className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2"
                    />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div>
                      <label className="text-sm font-medium text-stone-700">Orden</label>
                      <input
                        name="orden"
                        type="number"
                        defaultValue={f.orden}
                        className="mt-1 w-24 rounded-lg border border-stone-300 px-3 py-2"
                      />
                    </div>
                    <label className="flex items-center gap-2 pt-6 text-sm">
                      <input name="publicada" type="checkbox" defaultChecked={f.publicada} />
                      Visible en el sitio
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="self-start rounded-lg bg-stone-800 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700"
                  >
                    Guardar
                  </button>
                </form>
                <form action={eliminarFotoGaleria}>
                  <input type="hidden" name="id" value={f.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </ContenedorPagina>
  );
}


