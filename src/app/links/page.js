import Link from "next/link";
import Image from "next/image";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { createServerSupabaseClientOpcional } from "@/lib/supabase/server";

export const metadata = {
  title: "Links",
  description: "Enlaces y redes de clubes asociados",
};

function IconoInstagram() {
  return (
    <svg className="h-8 w-8" viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ig)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.07-4.85.07-3.204 0-3.584-.012-4.85-.07-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.014 7.052.072 5.775.132 4.602.333 3.62 1.315 2.335 2.6 2.135 3.773 2.075 5.052 2.017 6.332 2 6.741 2 12c0 5.259.014 5.668.072 6.948.06 1.277.26 2.45 1.243 3.432 1.225.982 2.208 2.08 2.403 3.36 2.463 1.28.058 1.689.072 6.948.072 5.259 0 5.668-.014 6.948-.06 1.277-.2 2.45-1.183 3.432-1.225.982-.042 2.08-.188 3.36-2.463 1.28-.058 1.689-.072 6.948-.072 5.259 0 5.668.014 6.948.072 1.277.06 2.45.26 3.432 1.243.982.982 2.08 2.403 3.36 2.463 1.28.058 1.689.072 6.948.072 5.259 0 5.668-.014 6.948-.06 1.277-.26 2.45-1.243 3.432-1.225.982-.042 2.08-.188 3.36-2.463 1.28-.058 1.689-.072 6.948-.072z"
      />
      <path
        fill="url(#ig)"
        d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      />
    </svg>
  );
}

export default async function LinksPage() {
  const supabase = await createServerSupabaseClientOpcional();

  let enlaces = [];
  if (supabase) {
    const { data } = await supabase
      .from("enlaces_asociados")
      .select("id, nombre, direccion, telefono, correo, url_instagram, url_logo")
      .eq("activo", true)
      .order("orden", { ascending: true })
      .order("nombre", { ascending: true });
    enlaces = data ?? [];
  }

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/" className="font-medium text-emerald-800 hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Links</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6 text-center">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Clubes</h1>
        <p className="mt-2 text-base text-stone-600">
          Federación y clubes asociados — contacto y redes sociales.
        </p>
      </header>

      <ul className="mt-10 space-y-8">
        {enlaces.map((e) => (
          <li
            key={e.id}
            className="flex flex-col gap-4 border-b border-stone-100 pb-8 sm:flex-row sm:items-center"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-stone-100">
              {e.url_logo ? (
                <Image
                  src={e.url_logo}
                  alt=""
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
              ) : (
                <Image
                  src="/logo-federacion.png"
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-contain opacity-40"
                />
              )}
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h2 className="text-base font-bold text-stone-900">{e.nombre}</h2>
              {e.direccion && (
                <p className="mt-1 text-sm text-stone-600">{e.direccion}</p>
              )}
              {e.telefono && (
                <p className="text-sm text-stone-600">Tel. {e.telefono}</p>
              )}
              {e.correo && (
                <p className="text-sm">
                  <a href={`mailto:${e.correo}`} className="text-emerald-800 hover:underline">
                    {e.correo}
                  </a>
                </p>
              )}
            </div>
            {e.url_instagram && (
              <a
                href={e.url_instagram}
                target="_blank"
                rel="noreferrer"
                className="mx-auto shrink-0 sm:mx-0"
                aria-label={`Instagram de ${e.nombre}`}
              >
                <IconoInstagram />
              </a>
            )}
          </li>
        ))}
      </ul>
    </ContenedorPagina>
  );
}
