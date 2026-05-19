import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { marcarMensajeLeido } from "./actions";

function formatearFecha(iso) {
  try {
    return new Date(iso).toLocaleString("es-AR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default async function GestionContactoPage({ searchParams }) {
  const supabase = await createServerSupabaseClient();
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";

  const { data: mensajes, error } = await supabase
    .from("mensajes_contacto")
    .select("id, nombre, apellido, correo, mensaje, leido, creado_en")
    .order("creado_en", { ascending: false });

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/gestion" className="font-medium text-emerald-800 hover:underline">
          Gestión
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Mensajes de contacto</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Mensajes de contacto</h1>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          Consultas enviadas desde el formulario público de{" "}
          <Link href="/contacto" className="font-medium text-emerald-800 hover:underline" target="_blank">
            Contacto
          </Link>
          .
        </p>
      </header>

      {mensaje && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {mensaje}
        </p>
      )}
      {ok && (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          Actualizado.
        </p>
      )}
      {error && <p className="mt-6 text-sm text-red-700">{error.message}</p>}

      {!mensajes?.length && (
        <p className="mt-10 text-stone-600">Todavía no hay mensajes.</p>
      )}

      <ul className="mt-10 space-y-6">
        {(mensajes ?? []).map((m) => (
          <li
            key={m.id}
            className={`rounded-2xl border p-6 shadow-sm ${
              m.leido ? "border-stone-200 bg-white" : "border-emerald-300 bg-emerald-50/40"
            }`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-semibold text-stone-900">
                  {m.nombre} {m.apellido}
                  {!m.leido && (
                    <span className="ml-2 rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-medium text-white">
                      Nuevo
                    </span>
                  )}
                </p>
                <p className="text-sm text-stone-600">
                  <a href={`mailto:${m.correo}`} className="text-emerald-800 hover:underline">
                    {m.correo}
                  </a>
                  {" · "}
                  {formatearFecha(m.creado_en)}
                </p>
              </div>
              {!m.leido && (
                <form action={marcarMensajeLeido}>
                  <input type="hidden" name="id" value={m.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm font-medium hover:bg-stone-50"
                  >
                    Marcar leído
                  </button>
                </form>
              )}
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-800">{m.mensaje}</p>
          </li>
        ))}
      </ul>
    </ContenedorPagina>
  );
}

