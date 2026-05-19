"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseFechaHoraLocal } from "@/lib/dominio/fixture";
import {
  buscarEncuentroDuplicado,
  mensajeErrorEncuentroDuplicado,
} from "@/lib/dominio/validar-encuentro";

function errTorneo(id, msg) {
  redirect(`/gestion/torneos/${id}?mensaje=${encodeURIComponent(msg)}`);
}

function errTorneos(msg) {
  redirect(`/gestion/torneos?mensaje=${encodeURIComponent(msg)}`);
}

export async function crearTorneo(formData) {
  const supabase = await createServerSupabaseClient();
  const nombre = formData.get("nombre")?.toString().trim();
  const temporada = formData.get("temporada")?.toString().trim();
  if (!nombre || !temporada) {
    errTorneos("Nombre y temporada son obligatorios.");
  }

  const { data, error } = await supabase
    .from("torneos")
    .insert({
      nombre,
      temporada,
      tipo_torneo: "interclubes",
      estado: "borrador",
    })
    .select("id")
    .single();

  if (error || !data) {
    errTorneos(error?.message ?? "No se pudo crear el torneo.");
  }

  revalidatePath("/gestion/torneos");
  revalidatePath("/torneos");
  redirect(`/gestion/torneos/${data.id}?ok=1`);
}

export async function actualizarTorneo(formData) {
  const supabase = await createServerSupabaseClient();
  const id = formData.get("id")?.toString();
  const nombre = formData.get("nombre")?.toString().trim();
  const temporada = formData.get("temporada")?.toString().trim();
  const estado = formData.get("estado")?.toString();
  if (!id || !nombre || !temporada || !estado) {
    errTorneos("Completá nombre, temporada y estado.");
  }

  const { error } = await supabase
    .from("torneos")
    .update({ nombre, temporada, estado })
    .eq("id", id);

  if (error) {
    errTorneo(id, error.message);
  }

  revalidatePath("/gestion/torneos");
  revalidatePath(`/gestion/torneos/${id}`);
  revalidatePath("/torneos");
  revalidatePath(`/torneos/${id}`);
  redirect(`/gestion/torneos/${id}?ok=1`);
}

export async function crearDivision(formData) {
  const supabase = await createServerSupabaseClient();
  const idTorneo = formData.get("id_torneo")?.toString();
  const nombre = formData.get("nombre")?.toString().trim();
  const ordenRaw = formData.get("orden")?.toString().trim();
  const orden = ordenRaw ? Number.parseInt(ordenRaw, 10) : 0;
  if (!idTorneo || !nombre || Number.isNaN(orden)) {
    errTorneo(idTorneo ?? "", "Nombre de división obligatorio y orden numérico.");
  }

  const { error } = await supabase.from("divisiones").insert({
    id_torneo: idTorneo,
    nombre,
    orden,
  });

  if (error) {
    errTorneo(idTorneo, error.message);
  }

  revalidatePath(`/gestion/torneos/${idTorneo}`);
  revalidatePath(`/torneos/${idTorneo}`);
  redirect(`/gestion/torneos/${idTorneo}?ok=1`);
}

export async function crearEquipo(formData) {
  const supabase = await createServerSupabaseClient();
  const idTorneo = formData.get("id_torneo")?.toString();
  const idDivision = formData.get("id_division")?.toString();
  const idClub = formData.get("id_club")?.toString();
  const nombre = formData.get("nombre")?.toString().trim();
  const correoCapitan = formData.get("correo_capitan")?.toString().trim();
  if (!idTorneo || !idDivision || !idClub || !nombre) {
    errTorneo(idTorneo ?? "", "Completá división, club y nombre del equipo.");
  }

  let idUsuarioCapitan = null;
  if (correoCapitan) {
    const { data: uid, error: errUid } = await supabase.rpc("id_usuario_por_correo", {
      p_correo: correoCapitan,
    });
    if (errUid || !uid) {
      errTorneo(
        idTorneo,
        "No encontramos un usuario registrado con ese correo de capitán.",
      );
    }
    idUsuarioCapitan = uid;
  }

  const { error } = await supabase.from("equipos").insert({
    id_torneo: idTorneo,
    id_division: idDivision,
    id_club: idClub,
    nombre,
    id_usuario_capitan: idUsuarioCapitan,
  });

  if (error) {
    errTorneo(idTorneo, error.message);
  }

  revalidatePath(`/gestion/torneos/${idTorneo}`);
  revalidatePath(`/torneos/${idTorneo}`);
  redirect(`/gestion/torneos/${idTorneo}?ok=1`);
}

