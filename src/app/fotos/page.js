import Link from "next/link";
import Image from "next/image";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { urlPublicaGaleria } from "@/lib/galeria-fotos";
import { createServerSupabaseClientOpcional } from "@/lib/supabase/server";

export const metadata = {
  title: "Fotos",
  description: "Galería de fotos de Bowls Argentina",
};

export default async function FotosPage() {
  const supabase = await createServerSupabaseClientOpcional();

  let fotos = [];
  if (supabase) {
    const { data } = await supabase
      .from("fotos_galeria")
      .select("id, titulo, ruta_storage, orden")
      .eq("publicada", true)
      .order("orden", { ascending: true })
      .order("creado_en", { ascending: false });
    fotos = data ?? [];
  }

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/" className="font-medium text-emerald-800 hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Fotos</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Fotos</h1>
        <p className="mt-2 text-base text-stone-600">
          Galería de imágenes de torneos y actividades de la federación.
        </p>
      </header>

      {!fotos.length && (
        <p className="mt-10 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-8 text-center text-stone-600">
          Todavía no hay fotos publicadas. Pronto verás novedades aquí.
        </p>
      )}

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fotos.map((f) => {
          const url = supabase ? urlPublicaGaleria(supabase, f.ruta_storage) : null;
          if (!url) return null;
          return (
            <li
              key={f.id}
              className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="relative aspect-[4/3] bg-stone-100">
                <Image
                  src={url}
                  alt={f.titulo ?? "Foto de la federación"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              {f.titulo && (
                <p className="px-3 py-2 text-sm font-medium text-stone-800">{f.titulo}</p>
              )}
            </li>
          );
        })}
      </ul>
    </ContenedorPagina>
  );
}
