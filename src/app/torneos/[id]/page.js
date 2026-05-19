import Link from "next/link";
import { notFound } from "next/navigation";
import { FiltrosFixture } from "@/components/filtros-fixture";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import {
  etiquetaEstadoEncuentro,
  filtrarEncuentros,
  formatoFechaHoraLegible,
  leerFiltrosFixture,
  numerosFechaDisponibles,
} from "@/lib/dominio/fixture";
import { createServerSupabaseClientOpcional } from "@/lib/supabase/server";

export async function generateMetadata({ params }) {
  const supabase = await createServerSupabaseClientOpcional();
  if (!supabase) {
    return { title: "Torneo" };
  }
  const { id } = await params;
  const { data } = await supabase
    .from("torneos")
    .select("nombre")
    .eq("id", id)
    .eq("estado", "publicado")
    .maybeSingle();
  if (!data?.nombre) {
    return { title: "Torneo" };
  }
  return { title: data.nombre };
}

export default async function TorneoDetallePage({ params, searchParams }) {
  const supabase = await createServerSupabaseClientOpcional();
  const { id } = await params;
  const sp = await searchParams;

  if (!supabase) {
    return (
      <ContenedorPagina>
        <p className="text-base text-stone-600">
          Configurá Supabase en{" "}
          <code className="rounded bg-stone-200 px-1.5 py-0.5 text-sm">
            .env.local
          </code>{" "}
          para ver el detalle del torneo.
        </p>
        <Link
          href="/torneos"
          className="mt-6 inline-block text-base font-medium text-emerald-800 underline-offset-4 hover:underline"
        >
          ← Volver a torneos
        </Link>
      </ContenedorPagina>
    );
  }

  const { data: torneo, error } = await supabase
    .from("torneos")
    .select("id, nombre, temporada, estado")
    .eq("id", id)
    .eq("estado", "publicado")
    .maybeSingle();

  if (error || !torneo) {
    notFound();
  }

  const { data: divisiones } = await supabase
    .from("divisiones")
    .select("id, nombre, orden")
    .eq("id_torneo", id)
    .order("orden", { ascending: true });

  const { data: equipos } = await supabase
    .from("equipos")
    .select("id, nombre, id_division, clubes ( nombre )")
    .eq("id_torneo", id);

  const { data: encuentros } = await supabase
    .from("encuentros")
    .select(
      "id, numero_fecha, fecha_hora, estado, id_division, id_equipo_local, id_equipo_visitante, puntos_encuentro_local, puntos_encuentro_visitante",
    )
    .eq("id_torneo", id)
    .order("numero_fecha", { ascending: true })
    .order("fecha_hora", { ascending: true });

  const filtros = leerFiltrosFixture(sp);
  const encuentrosVisibles = filtrarEncuentros(encuentros, filtros);
  const fechasJornada = numerosFechaDisponibles(encuentros);

  const { data: clasificacion } = await supabase
    .from("clasificacion_equipos")
    .select(
      "id_division, id_equipo, partidos_jugados, partidos_ganados, partidos_empatados, partidos_perdidos, puntos, disparos_a_favor, disparos_en_contra, equipos ( nombre )",
    )
    .eq("id_torneo", id)
    .order("puntos", { ascending: false });

  const mapaNombre = Object.fromEntries(
    (equipos ?? []).map((e) => [e.id, e.nombre]),
  );

  const nombreClub = (eq) => {
    const c = eq.clubes;
    if (c == null) return null;
    if (Array.isArray(c)) return c[0]?.nombre ?? null;
    if (typeof c === "object" && "nombre" in c) return c.nombre;
    return null;
  };

  const equiposPorDivision = new Map();
  for (const d of divisiones ?? []) {
    equiposPorDivision.set(
      d.id,
      (equipos ?? []).filter((e) => e.id_division === d.id),
    );
  }

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/torneos" className="font-medium text-emerald-800 hover:underline">
          Torneos
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-stone-800">{torneo.nombre}</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          {torneo.nombre}
        </h1>
        <p className="mt-2 text-base text-stone-600">
          Temporada {torneo.temporada} · Estado:{" "}
          <span className="font-medium capitalize text-emerald-800">
            {torneo.estado}
          </span>
        </p>
      </header>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Divisiones y equipos</h2>
        {!divisiones?.length && (
          <p className="mt-3 text-base text-stone-600">
            Este torneo aún no tiene divisiones cargadas.
          </p>
        )}
        <ul className="mt-4 space-y-6">
          {(divisiones ?? []).map((div) => {
            const lista = equiposPorDivision.get(div.id) ?? [];
            return (
              <li
                key={div.id}
                className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-base font-semibold text-emerald-950">
                  {div.nombre}
                </h3>
                {lista.length === 0 ? (
                  <p className="mt-2 text-sm text-stone-600">Sin equipos.</p>
                ) : (
                  <ul className="mt-3 space-y-2">
                    {lista.map((eq) => (
                      <li key={eq.id} className="text-sm text-stone-800">
                        <strong>{eq.nombre}</strong>
                        {nombreClub(eq) ? (
                          <span className="text-stone-600"> — {nombreClub(eq)}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10" id="fixture">
        <h2 className="text-lg font-semibold text-stone-900">Fixture</h2>
        {(encuentros ?? []).length > 0 && (
          <FiltrosFixture
            basePath={`/torneos/${id}#fixture`}
            divisiones={divisiones ?? []}
            fechas={fechasJornada}
            valores={filtros}
          />
        )}
        {!encuentros?.length && (
          <p className="mt-3 text-base text-stone-600">
            Los encuentros aparecerán aquí cuando la federación los programe.
          </p>
        )}
        {encuentros?.length > 0 && encuentrosVisibles.length === 0 && (
          <p className="mt-3 text-base text-amber-800">
            Ningún encuentro coincide con los filtros.
          </p>
        )}
        <ul className="mt-4 space-y-3">
          {encuentrosVisibles.map((en) => {
            const divNombre =
              divisiones?.find((d) => d.id === en.id_division)?.nombre ?? "—";
            const cuando = formatoFechaHoraLegible(en.fecha_hora);
            return (
              <li
                key={en.id}
                className="flex flex-col gap-1 rounded-xl border border-stone-200 bg-white px-4 py-4 text-base sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="text-sm font-medium text-stone-500">
                    {divNombre} · Fecha {en.numero_fecha ?? "—"}
                    {cuando ? ` · ${cuando}` : ""}
                  </span>
                  <p className="mt-1 font-semibold text-stone-900">
                    {mapaNombre[en.id_equipo_local] ?? "—"} vs{" "}
                    {mapaNombre[en.id_equipo_visitante] ?? "—"}
                  </p>
                </div>
                <span className="text-sm text-emerald-800">
                  {en.estado === "jugado"
                    ? `${en.puntos_encuentro_local ?? 0} – ${en.puntos_encuentro_visitante ?? 0}`
                    : etiquetaEstadoEncuentro(en.estado)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Tabla de posiciones</h2>
        {(divisiones ?? []).map((div) => {
          const filas = (clasificacion ?? []).filter(
            (f) => f.id_division === div.id,
          );
          return (
            <div key={div.id} className="mt-6">
              <h3 className="text-base font-semibold text-emerald-950">{div.nombre}</h3>
              {filas.length === 0 ? (
                <p className="mt-2 text-sm text-stone-600">
                  Sin datos de clasificación todavía.
                </p>
              ) : (
                <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200 bg-white">
                  <table className="w-full min-w-[32rem] text-left text-sm">
                    <thead className="border-b border-stone-200 bg-stone-50 text-stone-600">
                      <tr>
                        <th className="px-3 py-2 font-medium">Equipo</th>
                        <th className="px-2 py-2 text-center">PJ</th>
                        <th className="px-2 py-2 text-center">PG</th>
                        <th className="px-2 py-2 text-center">PE</th>
                        <th className="px-2 py-2 text-center">PP</th>
                        <th className="px-2 py-2 text-center">Pts</th>
                        <th className="px-2 py-2 text-center">Sh+</th>
                        <th className="px-2 py-2 text-center">Sh−</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filas.map((fila) => {
                        const eq = Array.isArray(fila.equipos)
                          ? fila.equipos[0]
                          : fila.equipos;
                        return (
                          <tr key={fila.id_equipo} className="border-b border-stone-100">
                            <td className="px-3 py-2 font-medium text-stone-900">
                              {eq?.nombre ?? "—"}
                            </td>
                            <td className="px-2 py-2 text-center">{fila.partidos_jugados}</td>
                            <td className="px-2 py-2 text-center">{fila.partidos_ganados}</td>
                            <td className="px-2 py-2 text-center">{fila.partidos_empatados}</td>
                            <td className="px-2 py-2 text-center">{fila.partidos_perdidos}</td>
                            <td className="px-2 py-2 text-center font-semibold">{fila.puntos}</td>
                            <td className="px-2 py-2 text-center">{fila.disparos_a_favor}</td>
                            <td className="px-2 py-2 text-center">{fila.disparos_en_contra}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </ContenedorPagina>
  );
}