export async function crearEncuentro(formData) {
  const supabase = await createServerSupabaseClient();
  const idTorneo = formData.get("id_torneo")?.toString();
  const idDivision = formData.get("id_division")?.toString();
  const local = formData.get("id_equipo_local")?.toString();
  const visitante = formData.get("id_equipo_visitante")?.toString();
  const numFechaRaw = formData.get("numero_fecha")?.toString().trim();
  const numeroFecha = numFechaRaw ? Number.parseInt(numFechaRaw, 10) : null;
  const fechaHoraRaw = formData.get("fecha_hora")?.toString();
  const fechaHora = parseFechaHoraLocal(fechaHoraRaw);

  if (!idTorneo || !idDivision || !local || !visitante) {
    errTorneo(idTorneo ?? "", "Elegí división y ambos equipos.");
  }
  if (local === visitante) {
    errTorneo(idTorneo, "El local y el visitante deben ser distintos.");
  }
  if (numFechaRaw && Number.isNaN(numeroFecha)) {
    errTorneo(idTorneo, "Número de fecha debe ser entero.");
  }

  const { data: eqL } = await supabase
    .from("equipos")
    .select("id_division")
    .eq("id", local)
    .single();
  const { data: eqV } = await supabase
    .from("equipos")
    .select("id_division")
    .eq("id", visitante)
    .single();

  if (!eqL || !eqV || eqL.id_division !== idDivision || eqV.id_division !== idDivision) {
    errTorneo(
      idTorneo,
      "Los equipos deben pertenecer a la división seleccionada.",
    );
  }

  const { duplicado, error: errDup } = await buscarEncuentroDuplicado(supabase, {
    idTorneo,
    idDivision,
    numeroFecha,
    idEquipoLocal: local,
    idEquipoVisitante: visitante,
  });
  if (errDup) {
    errTorneo(idTorneo, errDup.message);
  }
  if (duplicado) {
    errTorneo(
      idTorneo,
      "Ya hay un encuentro entre esos equipos en esta división y jornada (incluye local/visitante invertido).",
    );
  }

  const { error } = await supabase.from("encuentros").insert({
    id_torneo: idTorneo,
    id_division: idDivision,
    id_equipo_local: local,
    id_equipo_visitante: visitante,
    numero_fecha: numeroFecha,
    fecha_hora: fechaHora,
    estado: "programado",
  });

  if (error) {
    errTorneo(idTorneo, mensajeErrorEncuentroDuplicado(error));
  }

  revalidatePath(`/gestion/torneos/${idTorneo}`);
  revalidatePath(`/torneos/${idTorneo}`);
  redirect(`/gestion/torneos/${idTorneo}?ok=1`);
}

export async function agregarJugadorAlPlantel(formData) {
  const supabase = await createServerSupabaseClient();
  const idTorneo = formData.get("id_torneo")?.toString();
  const idEquipo = formData.get("id_equipo")?.toString();
  const idJugador = formData.get("id_jugador")?.toString();

  if (!idTorneo || !idEquipo || !idJugador) {
    errTorneo(idTorneo ?? "", "Elegí un jugador para el plantel.");
  }

  const { data: equipo } = await supabase
    .from("equipos")
    .select("id_club, id_torneo")
    .eq("id", idEquipo)
    .maybeSingle();

  const { data: jugador } = await supabase
    .from("jugadores")
    .select("id_club, activo")
    .eq("id", idJugador)
    .maybeSingle();

  if (!equipo || !jugador || equipo.id_club !== jugador.id_club) {
    errTorneo(idTorneo, "El jugador debe pertenecer al mismo club que el equipo.");
  }
  if (!jugador.activo) {
    errTorneo(idTorneo, "El jugador no está activo.");
  }

  const { error } = await supabase.from("equipo_jugadores").insert({
    id_equipo: idEquipo,
    id_jugador: idJugador,
  });

  if (error) {
    errTorneo(idTorneo, error.message);
  }

  revalidatePath(`/gestion/torneos/${idTorneo}`);
  redirect(`/gestion/torneos/${idTorneo}?ok=1`);
}

