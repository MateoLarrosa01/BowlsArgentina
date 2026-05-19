import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import {
  actualizarEnlaceAsociado,
  crearEnlaceAsociado,
  eliminarEnlaceAsociado,
} from "./actions";

export default async function GestionEnlacesPage({ searchParams }) {
  const supabase = await createServerSupabaseClient();
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";

  const { data: enlaces, error } = await supabase
    .from("enlaces_asociados")
    .select("*")
    .order("orden", { ascending: true })
    .order("nombre", { ascending: true });

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/gestion" className="font-medium text-emerald-800 hover:underline">
          Gestión
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Enlaces y clubes</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Enlaces y clubes</h1>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          Datos visibles en{" "}
          <Link href="/links" className="font-medium text-emerald-800 hover:underline" target="_blank">
            Links
          </Link>
          . Podés cargar el escudo de cada club en el campo Logo (URL).
        </p>
      </header>

      {mensaje && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {mensaje}
        </p>
      )}
      {ok && (
        <p className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" role="status">
          Cambios guardados.
        </p>
      )}
      {error && <p className="mt-6 text-sm text-red-700">{error.message}</p>}

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-emerald-950">Nuevo enlace</h2>
        <form action={crearEnlaceAsociado} className="mt-4 grid gap-4 sm:grid-cols-2">
          <Campo label="Nombre *" name="nombre" required />
          <Campo label="Orden" name="orden" type="number" defaultValue="0" />
          <Campo label="Dirección" name="direccion" className="sm:col-span-2" />
          <Campo label="Teléfono" name="telefono" />
          <Campo label="Correo" name="correo" type="email" />
          <Campo label="Instagram (URL)" name="url_instagram" className="sm:col-span-2" />
          <Campo label="Sitio web (URL)" name="url_web" className="sm:col-span-2" />
          <Campo label="Logo (URL imagen)" name="url_logo" className="sm:col-span-2" />
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input name="activo" type="checkbox" defaultChecked />
            Visible en el sitio
          </label>
          <button
            type="submit"
            className="sm:col-span-2 rounded-xl bg-emerald-800 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-900"
          >
            Agregar
          </button>
        </form>
      </section>

      <ul className="mt-10 space-y-8">
        {(enlaces ?? []).map((e) => (
          <li key={e.id} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <form action={actualizarEnlaceAsociado} className="grid gap-4 sm:grid-cols-2">
              <input type="hidden" name="id" value={e.id} />
              <Campo label="Nombre *" name="nombre" defaultValue={e.nombre} required />
              <Campo label="Orden" name="orden" type="number" defaultValue={String(e.orden)} />
              <Campo label="Dirección" name="direccion" defaultValue={e.direccion ?? ""} className="sm:col-span-2" />
              <Campo label="Teléfono" name="telefono" defaultValue={e.telefono ?? ""} />
              <Campo label="Correo" name="correo" defaultValue={e.correo ?? ""} />
              <Campo
                label="Instagram (URL)"
                name="url_instagram"
                defaultValue={e.url_instagram ?? ""}
                className="sm:col-span-2"
              />
              <Campo label="Sitio web" name="url_web" defaultValue={e.url_web ?? ""} className="sm:col-span-2" />
              <Campo label="Logo (URL)" name="url_logo" defaultValue={e.url_logo ?? ""} className="sm:col-span-2" />
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input name="activo" type="checkbox" defaultChecked={e.activo} />
                Visible en el sitio
              </label>
              <div className="flex flex-wrap gap-2 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700"
                >
                  Guardar
                </button>
              </div>
            </form>
            <form action={eliminarEnlaceAsociado} className="mt-2">
              <input type="hidden" name="id" value={e.id} />
              <button
                type="submit"
                className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-800 hover:bg-red-50"
              >
                Eliminar
              </button>
            </form>
          </li>
        ))}
      </ul>
    </ContenedorPagina>
  );
}

function Campo({ label, name, className = "", ...props }) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
        {...props}
      />
    </div>
  );
}
