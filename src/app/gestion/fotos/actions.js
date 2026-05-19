"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function conMensaje(mensaje) {
  redirect(`/gestion/fotos?mensaje=${encodeURIComponent(mensaje)}`);
}

export async function subirFotoGaleria(formData) {
  const supabase = await createServerSupabaseClient();
  const archivo = formData.get("archivo");
  const titulo = formData.get("titulo")?.toString().trim() || null;

  if (!(archivo instanceof File) || archivo.size === 0) {
    conMensaje("Seleccioná una imagen para subir.");
  }

  const ext = archivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const ruta = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await archivo.arrayBuffer());

  const { error: errStorage } = await supabase.storage
    .from("galeria")
    .upload(ruta, buffer, { contentType: archivo.type, upsert: false });

  if (errStorage) {
    conMensaje(errStorage.message);
  }

  const { error } = await supabase.from("fotos_galeria").insert({
    titulo,
    ruta_storage: ruta,
    publicada: true,
    orden: Number(formData.get("orden")?.toString()) || 0,
  });

  if (error) {
    await supabase.storage.from("galeria").remove([ruta]);
    conMensaje(error.message);
  }

  revalidatePath("/fotos");
  revalidatePath("/gestion/fotos");
  redirect("/gestion/fotos?ok=1");
}

export async function eliminarFotoGaleria(formData) {
  const supabase = await createServerSupabaseClient();
  const id = formData.get("id")?.toString();
  if (!id) conMensaje("Falta identificar la foto.");

  const { data: foto } = await supabase
    .from("fotos_galeria")
    .select("ruta_storage")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("fotos_galeria").delete().eq("id", id);
  if (error) conMensaje(error.message);

  if (foto?.ruta_storage) {
    await supabase.storage.from("galeria").remove([foto.ruta_storage]);
  }

  revalidatePath("/fotos");
  revalidatePath("/gestion/fotos");
  redirect("/gestion/fotos?ok=1");
}

export async function actualizarFotoGaleria(formData) {
  const supabase = await createServerSupabaseClient();
  const id = formData.get("id")?.toString();
  if (!id) conMensaje("Falta identificar la foto.");

  const { error } = await supabase
    .from("fotos_galeria")
    .update({
      titulo: formData.get("titulo")?.toString().trim() || null,
      orden: Number(formData.get("orden")?.toString()) || 0,
      publicada: formData.get("publicada") === "on",
    })
    .eq("id", id);

  if (error) conMensaje(error.message);

  revalidatePath("/fotos");
  revalidatePath("/gestion/fotos");
  redirect("/gestion/fotos?ok=1");
}
