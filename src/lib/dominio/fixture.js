/** Etiquetas en español para estado_encuentro. */
export const ESTADOS_ENCUENTRO = [
  { valor: "programado", etiqueta: "Programado" },
  { valor: "jugado", etiqueta: "Jugado" },
  { valor: "cancelado", etiqueta: "Cancelado" },
];

export function etiquetaEstadoEncuentro(estado) {
  return ESTADOS_ENCUENTRO.find((e) => e.valor === estado)?.etiqueta ?? estado ?? "—";
}

/** Convierte valor de input datetime-local a ISO para Supabase. */
export function parseFechaHoraLocal(valor) {
  if (!valor || typeof valor !== "string") return null;
  const trimmed = valor.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** Valor para input datetime-local desde timestamptz. */
export function formatoFechaHoraParaInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Fecha y hora legibles para Argentina. */
export function formatoFechaHoraLegible(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function filtrarEncuentros(encuentros, filtros = {}) {
  const { division, fecha, estado } = filtros;
  return (encuentros ?? []).filter((en) => {
    if (division && en.id_division !== division) return false;
    if (fecha != null && fecha !== "" && String(en.numero_fecha) !== String(fecha)) {
      return false;
    }
    if (estado && en.estado !== estado) return false;
    return true;
  });
}

/** Números de fecha distintos ordenados (sin null). */
export function numerosFechaDisponibles(encuentros) {
  const set = new Set();
  for (const en of encuentros ?? []) {
    if (en.numero_fecha != null) set.add(en.numero_fecha);
  }
  return [...set].sort((a, b) => a - b);
}

export function leerFiltrosFixture(searchParams) {
  const division = searchParams?.division ? String(searchParams.division) : "";
  const fecha = searchParams?.fecha != null ? String(searchParams.fecha) : "";
  const estado = searchParams?.estado ? String(searchParams.estado) : "";
  return { division, fecha, estado };
}
