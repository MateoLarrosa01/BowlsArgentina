import Link from "next/link";
import { ContenedorPagina } from "@/components/contenedor-pagina";

export default function TorneoNoEncontrado() {
  return (
    <ContenedorPagina>
      <h1 className="text-2xl font-bold text-stone-900">Torneo no encontrado</h1>
      <p className="mt-3 text-base text-stone-600">
        No hay un torneo publicado con ese enlace, o fue despublicado.
      </p>
      <Link
        href="/torneos"
        className="mt-8 inline-flex min-h-[48px] items-center text-base font-semibold text-emerald-800 underline-offset-4 hover:underline"
      >
        ← Volver a torneos
      </Link>
    </ContenedorPagina>
  );
}
