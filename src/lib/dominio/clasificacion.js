/**
 * Recalcula la tabla de posiciones de una división vía RPC en Supabase (security definer).
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 */
export async function recalcularClasificacionDivision(supabase, idTorneo, idDivision) {
  const { error } = await supabase.rpc("recalcular_clasificacion_division", {
    p_id_torneo: idTorneo,
    p_id_division: idDivision,
  });
  if (error) {
    return { error: error.message };
  }
  return { ok: true };
}
