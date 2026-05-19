import Link from "next/link";
import { notFound } from "next/navigation";
import { requerirSesion } from "@/lib/auth/requerir-sesion";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { TIPOS_PARCIAL, etiquetaTipoParcial } from "@/lib/dominio/encuentro";
import { guardarResultadosEncuentro } from "../actions";

export default async function CargarEncuentroPage({ params, searchParams }) {
  const { supabase, user } = await requerirSesion("/panel/mis-encuentros");
  const { id } = await params;
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";

  const { data: encuentro, error } = await supabase
    .from("encuentros")
    .select(
      `
      id,
      id_torneo,
      id_division,
      numero_fecha,
      estado,
      puntos_encuentro_local,
      puntos_encuentro_visitante,
      equipo_local:equipos!encuentros_id_equipo_local_fkey ( id, nombre, id_usuario_capitan ),
      equipo_visitante:equipos!encuentros_id_equipo_visitante_fkey ( id, nombre, id_usuario_capitan )
    `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !encuentro) {
    notFound();
  }

  const local = Array.isArray(encuentro.equipo_local)
    ? encuentro.equipo_local[0]
    : encuentro.equipo_local;
  const visitante = Array.isArray(encuentro.equipo_visitante)
    ? encuentro.equipo_visitante[0]
    : encuentro.equipo_visitante;

  const puede =
    local?.id_usuario_capitan === user.id ||
    visitante?.id_usuario_capitan === user.id;

  if (!puede) {
    notFound();
  }

  const { data: parciales } = await supabase
    .from("parciales_encuentro")
    .select("orden, tipo_parcial, ganador, disparos_local, disparos_visitante")
    .eq("id_encuentro", id)
    .order("orden");

  const mapaParcial = Object.fromEntries(
    (parciales ?? []).map((p) => [p.tipo_parcial, p]),
  );

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/panel/mis-encuentros" className="font-medium text-emerald-800 hover:underline">
          Mis encuentros
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Cargar resultado</span>
      </nav>

      {mensaje && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {mensaje}
        </p>
      )}
      {ok && (
        <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          Resultado guardado y tabla actualizada.
        </p>
      )}

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900">
          {local?.nombre} vs {visitante?.nombre}
        </h1>
        <p className="mt-2 text-base text-stone-600">
          Fecha {encuentro.numero_fecha ?? "—"} · Estado:{" "}
          <span className="capitalize font-medium">{encuentro.estado}</span>
        </p>
      </header>

      <form
        action={guardarResultadosEncuentro}
        className="mt-8 space-y-6"
      >
        <input type="hidden" name="id_encuentro" value={id} />

        {TIPOS_PARCIAL.map((tipo) => {
          const prev = mapaParcial[tipo];
          return (
            <fieldset
              key={tipo}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <legend className="text-lg font-semibold text-emerald-950 px-1">
                {etiquetaTipoParcial(tipo)}
              </legend>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <span className="block text-sm font-medium text-stone-700 mb-2">
                    Ganador del parcial
                  </span>
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex min-h-[44px] items-center gap-2 text-base">
                      <input
                        type="radio"
                        name={`ganador_${tipo}`}
                        value="local"
                        required
                        defaultChecked={prev?.ganador === "local"}
                        className="h-5 w-5"
                      />
                      {local?.nombre} (local)
                    </label>
                    <label className="inline-flex min-h-[44px] items-center gap-2 text-base">
                      <input
                        type="radio"
                        name={`ganador_${tipo}`}
                        value="visitante"
                        defaultChecked={prev?.ganador === "visitante"}
                        className="h-5 w-5"
                      />
                      {visitante?.nombre} (visitante)
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Shots {local?.nombre}
                  </label>
                  <input
                    name={`disparos_local_${tipo}`}
                    type="number"
                    min={0}
                    defaultValue={prev?.disparos_local ?? ""}
                    className="mt-1 w-full min-h-[48px] rounded-lg border border-stone-300 px-3 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700">
                    Shots {visitante?.nombre}
                  </label>
                  <input
                    name={`disparos_visitante_${tipo}`}
                    type="number"
                    min={0}
                    defaultValue={prev?.disparos_visitante ?? ""}
                    className="mt-1 w-full min-h-[48px] rounded-lg border border-stone-300 px-3 text-base"
                  />
                </div>
              </div>
            </fieldset>
          );
        })}

        <button
          type="submit"
          className="flex w-full min-h-[52px] items-center justify-center rounded-xl bg-emerald-700 text-base font-semibold text-white hover:bg-emerald-600"
        >
          Guardar resultado y actualizar tabla
        </button>
      </form>

      <p className="mt-6 text-sm text-stone-500">
        Regla: si el encuentro queda 2–2 en parciales, el marcador del partido
        es 1–1 en puntos de torneo.
      </p>
    </ContenedorPagina>
  );
}
