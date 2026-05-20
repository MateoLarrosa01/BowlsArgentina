import { ContenedorPagina } from "@/components/contenedor-pagina";
import { FormularioInicioSesion } from "./formulario-inicio-sesion";

export default async function IniciarSesionPage({ searchParams }) {
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const siguiente =
    sp.siguiente && String(sp.siguiente).startsWith("/") ? String(sp.siguiente) : "/panel";

  return <FormularioInicioSesion siguiente={siguiente} mensaje={mensaje} />;
}
