import Link from "next/link";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { createServerSupabaseClientOpcional } from "@/lib/supabase/server";

export const metadata = {
  title: "Reglamentos",
  description: "Reglamentos oficiales de Bowls Argentina",
};

export default async function ReglamentosPage() {
  const supabase = await createServerSupabaseClientOpcional();

  let documentos = [];
  if (supabase) {
    const { data } = await supabase
      .from("reglamentos_documentos")
      .select("id, titulo, nombre_archivo, orden")
      .eq("activo", true)
      .order("orden", { ascending: true });
    documentos = data ?? [];
  }

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/" className="font-medium text-emerald-800 hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Reglamentos</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Reglamentos</h1>
        <p className="mt-2 text-base text-stone-600">
          Descargá los documentos oficiales en formato PDF.
        </p>
      </header>

      {!documentos.length && (
        <p className="mt-10 text-center text-stone-600">
          No hay reglamentos disponibles por el momento.
        </p>
      )}

      <ul className="mx-auto mt-12 max-w-xl space-y-6">
        {documentos.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-col gap-3 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm font-bold uppercase tracking-wide text-stone-800 sm:text-base">
              {doc.titulo}
            </span>
            <a
              href={`/reglamentos/${doc.nombre_archivo}`}
              download
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-sky-700 px-8 text-sm font-bold uppercase tracking-wide text-white hover:bg-sky-800"
            >
              Descargar
            </a>
          </li>
        ))}
      </ul>
    </ContenedorPagina>
  );
}
