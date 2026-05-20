import { redirect } from "next/navigation";

/** El registro público está deshabilitado; solo la federación crea capitanes. */
export default function RegistroPage() {
  redirect("/iniciar-sesion");
}
