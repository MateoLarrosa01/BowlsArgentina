"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function conMensaje(mensaje) {
  redirect(`/gestion/enlaces?mensaje=${encodeURIComponent(mensaje)}`);
}

function datosEnlace(formData) {
  return {
    nombre: formData.get("nombre")?.toString().trim(),
    direccion: formData.get("direccion")?.toString().trim() || null,
    telefono: formData.get("telefono")?.toString().trim() || null,
    correo: formData.get("correo")?.toString().trim() || null,
    url_instagram: formData.get("url_instagram")?.toString().trim() || null,
    url_web: formData.get("url_web")?.toString().trim() || null,
    url_logo: formData.get("url_logo")?.toString().trim() || null,
    orden: Number(formData.get("orden")?.toString()) || 0,
    activo: formData.get("activo") === "on",
  };
}

export async function crearEnlaceAsociado(formData) {
  const supabase = await createServerSupabaseClient();
  const datos = datosEnlace(formData);
  if (!datos.nombre) conMensaje("El nombre es obligatorio.");

  const { error } = await supabase.from("enlaces_asociados").insert(datos);
  if (error) conMensaje(error.message);

  revalidatePath("/links");
  revalidatePath("/gestion/enlaces");
  redirect("/gestion/enlaces?ok=1");
}

export async function actualizarEnlaceAsociado(formData) {
  const supabase = await createServerSupabaseClient();
  const id = formData.get("id")?.toString();
  const datos = datosEnlace(formData);
  if (!id || !datos.nombre) conMensaje("Datos incompletos.");

  const { error } = await supabase.from("enlaces_asociados").update(datos).eq("id", id);
  if (error) conMensaje(error.message);

  revalidatePath("/links");
  revalidatePath("/gestion/enlaces");
  redirect("/gestion/enlaces?ok=1");
}

export async function eliminarEnlaceAsociado(formData) {
  const supabase = await createServerSupabaseClient();
  const id = formData.get("id")?.toString();
  if (!id) conMensaje("Falta identificar el enlace.");

  const { error } = await supabase.from("enlaces_asociados").delete().eq("id", id);
  if (error) conMensaje(error.message);

  revalidatePath("/links");
  revalidatePath("/gestion/enlaces");
  redirect("/gestion/enlaces?ok=1");
}
