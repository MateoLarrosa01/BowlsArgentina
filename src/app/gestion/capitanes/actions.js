"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirAdministrador } from "@/lib/auth/requerir-admin";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function conMensaje(mensaje) {
  redirect(`/gestion/capitanes?mensaje=${encodeURIComponent(mensaje)}`);
}

export async function crearCapitan(formData) {
  await requerirAdministrador();

  const correo = formData.get("correo")?.toString().trim().toLowerCase();
  const clave = formData.get("clave")?.toString() ?? "";
  const claveConfirmacion = formData.get("clave_confirmacion")?.toString() ?? "";

  if (!correo || !correo.includes("@")) {
    conMensaje("Indicá un correo válido.");
  }
  if (clave.length < 6) {
    conMensaje("La contraseña debe tener al menos 6 caracteres.");
  }
  if (clave !== claveConfirmacion) {
    conMensaje("Las contraseñas no coinciden.");
  }

  let admin;
  try {
    admin = createAdminSupabaseClient();
  } catch (err) {
    conMensaje(err instanceof Error ? err.message : "No se pudo conectar como administrador.");
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: correo,
    password: clave,
    email_confirm: true,
  });

  if (error) {
    const msg = error.message.includes("already")
      ? "Ya existe un usuario con ese correo."
      : error.message;
    conMensaje(msg);
  }

  if (!data.user) {
    conMensaje("No se pudo crear el usuario.");
  }

  const { error: errPerfil } = await admin
    .from("perfiles")
    .update({ rol: "capitan" })
    .eq("id", data.user.id);

  if (errPerfil) {
    conMensaje(
      `Usuario creado en Auth pero falló el perfil: ${errPerfil.message}. Revisá en Supabase.`,
    );
  }

  revalidatePath("/gestion/capitanes");
  redirect("/gestion/capitanes?ok=1&correo=" + encodeURIComponent(correo));
}
