"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { recalcularClasificacionDivision } from "@/lib/dominio/clasificacion";
import {
  TIPOS_PARCIAL,
  calcularDisparosTotales,
  calcularPuntosEncuentroDesdeParciales,
} from "@/lib/dominio/encuentro";

function err(id, msg) {
  redirect(`/panel/mis-encuentros/${id}?mensaje=${encodeURIComponent(msg)}`);
}

export async function guardarResultadosEncuentro(formData) {
  const supabase = await createServerSupabaseClient();
  const idEncuentro = formData.get("id_encuentro")?.toString();
  if (!idEncuentro) {
    redirect("/panel/mis-encuentros?mensaje=Encuentro+inválido");
  }

  const { data: encuentro, error: errEnc } = await supabase
    .from("encuentros")
    .select("id, id_torneo, id_division, estado")
    .eq("id", idEncuentro)
    .maybeSingle();

  if (errEnc || !encuentro) {
    err(idEncuentro, "Encuentro no encontrado.");
  }

  const parcialesInput = TIPOS_PARCIAL.map((tipo, idx) => {
    const ganador = formData.get(`ganador_${tipo}`)?.toString();
    const disparosLocal = formData.get(`disparos_local_${tipo}`)?.toString();
    const disparosVisitante = formData.get(`disparos_visitante_${tipo}`)?.toString();
    return {
      orden: idx + 1,
      tipo_parcial: tipo,
      ganador:
        ganador === "local" || ganador === "visitante" ? ganador : null,
      disparos_local: disparosLocal ? Number.parseInt(disparosLocal, 10) : null,
      disparos_visitante: disparosVisitante
        ? Number.parseInt(disparosVisitante, 10)
        : null,
    };
  });

  const incompletos = parcialesInput.filter((p) => !p.ganador);
  if (incompletos.length > 0) {
    err(idEncuentro, "Indicá el ganador de cada parcial.");
  }

  const puntos = calcularPuntosEncuentroDesdeParciales(parcialesInput);
  const disparos = calcularDisparosTotales(parcialesInput);

  for (const p of parcialesInput) {
    const { error } = await supabase.from("parciales_encuentro").upsert(
      {
        id_encuentro: idEncuentro,
        orden: p.orden,
        tipo_parcial: p.tipo_parcial,
        ganador: p.ganador,
        disparos_local: p.disparos_local,
        disparos_visitante: p.disparos_visitante,
      },
      { onConflict: "id_encuentro,orden" },
    );
    if (error) {
      err(idEncuentro, error.message);
    }
  }

  const { error: errUpd } = await supabase
    .from("encuentros")
    .update({
      estado: "jugado",
      puntos_encuentro_local: puntos.puntos_encuentro_local,
      puntos_encuentro_visitante: puntos.puntos_encuentro_visitante,
      disparos_totales_local: disparos.disparos_totales_local,
      disparos_totales_visitante: disparos.disparos_totales_visitante,
    })
    .eq("id", idEncuentro);

  if (errUpd) {
    err(idEncuentro, errUpd.message);
  }

  const rec = await recalcularClasificacionDivision(
    supabase,
    encuentro.id_torneo,
    encuentro.id_division,
  );
  if (rec.error) {
    err(
      idEncuentro,
      `Resultados guardados, pero falló la tabla: ${rec.error}. Contactá a la federación.`,
    );
  }

  revalidatePath("/panel/mis-encuentros");
  revalidatePath(`/panel/mis-encuentros/${idEncuentro}`);
  revalidatePath(`/torneos/${encuentro.id_torneo}`);
  redirect(`/panel/mis-encuentros/${idEncuentro}?ok=1`);
}
