import Link from "next/link";
import { notFound } from "next/navigation";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { createServerSupabaseClientOpcional } from "@/lib/supabase/server";

export async function generateMetadata({ params }) {
  const supabase = await createServerSupabaseClientOpcional();
  if (!supabase) {
    return { title: "Torneo" };
  }
  const { id } = await params;
  const { data } = await supabase
    .from("torneos")
    .select("nombre")
    .eq("id", id)
    .eq("estado", "publicado")
    .maybeSingle();
  if (!data?.nombre) {
    return { title: "Torneo" };
  }
  return { title: data.nombre };
}

export default async function TorneoDetallePage({ params }) {
  const supabase = await createServerSupabaseClientOpcional();
  const { id } = await params;

  if (!supabase) {
    return (
      <ContenedorPagina>
        <p className="text-base text-stone-600">
          Configurá Supabase en{" "}
          <code className="rounded bg-stone-200 px-1.5 py-0.5 text-sm">
            .env.local
          </code>{" "}
          para ver el detalle del torneo.
        </p>
        <Link
          href="/torneos"
          className="mt-6 inline-block text-base font-medium text-emerald-800 underline-offset-4 hover:underline"
        >
          ← Volver a torneos
        </Link>
      </ContenedorPagina>
    );
  }

  const { data: torneo, error } = await supabase
    .from("torneos")
    .select("id, nombre, temporada, estado")
    .eq("id", id)
    .eq("estado", "publicado")
    .maybeSingle();

  if (error || !torneo) {
    notFound();
  }

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/torneos" className="font-medium text-emerald-800 hover:underline">
          Torneos
        </Link>
        <span className="mx-2" aria-hidden>
          /
        </span>
        <span className="text-stone-800">{torneo.nombre}</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">
          {torneo.nombre}
        </h1>
        <p className="mt-2 text-base text-stone-600">
          Temporada {torneo.temporada} · Estado:{" "}
          <span className="font-medium capitalize text-emerald-800">
            {torneo.estado}
          </span>
        </p>
      </header>

      <section className="mt-8 rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
        <p className="text-base leading-relaxed text-stone-600">
          Acá irá el <strong className="text-stone-800">fixture</strong>, los{" "}
          <strong className="text-stone-800">resultados</strong> y la{" "}
          <strong className="text-stone-800">tabla de posiciones</strong> del
          torneo. Esta pantalla es el primer vistazo de la experiencia pública.
        </p>
      </section>
    </ContenedorPagina>
  );
}
