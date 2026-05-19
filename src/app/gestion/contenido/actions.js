"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { rutaInstitucional } from "@/lib/contenido-institucional";

function conMensaje(ruta, mensaje) {
  redirect(`${ruta}?mensaje=${encodeURIComponent(mensaje)}`);
}

export async function actualizarPaginaInstitucional(formData) {
  const supabase = await createServerSupabaseClient();
  const id = formData.get("id")?.toString();
  const titulo = formData.get("titulo")?.toString().trim();
  const contenido = formData.get("contenido")?.toString() ?? "";
  const publicada = ["on", "true"].includes(formData.get("publicada"));

  if (!id || !titulo) {
    conMensaje("/gestion/contenido", "Título obligatorio.");
  }

  const { data: existente, error: errLectura } = await supabase
    .from("paginas_institucionales")
    .select("slug")
    .eq("id", id)
    .maybeSingle();

  if (errLectura || !existente) {
    conMensaje("/gestion/contenido", "Página no encontrada.");
  }

  const { error } = await supabase
    .from("paginas_institucionales")
    .update({ titulo, contenido, publicada })
    .eq("id", id);

  if (error) {
    conMensaje("/gestion/contenido", error.message);
  }

  revalidatePath("/gestion/contenido");
  revalidatePath(rutaInstitucional(existente.slug));
  redirect("/gestion/contenido?ok=1");
}
