import Link from "next/link";
import { ESTADOS_ENCUENTRO } from "@/lib/dominio/fixture";

/**
 * Filtros GET para fixture (público o gestión).
 * @param {{ basePath: string, divisiones?: { id: string, nombre: string }[], fechas?: number[], valores: { division?: string, fecha?: string, estado?: string } }} props
 */
export function FiltrosFixture({ basePath, divisiones = [], fechas = [], valores = {} }) {
  const hayFiltro = Boolean(valores.division || valores.fecha || valores.estado);

  return (
    <form
      method="get"
      className="mt-4 flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      {divisiones.length > 0 && (
        <div className="min-w-[10rem] flex-1">
          <label htmlFor="filtro-division" className="block text-xs font-medium text-stone-600">
            División
          </label>
          <select
            id="filtro-division"
            name="division"
            defaultValue={valores.division ?? ""}
            className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 bg-white px-2 text-base"
          >
            <option value="">Todas</option>
            {divisiones.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {fechas.length > 0 && (
        <div className="min-w-[8rem]">
          <label htmlFor="filtro-fecha" className="block text-xs font-medium text-stone-600">
            Fecha (jornada)
          </label>
          <select
            id="filtro-fecha"
            name="fecha"
            defaultValue={valores.fecha ?? ""}
            className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 bg-white px-2 text-base"
          >
            <option value="">Todas</option>
            {fechas.map((n) => (
              <option key={n} value={String(n)}>
                Fecha {n}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="min-w-[8rem]">
        <label htmlFor="filtro-estado" className="block text-xs font-medium text-stone-600">
          Estado
        </label>
        <select
          id="filtro-estado"
          name="estado"
          defaultValue={valores.estado ?? ""}
          className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 bg-white px-2 text-base"
        >
          <option value="">Todos</option>
          {ESTADOS_ENCUENTRO.map((e) => (
            <option key={e.valor} value={e.valor}>
              {e.etiqueta}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="min-h-[44px] rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Aplicar
        </button>
        {hayFiltro && (
          <Link
            href={basePath}
            className="inline-flex min-h-[44px] items-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            Limpiar
          </Link>
        )}
      </div>
    </form>
  );
}
