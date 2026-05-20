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
import { idEnEdicion, urlCancelarEdicion, urlEditar } from "@/lib/gestion/url-edicion";
import {
  actualizarEnlaceAsociado,
  crearEnlaceAsociado,
  eliminarEnlaceAsociado,
} from "./actions";

const RUTA = "/gestion/enlaces";

function Campo({ label, name, className = "", ...props }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
        {...props}
      />
    </div>
  );
}

export default async function GestionEnlacesPage({ searchParams }) {
  const supabase = await createServerSupabaseClient();
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";
  const editarId = idEnEdicion(sp);

  const { data: enlaces, error } = await supabase
    .from("enlaces_asociados")
    .select("*")
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true });

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/gestion" className="font-medium text-emerald-800 hover:underline">
          Gestión
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Enlaces y clubes</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Enlaces y clubes</h1>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          Datos visibles en{" "}
          <Link href="/links" className="font-medium text-emerald-800 hover:underline" target="_blank">
            Links
          </Link>
          . Podés cargar el escudo de cada club en el campo Logo (URL).
        </p>
      </header>

      <AlertasFlash mensaje={mensaje} ok={ok} />
      {error && <p className="mt-6 text-sm text-red-700">{error.message}</p>}

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-emerald-950">Nuevo enlace</h2>
        <form action={crearEnlaceAsociado} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo label="Nombre *" name="nombre" required />
          <Campo label="Orden" name="orden" type="number" defaultValue="0" />
          <Campo label="Dirección" name="direccion" className="sm:col-span-2" />
          <Campo label="Teléfono" name="telefono" />
          <Campo label="Correo" name="correo" type="email" />
          <Campo label="Instagram (URL)" name="url_instagram" className="sm:col-span-2" />
          <Campo label="Sitio web (URL)" name="url_web" className="sm:col-span-2" />
          <Campo label="Logo (URL imagen)" name="url_logo" className="sm:col-span-2" />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input name="activo" type="checkbox" defaultChecked />
            Visible en el sitio
          </label>
          <button
            type="submit"
            className="sm:col-span-2 rounded-xl bg-emerald-800 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-900"
          >
            Agregar
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Listado</h2>
        <TablaGestion vacio={!enlaces?.length && !error ? "No hay enlaces cargados." : null}>
          <thead>
            <tr>
              <Th>Orden</Th>
              <Th>Nombre</Th>
              <Th>Contacto</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {(enlaces ?? []).map((e) => (
              <Fragment key={e.id}>
                <tr className={editarId === e.id ? "bg-emerald-50/40" : undefined}>
                  <Td>{e.orden}</Td>
                  <Td>
                    <span className="font-medium">{e.nombre}</span>
                    {e.direccion && (
                      <p className="mt-0.5 max-w-xs truncate text-xs text-stone-500">{e.direccion}</p>
                    )}
                  </Td>
                  <Td>
                    {e.telefono && <p>{e.telefono}</p>}
                    {e.correo && <p className="truncate max-w-[10rem] text-stone-600">{e.correo}</p>}
                    {e.url_instagram && (
                      <p className="text-xs text-emerald-800">Instagram</p>
                    )}
                    {!e.telefono && !e.correo && !e.url_instagram && "—"}
                  </Td>
                  <Td>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        e.activo ? "bg-emerald-100 text-emerald-900" : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {e.activo ? "Visible" : "Oculto"}
                    </span>
                  </Td>
                  <Td className="text-right">
                    {editarId !== e.id && <BotonEditar href={urlEditar(RUTA, e.id)} />}
                  </Td>
                </tr>
                {editarId === e.id && (
                  <FilaEdicion colSpan={5}>
                    <form action={actualizarEnlaceAsociado} className="grid gap-4 sm:grid-cols-2">
                      <input type="hidden" name="id" value={e.id} />
                      <Campo label="Nombre *" name="nombre" defaultValue={e.nombre} required />
                      <Campo label="Orden" name="orden" type="number" defaultValue={String(e.orden)} />
                      <Campo
                        label="Dirección"
                        name="direccion"
                        defaultValue={e.direccion ?? ""}
                        className="sm:col-span-2"
                      />
                      <Campo label="Teléfono" name="telefono" defaultValue={e.telefono ?? ""} />
                      <Campo label="Correo" name="correo" defaultValue={e.correo ?? ""} />
                      <Campo
                        label="Instagram (URL)"
                        name="url_instagram"
                        defaultValue={e.url_instagram ?? ""}
                        className="sm:col-span-2"
                      />
                      <Campo
                        label="Sitio web"
                        name="url_web"
                        defaultValue={e.url_web ?? ""}
                        className="sm:col-span-2"
                      />
                      <Campo
                        label="Logo (URL)"
                        name="url_logo"
                        defaultValue={e.url_logo ?? ""}
                        className="sm:col-span-2"
                      />
                      <label className="flex items-center gap-2 text-sm sm:col-span-2">
                        <input name="activo" type="checkbox" defaultChecked={e.activo} />
                        Visible en el sitio
                      </label>
                      <div className="flex flex-wrap gap-2 sm:col-span-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700"
                        >
                          Guardar
                        </button>
                        <BotonCancelarEdicion href={urlCancelarEdicion(sp, RUTA)} />
                      </div>
                    </form>
                    <form action={eliminarEnlaceAsociado} className="mt-4 border-t border-stone-200 pt-4">
                      <input type="hidden" name="id" value={e.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50"
                      >
                        Eliminar enlace
                      </button>
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
