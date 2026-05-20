import Link from "next/link";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { MENU_PUBLICO } from "@/lib/navegacion-publica";

const enlacesInstitucionales = MENU_PUBLICO.filter(
  (e) => !["/", "/torneos"].includes(e.href)
);

export default function Home() {
  return (
    <ContenedorPagina>
      <section className="space-y-6 text-center sm:text-left">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-800">
          Federación · Torneos interclubes
        </p>
        <h1 className="text-3xl font-bold leading-tight text-stone-900 sm:text-4xl md:text-5xl">
          La competencia en un solo lugar
        </h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-stone-600 sm:mx-0">
          Consultá torneos publicados, fixture y tablas sin crear cuenta. También
          encontrá información de la federación, reglamentos, fotos y contacto con
          los clubes asociados.
        </p>
        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
          <Link
            href="/torneos"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-700 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-600"
          >
            Ver torneos
          </Link>
          <Link
            href="/iniciar-sesion"
            className="inline-flex min-h-[48px] items-center justify-center rounded-xl border-2 border-stone-300 bg-white px-6 text-base font-semibold text-stone-800 transition hover:border-emerald-600 hover:text-emerald-900"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      <nav
        className="mt-10 flex flex-wrap justify-center gap-2 sm:justify-start"
        aria-label="Secciones del sitio"
      >
        {enlacesInstitucionales.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className="rounded-full border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-emerald-900 shadow-sm hover:border-emerald-400"
          >
            {e.etiqueta}
          </Link>
        ))}
      </nav>

      <aside className="mt-10 rounded-2xl border border-sky-200 bg-sky-50 px-5 py-4 text-left text-sm leading-relaxed text-sky-950 shadow-sm">
        <strong className="text-sky-950">¿Todavía sin base de datos?</strong> Creá un
        proyecto gratis en{" "}
        <a
          href="https://supabase.com/dashboard"
          className="font-semibold text-sky-900 underline underline-offset-2"
          target="_blank"
          rel="noreferrer"
        >
          Supabase
        </a>
        , ejecutá en el SQL Editor el archivo{" "}
        <code className="rounded bg-white px-1.5 py-0.5 text-xs text-stone-800">
          supabase/bootstrap-inicial.sql
        </code>
        , luego creá{" "}
        <code className="rounded bg-white px-1.5 py-0.5 text-xs text-stone-800">
          .env.local
        </code>{" "}
        con la URL y la clave <em>anon</em>. Guía detallada:{" "}
        <code className="rounded bg-white px-1.5 py-0.5 text-xs text-stone-800">
          Documentacion/primer-arranque-supabase.md
        </code>
        .
      </aside>

      <section className="mt-14 grid gap-6 sm:grid-cols-3">
        {[
          {
            titulo: "Público sin cuenta",
            texto:
              "Torneos, fixture, tabla, fotos, reglamentos, links y formulario de contacto.",
          },
          {
            titulo: "Gestión centralizada",
            texto:
              "Clubes, jugadores, torneos, fixture, galería y enlaces de clubes desde un solo panel.",
          },
          {
            titulo: "Capitán en el celular",
            texto:
              "Carga de parciales y shots en Mis encuentros; resultados visibles al instante en el sitio público.",
          },
        ].map((bloque) => (
          <article
            key={bloque.titulo}
            className="rounded-2xl border border-stone-200 bg-white p-6 text-left shadow-sm"
          >
            <h2 className="text-lg font-semibold text-emerald-950">
              {bloque.titulo}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-stone-600">
              {bloque.texto}
            </p>
          </article>
        ))}
      </section>
    </ContenedorPagina>
  );
}