export async function quitarJugadorDelPlantel(formData) {
  const supabase = await createServerSupabaseClient();
  const idTorneo = formData.get("id_torneo")?.toString();
  const idFila = formData.get("id_fila")?.toString();

  if (!idTorneo || !idFila) {
    errTorneo(idTorneo ?? "", "No se pudo quitar el jugador del plantel.");
  }

  const { error } = await supabase.from("equipo_jugadores").delete().eq("id", idFila);

  if (error) {
    errTorneo(idTorneo, error.message);
  }

  revalidatePath(`/gestion/torneos/${idTorneo}`);
  redirect(`/gestion/torneos/${idTorneo}?ok=1`);
}

export async function actualizarEncuentro(formData) {
  const supabase = await createServerSupabaseClient();
  const id = formData.get("id")?.toString();
  const idTorneo = formData.get("id_torneo")?.toString();
  const numFechaRaw = formData.get("numero_fecha")?.toString().trim();
  const numeroFecha = numFechaRaw ? Number.parseInt(numFechaRaw, 10) : null;
  const estado = formData.get("estado")?.toString();
  const fechaHoraRaw = formData.get("fecha_hora")?.toString();
  const fechaHora = parseFechaHoraLocal(fechaHoraRaw);

  if (!id || !idTorneo || !estado) {
    errTorneo(idTorneo ?? "", "Datos incompletos para actualizar el encuentro.");
  }
  if (!["programado", "jugado", "cancelado"].includes(estado)) {
    errTorneo(idTorneo, "Estado de encuentro no válido.");
  }
  if (numFechaRaw && Number.isNaN(numeroFecha)) {
    errTorneo(idTorneo, "Número de fecha debe ser entero.");
  }

  const { error } = await supabase
    .from("encuentros")
    .update({
      numero_fecha: numeroFecha,
      fecha_hora: fechaHora,
      estado,
    })
    .eq("id", id)
    .eq("id_torneo", idTorneo);

  if (error) {
    errTorneo(idTorneo, error.message);
  }

  revalidatePath(`/gestion/torneos/${idTorneo}`);
  revalidatePath(`/torneos/${idTorneo}`);
  revalidatePath("/panel/mis-encuentros");
  redirect(`/gestion/torneos/${idTorneo}?ok=1`);
}

/** Cambia estado de todos los encuentros de una jornada (y división opcional). */
export async function cambiarEstadoEncuentrosMasivo(formData) {
  const supabase = await createServerSupabaseClient();
  const idTorneo = formData.get("id_torneo")?.toString();
  const idDivision = formData.get("id_division")?.toString() || null;
  const numFechaRaw = formData.get("numero_fecha")?.toString().trim();
  const numeroFecha = numFechaRaw ? Number.parseInt(numFechaRaw, 10) : null;
  const estado = formData.get("estado")?.toString();

  if (!idTorneo || numeroFecha == null || Number.isNaN(numeroFecha) || !estado) {
    errTorneo(idTorneo ?? "", "Indicá jornada y estado para el cambio masivo.");
  }
  if (!["programado", "cancelado"].includes(estado)) {
    errTorneo(
      idTorneo,
      "En cambio masivo solo se permite programado o cancelado (jugado se define al cargar parciales).",
    );
  }

  let query = supabase
    .from("encuentros")
    .update({ estado })
    .eq("id_torneo", idTorneo)
    .eq("numero_fecha", numeroFecha);

  if (idDivision) {
    query = query.eq("id_division", idDivision);
  }

  const { data, error } = await query.select("id");

  if (error) {
    errTorneo(idTorneo, error.message);
  }

  if (!data?.length) {
    errTorneo(idTorneo, "No hay encuentros en esa jornada con los filtros elegidos.");
  }

  revalidatePath(`/gestion/torneos/${idTorneo}`);
  revalidatePath(`/torneos/${idTorneo}`);
  revalidatePath("/panel/mis-encuentros");
  redirect(`/gestion/torneos/${idTorneo}?ok=1`);
}
