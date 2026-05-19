/**
 * Busca si ya existe un encuentro con la misma pareja en torneo/división/jornada.
 * Considera local/visitante en ambos sentidos (A vs B = B vs A).
 */
export async function buscarEncuentroDuplicado(
  supabase,
  {
    idTorneo,
    idDivision,
    numeroFecha,
    idEquipoLocal,
    idEquipoVisitante,
    excluirId = null,
  },
) {
  let query = supabase
    .from("encuentros")
    .select("id")
    .eq("id_torneo", idTorneo)
    .eq("id_division", idDivision);

  if (numeroFecha != null) {
    query = query.eq("numero_fecha", numeroFecha);
  } else {
    query = query.is("numero_fecha", null);
  }

  const orFiltro = [
    `and(id_equipo_local.eq.${idEquipoLocal},id_equipo_visitante.eq.${idEquipoVisitante})`,
    `and(id_equipo_local.eq.${idEquipoVisitante},id_equipo_visitante.eq.${idEquipoLocal})`,
  ].join(",");

  query = query.or(orFiltro);

  if (excluirId) {
    query = query.neq("id", excluirId);
  }

  const { data, error } = await query.limit(1).maybeSingle();
  if (error) {
    return { duplicado: false, error };
  }
  return { duplicado: Boolean(data), error: null };
}

export function mensajeErrorEncuentroDuplicado(error) {
  if (error?.code === "23505") {
    return "Ya existe un encuentro entre esos equipos en esa división y jornada (o el cruce invertido).";
  }
  return error?.message ?? "No se pudo guardar el encuentro.";
}
