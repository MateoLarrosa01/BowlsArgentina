"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function marcarMensajeLeido(formData) {
  const supabase = await createServerSupabaseClient();
  const id = formData.get("id")?.toString();
  if (!id) {
    redirect("/gestion/contacto?mensaje=Falta+identificar+el+mensaje.");
  }

  const { error } = await supabase
    .from("mensajes_contacto")
    .update({ leido: true })
    .eq("id", id);

  if (error) {
    redirect(`/gestion/contacto?mensaje=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/gestion/contacto");
  redirect("/gestion/contacto?ok=1");
}
