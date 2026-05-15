import { Suspense } from "react";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { FormularioInicioSesion } from "./formulario-inicio-sesion";

export default function IniciarSesionPage() {
  return (
    <Suspense
      fallback={
        <ContenedorPagina className="max-w-md">
          <p className="text-base text-stone-600">Cargando…</p>
        </ContenedorPagina>
      }
    >
      <FormularioInicioSesion />
    </Suspense>
  );
}
