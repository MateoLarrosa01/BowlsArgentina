/** Tipos de parcial en orden de juego (interclubes FAB). */
export const TIPOS_PARCIAL = ["single", "doble", "terceto", "cuarteto"];

/**
 * Calcula puntos de torneo del encuentro a partir de ganadores de parciales.
 * Cada parcial ganado suma 2 al bando. Empate 2–2 en parciales → 1–1 en puntos de partido.
 *
 * @param {Array<{ ganador?: 'local' | 'visitante' | null }>} parciales
 */
export function calcularPuntosEncuentroDesdeParciales(parciales) {
  let puntosLocal = 0;
  let puntosVisitante = 0;
  let parcialesLocal = 0;
  let parcialesVisitante = 0;

  for (const p of parciales) {
    if (p.ganador === "local") {
      puntosLocal += 2;
      parcialesLocal += 1;
    } else if (p.ganador === "visitante") {
      puntosVisitante += 2;
      parcialesVisitante += 1;
    }
  }

  if (parcialesLocal === 2 && parcialesVisitante === 2) {
    return {
      puntos_encuentro_local: 1,
      puntos_encuentro_visitante: 1,
      parciales_ganados_local: parcialesLocal,
      parciales_ganados_visitante: parcialesVisitante,
    };
  }

  return {
    puntos_encuentro_local: puntosLocal,
    puntos_encuentro_visitante: puntosVisitante,
    parciales_ganados_local: parcialesLocal,
    parciales_ganados_visitante: parcialesVisitante,
  };
}

/**
 * Suma disparos de parciales para totales del encuentro.
 * @param {Array<{ disparos_local?: number | null, disparos_visitante?: number | null }>} parciales
 */
export function calcularDisparosTotales(parciales) {
  let local = 0;
  let visitante = 0;
  for (const p of parciales) {
    local += Number(p.disparos_local) || 0;
    visitante += Number(p.disparos_visitante) || 0;
  }
  return {
    disparos_totales_local: local,
    disparos_totales_visitante: visitante,
  };
}

/** Etiqueta legible del tipo de parcial. */
export function etiquetaTipoParcial(tipo) {
  const mapa = {
    single: "Single",
    doble: "Doble",
    terceto: "Terceto",
    cuarteto: "Cuarteto",
  };
  return mapa[tipo] ?? tipo;
}
