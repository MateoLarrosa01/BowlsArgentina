import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { PlantelEquipo } from "@/components/plantel-equipo";
import {
  actualizarTorneo,
  crearDivision,
  crearEncuentro,
  crearEquipo,
} from "../actions";

export default async function AdminTorneoDetallePage({ params, searchParams }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";

  const { data: torneo, error: errTorneo } = await supabase
    .from("torneos")
    .select("id, nombre, temporada, estado, tipo_torneo")
    .eq("id", id)
    .maybeSingle();

  if (errTorneo || !torneo) {
    notFound();
  }

  const { data: divisiones } = await supabase
    .from("divisiones")
    .select("id, nombre, orden")
    .eq("id_torneo", id)
    .order("orden", { ascending: true });

  const { data: equiposRaw } = await supabase
    .from("equipos")
    .select("id, nombre, id_division, id_club, id_usuario_capitan, clubes ( nombre )")
    .eq("id_torneo", id);

  const equipos = equiposRaw ?? [];
  const equiposPorDivision = new Map();
  for (const d of divisiones ?? []) {
    equiposPorDivision.set(
      d.id,
      equipos.filter((e) => e.id_division === d.id),
    );
  }

  const nombreClub = (eq) => {
    const c = eq.clubes;
    if (c == null) return null;
    if (Array.isArray(c)) return c[0]?.nombre ?? null;
    if (typeof c === "object" && "nombre" in c) return c.nombre;
    return null;
  };

  const { data: encuentros } = await supabase
    .from("encuentros")
    .select(
      "id, numero_fecha, fecha_hora, estado, id_division, id_equipo_local, id_equipo_visitante",
    )
    .eq("id_torneo", id)
    .order("numero_fecha", { ascending: true });

  const mapaEquipoNombre = Object.fromEntries(
    equipos.map((e) => [e.id, e.nombre]),
  );

  const { data: clubes } = await supabase
    .from("clubes")
    .select("id, nombre")
    .eq("activo", true)
    .order("nombre");

  const idsEquipos = equipos.map((e) => e.id);
  const plantelPorEquipo = new Map();
  if (idsEquipos.length > 0) {
    const { data: filasPlantel } = await supabase
      .from("equipo_jugadores")
      .select("id, id_equipo, id_jugador, jugadores ( id, nombre, apellido )")
      .in("id_equipo", idsEquipos);
    for (const f of filasPlantel ?? []) {
      if (!plantelPorEquipo.has(f.id_equipo)) {
        plantelPorEquipo.set(f.id_equipo, []);
      }
      plantelPorEquipo.get(f.id_equipo).push(f);
    }
  }

  const { data: todosJugadores } = await supabase
    .from("jugadores")
    .select("id, nombre, apellido, id_club, activo")
    .eq("activo", true)
    .order("apellido");

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/panel/admin" className="font-medium text-emerald-800 hover:underline">
          Administración
        </Link>
        <span className="mx-2">/</span>
        <Link href="/panel/admin/torneos" className="font-medium text-emerald-800 hover:underline">
          Torneos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{torneo.nombre}</span>
      </nav>

      {torneo.estado === "publicado" && (
        <p className="mt-4">
          <Link
            href={`/torneos/${id}`}
            className="text-sm font-semibold text-emerald-800 underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Abrir vista pública del torneo →
          </Link>
        </p>
      )}

      {mensaje && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {mensaje}
        </p>
      )}
      {ok && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          Guardado.
        </p>
      )}

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          {torneo.nombre}
        </h1>
      </header>

      <section className="mt-8 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Datos generales</h2>
        <form action={actualizarTorneo} className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="id" value={torneo.id} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-stone-700" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              required
              defaultValue={torneo.nombre}
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700" htmlFor="temporada">
              Temporada
            </label>
            <input
              id="temporada"
              name="temporada"
              required
              defaultValue={torneo.temporada}
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700" htmlFor="estado">
              Estado
            </label>
            <select
              id="estado"
              name="estado"
              required
              defaultValue={torneo.estado}
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            >
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado (visible al público)</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="min-h-[48px] rounded-xl bg-emerald-700 px-6 text-base font-semibold text-white hover:bg-emerald-600"
            >
              Guardar torneo
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Nueva división</h2>
        <form action={crearDivision} className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <input type="hidden" name="id_torneo" value={id} />
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-stone-700" htmlFor="div-nombre">
              Nombre (ej. Liga A)
            </label>
            <input
              id="div-nombre"
              name="nombre"
              required
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div className="w-full sm:w-28">
            <label className="block text-sm font-medium text-stone-700" htmlFor="div-orden">
              Orden
            </label>
            <input
              id="div-orden"
              name="orden"
              type="number"
              defaultValue={0}
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <button
            type="submit"
            className="min-h-[48px] rounded-xl border border-emerald-700 bg-emerald-50 px-5 text-base font-semibold text-emerald-900 hover:bg-emerald-100"
          >
            Agregar división
          </button>
        </form>
      </section>

      {(divisiones ?? []).map((div) => {
        const eqDiv = equiposPorDivision.get(div.id) ?? [];
        return (
          <section
            key={div.id}
            className="mt-10 rounded-2xl border border-emerald-900/15 bg-emerald-50/40 p-6"
          >
            <h2 className="text-xl font-semibold text-emerald-950">
              {div.nombre}{" "}
              <span className="text-sm font-normal text-stone-500">(orden {div.orden})</span>
            </h2>

            <h3 className="mt-6 text-base font-semibold text-stone-800">Equipos y plantel</h3>
            {eqDiv.length === 0 ? (
              <p className="mt-2 text-sm text-stone-600">Sin equipos en esta división.</p>
            ) : (
              <div className="mt-2 space-y-2">
                {eqDiv.map((eq) => {
                  const plantel = plantelPorEquipo.get(eq.id) ?? [];
                  const idsEnPlantel = new Set(
                    plantel.map((f) => f.id_jugador),
                  );
                  const disponibles = (todosJugadores ?? []).filter(
                    (j) => j.id_club === eq.id_club && !idsEnPlantel.has(j.id),
                  );
                  return (
                    <PlantelEquipo
                      key={eq.id}
                      equipo={eq}
                      plantel={plantel}
                      jugadoresDisponibles={disponibles}
                      idTorneo={id}
                      nombreClub={nombreClub(eq)}
                    />
                  );
                })}
              </div>
            )}

            <form action={crearEquipo} className="mt-4 grid gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-2">
              <input type="hidden" name="id_torneo" value={id} />
              <input type="hidden" name="id_division" value={div.id} />
              <div>
                <label className="block text-xs font-medium text-stone-600">Club</label>
                <select
                  name="id_club"
                  required
                  className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-2 text-base"
                  defaultValue=""
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
                <label className="block text-xs font-medium text-stone-600">
                  Nombre del equipo
                </label>
                <input
                  name="nombre"
                  required
                  placeholder="Ej. San Martín A"
                  className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600">
                  Correo del capitán (usuario ya registrado)
                </label>
                <input
                  name="correo_capitan"
                  type="email"
                  placeholder="capitan@club.com"
                  className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="min-h-[44px] rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  Agregar equipo
                </button>
              </div>
            </form>

            <h3 className="mt-8 text-base font-semibold text-stone-800">
              Nuevo encuentro en esta división
            </h3>
            <form action={crearEncuentro} className="mt-3 grid gap-3 rounded-xl border border-stone-200 bg-white p-4 sm:grid-cols-2">
              <input type="hidden" name="id_torneo" value={id} />
              <input type="hidden" name="id_division" value={div.id} />
              <div>
                <label className="block text-xs font-medium text-stone-600">Local</label>
                <select
                  name="id_equipo_local"
                  required
                  className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-2 text-base"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Equipo local…
                  </option>
                  {eqDiv.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-stone-600">Visitante</label>
                <select
                  name="id_equipo_visitante"
                  required
                  className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-2 text-base"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Equipo visitante…
                  </option>
                  {eqDiv.map((eq) => (
                    <option key={`v-${eq.id}`} value={eq.id}>
                      {eq.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-600">
                  Número de fecha (opcional)
                </label>
                <input
                  name="numero_fecha"
                  type="number"
                  min={1}
                  placeholder="Ej. 1"
                  className="mt-1 w-full max-w-xs min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="min-h-[44px] rounded-lg bg-stone-800 px-4 text-sm font-semibold text-white hover:bg-stone-700"
                >
                  Programar encuentro
                </button>
              </div>
            </form>
          </section>
        );
      })}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Encuentros programados</h2>
        {!encuentros?.length && (
          <p className="mt-2 text-sm text-stone-600">Todavía no hay encuentros.</p>
        )}
        <ul className="mt-4 space-y-2">
          {(encuentros ?? []).map((en) => {
            const divNombre =
              divisiones?.find((d) => d.id === en.id_division)?.nombre ?? "—";
            return (
              <li
                key={en.id}
                className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800"
              >
                <span className="font-medium text-stone-500">{divNombre}</span>
                {" · "}
                Fecha {en.numero_fecha ?? "—"} ·{" "}
                <strong>{mapaEquipoNombre[en.id_equipo_local] ?? "?"}</strong> vs{" "}
                <strong>{mapaEquipoNombre[en.id_equipo_visitante] ?? "?"}</strong>
                <span className="ml-2 capitalize text-stone-500">({en.estado})</span>
              </li>
            );
          })}
        </ul>
      </section>
    </ContenedorPagina>
  );
}
