"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirAdministrador } from "@/lib/auth/requerir-admin";
import { buscarUsuarioAuthPorCorreo } from "@/lib/gestion/buscar-usuario-auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

function conMensaje(mensaje, tipo = "error") {
  redirect(
    `/gestion/capitanes?mensaje=${encodeURIComponent(mensaje)}&tipo=${tipo}`,
  );
}

function conExito(correo, aviso) {
  const params = new URLSearchParams({ ok: "1", correo });
  if (aviso) params.set("aviso", aviso);
  redirect(`/gestion/capitanes?${params.toString()}`);
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
    const yaExiste =
      error.message.toLowerCase().includes("already") ||
      error.message.toLowerCase().includes("registered");

    if (yaExiste) {
      const { user: existente, error: errBusqueda } = await buscarUsuarioAuthPorCorreo(
        admin,
        correo,
      );
      if (errBusqueda || !existente) {
        conMensaje(
          "Ese correo ya está registrado. Revisá el listado de abajo; si aparece, no hace falta crearlo de nuevo.",
          "aviso",
        );
      }

      const { data: perfil } = await admin
        .from("perfiles")
        .select("rol")
        .eq("id", existente.id)
        .maybeSingle();

      if (perfil?.rol === "admin_fab" || perfil?.rol === "super_admin") {
        conMensaje(
          "Ese correo pertenece a un usuario de gestión de la federación, no a un capitán.",
        );
      }

      const { error: errClave } = await admin.auth.admin.updateUserById(existente.id, {
        password: clave,
      });
      if (errClave) {
        conMensaje(errClave.message);
      }

      if (perfil?.rol !== "capitan") {
        await admin.from("perfiles").update({ rol: "capitan" }).eq("id", existente.id);
      }

      revalidatePath("/gestion/capitanes");
      conExito(
        correo,
        "La cuenta ya existía (figura en el listado). Se actualizó la contraseña con la que ingresaste.",
      );
    }

    conMensaje(error.message);
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
  conExito(correo);
}
