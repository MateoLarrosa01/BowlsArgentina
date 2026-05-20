import { Fragment } from "react";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { AlertasFlash } from "@/components/gestion/alertas-flash";
import {
  BotonCancelarEdicion,
  FilaEdicion,
  TablaGestion,
  Td,
  Th,
} from "@/components/gestion/tabla-gestion";
import { idEnDetalle, urlCerrarPanel, urlVer } from "@/lib/gestion/url-edicion";
import { marcarMensajeLeido } from "./actions";

const RUTA = "/gestion/contacto";

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
  const verId = idEnDetalle(sp);

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

      <AlertasFlash mensaje={mensaje} ok={ok} okTexto="Actualizado." />
      {error && <p className="mt-6 text-sm text-red-700">{error.message}</p>}

      <section className="mt-10">
        <TablaGestion vacio={!mensajes?.length && !error ? "Todavía no hay mensajes." : null}>
          <thead>
            <tr>
              <Th>Fecha</Th>
              <Th>Remitente</Th>
              <Th>Correo</Th>
              <Th>Estado</Th>
              <Th className="text-right">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {(mensajes ?? []).map((m) => (
              <Fragment key={m.id}>
                <tr
                  className={
                    verId === m.id
                      ? "bg-emerald-50/40"
                      : !m.leido
                        ? "bg-emerald-50/20"
                        : undefined
                  }
                >
                  <Td className="whitespace-nowrap text-stone-600">{formatearFecha(m.creado_en)}</Td>
                  <Td>
                    <span className="font-medium">
                      {m.nombre} {m.apellido}
                    </span>
                  </Td>
                  <Td>
                    <a href={`mailto:${m.correo}`} className="text-emerald-800 hover:underline">
                      {m.correo}
                    </a>
                  </Td>
                  <Td>
                    {m.leido ? (
                      <span className="text-stone-500">Leído</span>
                    ) : (
                      <span className="inline-flex rounded-full bg-emerald-700 px-2 py-0.5 text-xs font-medium text-white">
                        Nuevo
                      </span>
                    )}
                  </Td>
                  <Td className="text-right">
                    {verId !== m.id && (
                      <a
                        href={urlVer(RUTA, m.id)}
                        className="inline-flex min-h-[36px] items-center rounded-lg border border-emerald-700 px-3 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
                      >
                        Ver
                      </a>
                    )}
                  </Td>
                </tr>
                {verId === m.id && (
                  <FilaEdicion colSpan={5}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
                      {m.mensaje}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {!m.leido && (
                        <form action={marcarMensajeLeido}>
                          <input type="hidden" name="id" value={m.id} />
                          <button
                            type="submit"
                            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                          >
                            Marcar leído
                          </button>
                        </form>
                      )}
                      <BotonCancelarEdicion href={urlCerrarPanel(sp, RUTA)} />
                    </div>
                  </FilaEdicion>
                )}
              </Fragment>
            ))}
          </tbody>
        </TablaGestion>
      </section>
    </ContenedorPagina>
  );
}
