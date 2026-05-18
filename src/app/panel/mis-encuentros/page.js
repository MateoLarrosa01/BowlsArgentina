import Link from "next/link";
import { requerirSesion } from "@/lib/auth/requerir-sesion";
import { ContenedorPagina } from "@/components/contenedor-pagina";

export const metadata = {
  title: "Mis encuentros",
};

export default async function MisEncuentrosPage({ searchParams }) {
  const { supabase, user } = await requerirSesion("/panel/mis-encuentros");
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;

  const { data: misEquipos } = await supabase
    .from("equipos")
    .select("id")
    .eq("id_usuario_capitan", user.id);

  const idsEquipos = (misEquipos ?? []).map((e) => e.id);

  let encuentros = [];
  if (idsEquipos.length > 0) {
    const filtro = idsEquipos
      .flatMap((id) => [`id_equipo_local.eq.${id}`, `id_equipo_visitante.eq.${id}`])
      .join(",");
    const { data } = await supabase
      .from("encuentros")
      .select(
        `
        id,
        numero_fecha,
        estado,
        puntos_encuentro_local,
        puntos_encuentro_visitante,
        torneos ( nombre, estado ),
        divisiones ( nombre ),
        equipo_local:equipos!encuentros_id_equipo_local_fkey ( nombre ),
        equipo_visitante:equipos!encuentros_id_equipo_visitante_fkey ( nombre )
      `,
      )
      .or(filtro)
      .order("numero_fecha", { ascending: true });
    encuentros = data ?? [];
  }

  const nombreEq = (rel) => {
    if (rel == null) return "—";
    if (Array.isArray(rel)) return rel[0]?.nombre ?? "—";
    return rel.nombre ?? "—";
  };

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/panel" className="font-medium text-emerald-800 hover:underline">
          Mi panel
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Mis encuentros</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          Mis encuentros
        </h1>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          Acá cargás los cuatro parciales del partido (single, doble, terceto y
          cuarteto). Solo ves encuentros de equipos donde sos capitán asignado.
        </p>
      </header>

      {mensaje && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {mensaje}
        </p>
      )}

      {idsEquipos.length === 0 && (
        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6 text-base text-amber-950">
          Todavía no tenés equipos asignados como capitán. La federación debe
          indicar tu correo al crear el equipo en la gestión del torneo.
        </p>
      )}

      {idsEquipos.length > 0 && encuentros.length === 0 && (
        <p className="mt-8 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-stone-600">
          No hay encuentros programados para tus equipos.
        </p>
      )}

      <ul className="mt-8 space-y-3">
        {encuentros.map((en) => {
          const torneo = Array.isArray(en.torneos) ? en.torneos[0] : en.torneos;
          const division = Array.isArray(en.divisiones)
            ? en.divisiones[0]
            : en.divisiones;
          const marcador =
            en.estado === "jugado"
              ? `${en.puntos_encuentro_local ?? 0} – ${en.puntos_encuentro_visitante ?? 0}`
              : null;
          return (
            <li key={en.id}>
              <Link
                href={`/panel/mis-encuentros/${en.id}`}
                className="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-emerald-400"
              >
                <p className="text-sm text-stone-500">
                  {torneo?.nombre ?? "Torneo"} · {division?.nombre ?? "División"}
                  {en.numero_fecha != null ? ` · Fecha ${en.numero_fecha}` : ""}
                </p>
                <p className="mt-2 text-lg font-semibold text-stone-900">
                  {nombreEq(en.equipo_local)} vs {nombreEq(en.equipo_visitante)}
                </p>
                <p className="mt-1 text-sm capitalize text-emerald-800">
                  {en.estado}
                  {marcador ? ` · ${marcador}` : ""}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </ContenedorPagina>
  );
}
