import { agregarJugadorAlPlantel, quitarJugadorDelPlantel } from "@/app/gestion/torneos/actions";

function nombreJugador(j) {
  if (!j) return "—";
  const row = Array.isArray(j) ? j[0] : j;
  return row ? `${row.apellido}, ${row.nombre}` : "—";
}

/**
 * Bloque de plantel para un equipo en la gestión del torneo.
 */
export function PlantelEquipo({
  equipo,
  plantel,
  jugadoresDisponibles,
  idTorneo,
  nombreClub,
}) {
  return (
    <div className="mt-4 rounded-xl border border-stone-200 bg-white p-4">
      <p className="font-semibold text-stone-900">
        {equipo.nombre}
        {nombreClub ? (
          <span className="font-normal text-stone-600"> — {nombreClub}</span>
        ) : null}
      </p>

      <h4 className="mt-4 text-sm font-medium text-stone-700">Plantel</h4>
      {plantel.length === 0 ? (
        <p className="mt-1 text-sm text-stone-500">Sin jugadores en el plantel.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {plantel.map((fila) => (
            <li
              key={fila.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-stone-50 px-3 py-2 text-sm"
            >
              <span>{nombreJugador(fila.jugadores)}</span>
              <form action={quitarJugadorDelPlantel}>
                <input type="hidden" name="id_torneo" value={idTorneo} />
                <input type="hidden" name="id_fila" value={fila.id} />
                <button
                  type="submit"
                  className="text-sm font-medium text-red-800 hover:underline"
                >
                  Quitar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {jugadoresDisponibles.length > 0 ? (
        <form action={agregarJugadorAlPlantel} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <input type="hidden" name="id_torneo" value={idTorneo} />
          <input type="hidden" name="id_equipo" value={equipo.id} />
          <div className="flex-1">
            <label className="block text-xs font-medium text-stone-600">
              Agregar jugador del club
            </label>
            <select
              name="id_jugador"
              required
              defaultValue=""
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-2 text-base"
            >
              <option value="" disabled>
                Elegir jugador…
              </option>
              {jugadoresDisponibles.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.apellido}, {j.nombre}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="min-h-[44px] rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Agregar
          </button>
        </form>
      ) : (
        <p className="mt-3 text-xs text-stone-500">
          No hay más jugadores activos del club para sumar. Cargalos en{" "}
          <span className="font-medium">Jugadores</span> en administración.
        </p>
      )}
    </div>
  );
}
