import Link from "next/link";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { enviarMensajeContacto } from "./actions";

export const metadata = {
  title: "Contacto",
  description: "Contacto con la Federación Argentina de Bowls",
};

export default async function ContactoPage({ searchParams }) {
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/" className="font-medium text-emerald-800 hover:underline">
          Inicio
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Contacto</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Contacto</h1>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          Escribinos a la federación. Te responderemos al correo que indiques.
        </p>
      </header>

      {mensaje && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {mensaje}
        </p>
      )}
      {ok && (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          Mensaje enviado. Gracias por contactarnos.
        </p>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <form action={enviarMensajeContacto} className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-stone-700">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              required
              placeholder="Tu nombre"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-stone-700">
              Apellido
            </label>
            <input
              id="apellido"
              name="apellido"
              required
              placeholder="Tu apellido"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-stone-700">
              Correo electrónico *
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              required
              placeholder="tu@correo.com"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div>
            <label htmlFor="mensaje" className="block text-sm font-medium text-stone-700">
              Mensaje *
            </label>
            <textarea
              id="mensaje"
              name="mensaje"
              required
              rows={5}
              placeholder="Escribí tu mensaje"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-base"
            />
          </div>
          <button
            type="submit"
            className="w-full min-h-[48px] rounded-xl bg-stone-900 text-base font-semibold text-white hover:bg-stone-800"
          >
            Enviar
          </button>
        </form>

        <aside className="flex flex-col justify-center gap-6 text-center lg:text-left">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Correo
            </h2>
            <a
              href="mailto:info@bowlsargentina.org"
              className="mt-1 block text-lg font-medium text-emerald-800 hover:underline"
            >
              info@bowlsargentina.org
            </a>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              Instagram
            </h2>
            <a
              href="https://www.instagram.com/federacionargentinadebowl"
              className="mt-1 block text-lg font-medium text-emerald-800 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              @federacionargentinadebowl
            </a>
          </div>
        </aside>
      </div>
    </ContenedorPagina>
  );
}
