"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function errTorneo(id, msg) {
  redirect(`/panel/admin/torneos/${id}?mensaje=${encodeURIComponent(msg)}`);
}

function errTorneos(msg) {
  redirect(`/panel/admin/torneos?mensaje=${encodeURIComponent(msg)}`);
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

  revalidatePath("/panel/admin/torneos");
  revalidatePath("/torneos");
  redirect(`/panel/admin/torneos/${data.id}?ok=1`);
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

  revalidatePath("/panel/admin/torneos");
  revalidatePath(`/panel/admin/torneos/${id}`);
  revalidatePath("/torneos");
  revalidatePath(`/torneos/${id}`);
  redirect(`/panel/admin/torneos/${id}?ok=1`);
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

  revalidatePath(`/panel/admin/torneos/${idTorneo}`);
  revalidatePath(`/torneos/${idTorneo}`);
  redirect(`/panel/admin/torneos/${idTorneo}?ok=1`);
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

  revalidatePath(`/panel/admin/torneos/${idTorneo}`);
  revalidatePath(`/torneos/${idTorneo}`);
  redirect(`/panel/admin/torneos/${idTorneo}?ok=1`);
}

export async function crearEncuentro(formData) {
  const supabase = await createServerSupabaseClient();
  const idTorneo = formData.get("id_torneo")?.toString();
  const idDivision = formData.get("id_division")?.toString();
  const local = formData.get("id_equipo_local")?.toString();
  const visitante = formData.get("id_equipo_visitante")?.toString();
  const numFechaRaw = formData.get("numero_fecha")?.toString().trim();
  const numeroFecha = numFechaRaw ? Number.parseInt(numFechaRaw, 10) : null;

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

  const { error } = await supabase.from("encuentros").insert({
    id_torneo: idTorneo,
    id_division: idDivision,
    id_equipo_local: local,
    id_equipo_visitante: visitante,
    numero_fecha: numeroFecha,
    estado: "programado",
  });

  if (error) {
    errTorneo(idTorneo, error.message);
  }

  revalidatePath(`/panel/admin/torneos/${idTorneo}`);
  revalidatePath(`/torneos/${idTorneo}`);
  redirect(`/panel/admin/torneos/${idTorneo}?ok=1`);
}
