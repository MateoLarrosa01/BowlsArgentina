import Link from "next/link";
import { notFound } from "next/navigation";
import { ContenidoInstitucional } from "@/components/contenido-institucional";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { createServerSupabaseClientOpcional } from "@/lib/supabase/server";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClientOpcional();
  if (!supabase) {
    return { title: slug };
  }
  const { data } = await supabase
    .from("paginas_institucionales")
    .select("titulo")
    .eq("slug", slug)
    .eq("publicada", true)
    .maybeSingle();
  return { title: data?.titulo ?? "Página no encontrada" };
}

export default async function PaginaInstitucionalPublica({ params }) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClientOpcional();

  if (!supabase) {
    return (
      <ContenedorPagina>
        <h1 className="text-2xl font-bold text-stone-900">Contenido institucional</h1>
        <p className="mt-4 text-stone-600">
          Configurá Supabase para cargar las páginas desde la base de datos.
        </p>
      </ContenedorPagina>
    );
  }

  const { data: pagina, error } = await supabase
    .from("paginas_institucionales")
    .select("titulo, contenido, publicada")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !pagina || !pagina.publicada) {
    notFound();
  }

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/" className="font-medium text-emerald-800 hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">{pagina.titulo}</span>
      </nav>

      <article className="mt-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">{pagina.titulo}</h1>
        <div className="mt-6">
          <ContenidoInstitucional texto={pagina.contenido} />
        </div>
      </article>

      <p className="mt-10 text-sm text-stone-500">
        <Link href="/torneos" className="font-medium text-emerald-800 hover:underline">
          Ver torneos publicados
        </Link>
      </p>
    </ContenedorPagina>
  );
}
