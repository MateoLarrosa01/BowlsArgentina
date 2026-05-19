import Link from "next/link";
import { ContenedorPagina } from "@/components/contenedor-pagina";

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
          Consultá torneos publicados, fixture y tablas sin crear cuenta. Quienes
          gestionan la federación o los clubes acceden con sesión para cargar
          datos y administrar la competencia.
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
              "Navegación clara para seguir fechas, resultados y posiciones en el celular.",
          },
          {
            titulo: "Gestión centralizada",
            texto:
              "Clubes, equipos y encuentros con reglas alineadas al modelo interclubes.",
          },
          {
            titulo: "Institucional y clubes",
            texto:
              "Quiénes somos y contacto editables por la federación; capitán carga parciales desde el celular.",
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
