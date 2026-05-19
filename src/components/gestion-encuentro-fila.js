import {
  ESTADOS_ENCUENTRO,
  etiquetaEstadoEncuentro,
  formatoFechaHoraLegible,
  formatoFechaHoraParaInput,
} from "@/lib/dominio/fixture";
import { actualizarEncuentro } from "@/app/gestion/torneos/actions";

export function GestionEncuentroFila({
  encuentro,
  idTorneo,
  nombreLocal,
  nombreVisitante,
  nombreDivision,
}) {
  const fechaLegible = formatoFechaHoraLegible(encuentro.fecha_hora);

  return (
    <li className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-stone-600">
        <span className="font-medium text-stone-500">{nombreDivision}</span>
        {" · "}
        <strong className="text-stone-900">{nombreLocal}</strong> vs{" "}
        <strong className="text-stone-900">{nombreVisitante}</strong>
        {fechaLegible ? (
          <span className="mt-1 block text-stone-500">{fechaLegible}</span>
        ) : null}
      </p>

      <form
        action={actualizarEncuentro}
        className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <input type="hidden" name="id" value={encuentro.id} />
        <input type="hidden" name="id_torneo" value={idTorneo} />
        <div>
          <label className="block text-xs font-medium text-stone-600">Jornada</label>
          <input
            name="numero_fecha"
            type="number"
            min={1}
            defaultValue={encuentro.numero_fecha ?? ""}
            className="mt-1 w-full min-h-[40px] rounded-lg border border-stone-300 px-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600">Día y hora</label>
          <input
            name="fecha_hora"
            type="datetime-local"
            defaultValue={formatoFechaHoraParaInput(encuentro.fecha_hora)}
            className="mt-1 w-full min-h-[40px] rounded-lg border border-stone-300 px-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-600">Estado</label>
          <select
            name="estado"
            defaultValue={encuentro.estado}
            className="mt-1 w-full min-h-[40px] rounded-lg border border-stone-300 px-2 text-sm"
          >
            {ESTADOS_ENCUENTRO.map((e) => (
              <option key={e.valor} value={e.valor}>
                {e.etiqueta}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full min-h-[40px] rounded-lg bg-stone-800 px-3 text-sm font-semibold text-white hover:bg-stone-700"
          >
            Guardar
          </button>
        </div>
      </form>
      <p className="mt-2 text-xs text-stone-400">
        Actual: {etiquetaEstadoEncuentro(encuentro.estado)}
        {encuentro.estado === "jugado"
          ? ` · ${encuentro.puntos_encuentro_local ?? 0}–${encuentro.puntos_encuentro_visitante ?? 0}`
          : ""}
      </p>
    </li>
  );
}
