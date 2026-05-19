import Link from "next/link";
import {
  SLUGS_INSTITUCIONALES_NAV,
  rutaInstitucionalNav,
} from "@/lib/contenido-institucional";

export function PieSitio() {
  const anio = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white py-8 text-stone-600">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed">
          © {anio} Bowls Argentina · Plataforma para la federación y los clubes.
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {SLUGS_INSTITUCIONALES_NAV.map((p) => (
            <Link
              key={p.slug}
              href={rutaInstitucionalNav(p)}
              className="font-medium text-emerald-800 underline-offset-4 hover:underline"
            >
              {p.etiqueta}
            </Link>
          ))}
          <Link
            href="https://bowlsargentina.org/"
            className="font-medium text-emerald-800 underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Sitio histórico
          </Link>
        </nav>
      </div>
    </footer>
  );
}
