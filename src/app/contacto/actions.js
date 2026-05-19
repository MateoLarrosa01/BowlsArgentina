"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function enviarMensajeContacto(formData) {
  const supabase = await createServerSupabaseClient();
  const nombre = formData.get("nombre")?.toString().trim();
  const apellido = formData.get("apellido")?.toString().trim();
  const correo = formData.get("correo")?.toString().trim();
  const mensaje = formData.get("mensaje")?.toString().trim();

  if (!nombre || !apellido || !correo || !mensaje) {
    redirect("/contacto?mensaje=Completá+todos+los+campos+obligatorios.");
  }
  if (!correo.includes("@")) {
    redirect("/contacto?mensaje=Indicá+un+correo+válido.");
  }

  const { error } = await supabase.from("mensajes_contacto").insert({
    nombre,
    apellido,
    correo,
    mensaje,
  });

  if (error) {
    redirect(`/contacto?mensaje=${encodeURIComponent(error.message)}`);
  }

  redirect("/contacto?ok=1");
}
