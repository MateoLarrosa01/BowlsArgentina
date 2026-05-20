"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function iniciarSesion(formData) {
  const correo = formData.get("correo")?.toString().trim();
  const clave = formData.get("clave")?.toString() ?? "";
  const siguienteRaw = formData.get("siguiente")?.toString() || "/panel";
  const siguiente =
    siguienteRaw.startsWith("/") && !siguienteRaw.startsWith("//")
      ? siguienteRaw
      : "/panel";

  if (!correo || !clave) {
    redirect(
      `/iniciar-sesion?mensaje=${encodeURIComponent("Completá correo y contraseña.")}&siguiente=${encodeURIComponent(siguiente)}`,
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: clave,
  });

  if (error) {
    redirect(
      `/iniciar-sesion?mensaje=${encodeURIComponent(error.message)}&siguiente=${encodeURIComponent(siguiente)}`,
    );
  }

  redirect(siguiente);
}
