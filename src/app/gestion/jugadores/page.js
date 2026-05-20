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
import { actualizarJugador, crearJugador } from "./actions";

const RUTA = "/gestion/jugadores";

export default async function AdminJugadoresPage({ searchParams }) {
  const supabase = await createServerSupabaseClient();
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";
  const filtroClub = sp.club ? String(sp.club) : null;
  const editarId = idEnEdicion(sp);
  const extra = filtroClub ? { club: filtroClub } : {};

  const { data: clubes } = await supabase
    .from("clubes")
    .select("id, nombre")
    .order("nombre");

  let query = supabase
    .from("jugadores")
    .select("id, nombre, apellido, fecha_nacimiento, activo, id_club, clubes ( nombre )")
    .order("apellido")
    .order("nombre");

  if (filtroClub) {
    query = query.eq("id_club", filtroClub);
  }

  const { data: jugadores, error } = await query;

  const nombreClub = (j) => {
    const c = j.clubes;
    if (c == null) return "—";
    if (Array.isArray(c)) return c[0]?.nombre ?? "—";
    return c.nombre ?? "—";
  };

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/gestion" className="font-medium text-emerald-800 hover:underline">
          Gestión
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Jugadores</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Jugadores</h1>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          Alta de jugadores por club. Luego los sumás al plantel de cada equipo en la gestión del
          torneo.
        </p>
      </header>

      <AlertasFlash mensaje={mensaje} ok={ok} />

      <section className="mt-8 flex flex-wrap items-end gap-3">
        <form method="get" className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="filtro-club" className="block text-sm font-medium text-stone-700">
              Filtrar por club
            </label>
            <select
              id="filtro-club"
              name="club"
              defaultValue={filtroClub ?? ""}
              className="mt-1 min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            >
              <option value="">Todos los clubes</option>
              {(clubes ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="min-h-[44px] rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium hover:bg-stone-50"
          >
            Aplicar
          </button>
        </form>
        {filtroClub && (
          <Link href={RUTA} className="text-sm font-medium text-emerald-800 hover:underline">
            Quitar filtro
          </Link>
        )}
      </section>

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Nuevo jugador</h2>
        <form action={crearJugador} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
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
            <label className="block text-sm font-medium text-stone-700" htmlFor="n-apellido">
              Apellido
            </label>
            <input
              id="n-apellido"
              name="apellido"
              required
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700" htmlFor="n-club">
              Club
            </label>
            <select
              id="n-club"
              name="id_club"
              required
              defaultValue={filtroClub ?? ""}
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            >
              <option value="" disabled>
                Elegir club…
              </option>
              {(clubes ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700" htmlFor="n-fecha">
              Fecha de nacimiento (opcional)
            </label>
            <input
              id="n-fecha"
              name="fecha_nacimiento"
              type="date"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="min-h-[48px] rounded-xl bg-emerald-700 px-6 text-base font-semibold text-white hover:bg-emerald-600"
            >
              Crear jugador
            </button>
          </div>
        </form>
      </section>

      {error && (
        <p className="mt-6 text-sm text-red-700">Error al cargar: {error.message}</p>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Listado</h2>
        <TablaGestion
          vacio={!jugadores?.length && !error ? "No hay jugadores con este filtro." : null}
        >
          <thead>
            <tr>
              <Th>Jugador</Th>
              <Th>Club</Th>
              <Th>Nacimiento</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {(jugadores ?? []).map((j) => (
              <Fragment key={j.id}>
                <tr className={editarId === j.id ? "bg-emerald-50/40" : undefined}>
                  <Td>
                    <span className="font-medium">
                      {j.apellido}, {j.nombre}
                    </span>
                  </Td>
                  <Td>{nombreClub(j)}</Td>
                  <Td>{j.fecha_nacimiento ?? "—"}</Td>
                  <Td>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        j.activo ? "bg-emerald-100 text-emerald-900" : "bg-stone-200 text-stone-600"
                      }`}
                    >
                      {j.activo ? "Activo" : "Inactivo"}
                    </span>
                  </Td>
                  <Td className="text-right">
                    {editarId !== j.id && (
                      <BotonEditar href={urlEditar(RUTA, j.id, extra)} />
                    )}
                  </Td>
                </tr>
                {editarId === j.id && (
                  <FilaEdicion colSpan={5}>
                    <form action={actualizarJugador} className="grid gap-4 sm:grid-cols-2">
                      <input type="hidden" name="id" value={j.id} />
                      <div>
                        <label className="block text-sm font-medium text-stone-700">Nombre</label>
                        <input
                          name="nombre"
                          required
                          defaultValue={j.nombre}
                          className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700">Apellido</label>
                        <input
                          name="apellido"
                          required
                          defaultValue={j.apellido}
                          className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700">Club</label>
                        <select
                          name="id_club"
                          required
                          defaultValue={j.id_club}
                          className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3"
                        >
                          {(clubes ?? []).map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700">
                          Fecha de nacimiento
                        </label>
                        <input
                          name="fecha_nacimiento"
                          type="date"
                          defaultValue={j.fecha_nacimiento ?? ""}
                          className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3"
                        />
                      </div>
                      <label className="flex items-center gap-2 sm:col-span-2">
                        <input
                          name="activo"
                          type="checkbox"
                          value="true"
                          defaultChecked={j.activo}
                          className="h-5 w-5"
                        />
                        Jugador activo
                      </label>
                      <div className="flex flex-wrap gap-2 sm:col-span-2">
                        <button
                          type="submit"
                          className="min-h-[44px] rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-600"
                        >
                          Guardar cambios
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
