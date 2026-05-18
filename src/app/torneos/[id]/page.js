import Link from "next/link";
import { notFound } from "next/navigation";
import { ContenedorPagina } from "@/components/contenedor-pagina";
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

export default async function TorneoDetallePage({ params }) {
  const supabase = await createServerSupabaseClientOpcional();
  const { id } = await params;

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
      "id, numero_fecha, fecha_hora, estado, id_division, id_equipo_local, id_equipo_visitante",
    )
    .eq("id_torneo", id)
    .order("numero_fecha", { ascending: true });

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

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Fixture</h2>
        {!encuentros?.length && (
          <p className="mt-3 text-base text-stone-600">
            Los encuentros aparecerán aquí cuando la federación los programe.
          </p>
        )}
        <ul className="mt-4 space-y-3">
          {(encuentros ?? []).map((en) => {
            const divNombre =
              divisiones?.find((d) => d.id === en.id_division)?.nombre ?? "—";
            return (
              <li
                key={en.id}
                className="flex flex-col gap-1 rounded-xl border border-stone-200 bg-white px-4 py-4 text-base sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <span className="text-sm font-medium text-stone-500">
                    {divNombre} · Fecha {en.numero_fecha ?? "—"}
                  </span>
                  <p className="mt-1 font-semibold text-stone-900">
                    {mapaNombre[en.id_equipo_local] ?? "—"} vs{" "}
                    {mapaNombre[en.id_equipo_visitante] ?? "—"}
                  </p>
                </div>
                <span className="text-sm capitalize text-emerald-800">{en.estado}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-sm text-stone-600">
        Próximo paso del MVP:{" "}
        <strong className="text-stone-800">tabla de posiciones</strong> y{" "}
        <strong className="text-stone-800">carga de parciales</strong> por
        capitán.
      </section>
    </ContenedorPagina>
  );
}
