"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function conMensaje(ruta, mensaje) {
  redirect(`${ruta}?mensaje=${encodeURIComponent(mensaje)}`);
}

export async function crearClub(formData) {
  const supabase = await createServerSupabaseClient();
  const nombre = formData.get("nombre")?.toString().trim();
  if (!nombre) {
    conMensaje("/panel/admin/clubes", "El nombre del club es obligatorio.");
  }

  const { error } = await supabase.from("clubes").insert({
    nombre,
    nombre_corto: formData.get("nombre_corto")?.toString().trim() || null,
    correo_contacto: formData.get("correo_contacto")?.toString().trim() || null,
    telefono: formData.get("telefono")?.toString().trim() || null,
  });

  if (error) {
    conMensaje("/panel/admin/clubes", error.message);
  }

  revalidatePath("/panel/admin/clubes");
  revalidatePath("/torneos");
  redirect("/panel/admin/clubes?ok=1");
}

export async function actualizarClub(formData) {
  const supabase = await createServerSupabaseClient();
  const id = formData.get("id")?.toString();
  const nombre = formData.get("nombre")?.toString().trim();
  if (!id || !nombre) {
    conMensaje("/panel/admin/clubes", "Datos incompletos para actualizar el club.");
  }

  const activo = ["on", "true"].includes(formData.get("activo"));

  const { error } = await supabase
    .from("clubes")
    .update({
      nombre,
      nombre_corto: formData.get("nombre_corto")?.toString().trim() || null,
      correo_contacto: formData.get("correo_contacto")?.toString().trim() || null,
      telefono: formData.get("telefono")?.toString().trim() || null,
      activo,
    })
    .eq("id", id);

  if (error) {
    conMensaje("/panel/admin/clubes", error.message);
  }

  revalidatePath("/panel/admin/clubes");
  revalidatePath("/torneos");
  redirect("/panel/admin/clubes?ok=1");
}
