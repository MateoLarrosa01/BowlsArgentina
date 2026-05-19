"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function conMensaje(ruta, mensaje) {
  redirect(`${ruta}?mensaje=${encodeURIComponent(mensaje)}`);
}

export async function crearJugador(formData) {
  const supabase = await createServerSupabaseClient();
  const nombre = formData.get("nombre")?.toString().trim();
  const apellido = formData.get("apellido")?.toString().trim();
  const idClub = formData.get("id_club")?.toString();
  const fechaRaw = formData.get("fecha_nacimiento")?.toString().trim();

  if (!nombre || !apellido || !idClub) {
    conMensaje("/gestion/jugadores", "Nombre, apellido y club son obligatorios.");
  }

  const { error } = await supabase.from("jugadores").insert({
    nombre,
    apellido,
    id_club: idClub,
    fecha_nacimiento: fechaRaw || null,
    activo: true,
  });

  if (error) {
    conMensaje("/gestion/jugadores", error.message);
  }

  revalidatePath("/gestion/jugadores");
  redirect("/gestion/jugadores?ok=1");
}

export async function actualizarJugador(formData) {
  const supabase = await createServerSupabaseClient();
  const id = formData.get("id")?.toString();
  const nombre = formData.get("nombre")?.toString().trim();
  const apellido = formData.get("apellido")?.toString().trim();
  const idClub = formData.get("id_club")?.toString();
  const fechaRaw = formData.get("fecha_nacimiento")?.toString().trim();
  const activo = ["on", "true"].includes(formData.get("activo"));

  if (!id || !nombre || !apellido || !idClub) {
    conMensaje("/gestion/jugadores", "Datos incompletos para actualizar el jugador.");
  }

  const { error } = await supabase
    .from("jugadores")
    .update({
      nombre,
      apellido,
      id_club: idClub,
      fecha_nacimiento: fechaRaw || null,
      activo,
    })
    .eq("id", id);

  if (error) {
    conMensaje("/gestion/jugadores", error.message);
  }

  revalidatePath("/gestion/jugadores");
  redirect("/gestion/jugadores?ok=1");
}
