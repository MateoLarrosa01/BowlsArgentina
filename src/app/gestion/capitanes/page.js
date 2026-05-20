import Link from "next/link";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { AlertasFlash } from "@/components/gestion/alertas-flash";
import { TablaGestion, Td, Th } from "@/components/gestion/tabla-gestion";
import { adminSupabaseConfigurado } from "@/lib/supabase/admin";
import { listarCapitanes } from "@/lib/gestion/listar-capitanes";
import { crearCapitan } from "./actions";

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

export default async function GestionCapitanesPage({ searchParams }) {
  const sp = await searchParams;
  const mensaje = sp.mensaje ? String(sp.mensaje) : null;
  const ok = sp.ok === "1";
  const correoCreado = sp.correo ? String(sp.correo) : null;

  let capitanes = [];
  let errorListado = null;

  if (adminSupabaseConfigurado()) {
    const res = await listarCapitanes();
    capitanes = res.capitanes;
    errorListado = res.error;
  }

  return (
    <ContenedorPagina>
      <nav className="text-sm text-stone-500">
        <Link href="/gestion" className="font-medium text-emerald-800 hover:underline">
          Gestión
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Capitanes</span>
      </nav>

      <header className="mt-4 border-b border-stone-200 pb-6">
        <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl">Capitanes</h1>
        <p className="mt-2 max-w-2xl text-base text-stone-600">
          La federación crea las cuentas de capitán (correo y contraseña). Compartí esos datos con
          la persona asignada; luego podés vincularla al crear un equipo en el torneo con el mismo
          correo.
        </p>
      </header>

      {!adminSupabaseConfigurado() && (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Agregá <code className="rounded bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code> en{" "}
          <code className="rounded bg-white px-1">.env.local</code> para poder crear usuarios desde
          la app (Supabase → Project Settings → API).
        </p>
      )}

      <AlertasFlash mensaje={mensaje} ok={ok} okTexto="Capitán creado correctamente." />

      {ok && correoCreado && (
        <p className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          Pasale al capitán su correo <strong>{correoCreado}</strong> y la contraseña que definiste.
          Podrá ingresar en <strong>Iniciar sesión</strong> y ver <strong>Mis encuentros</strong>.
        </p>
      )}

      <section className="mt-10 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-stone-900">Nuevo capitán</h2>
        <form action={crearCapitan} className="mt-4 grid gap-4 sm:max-w-md">
          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-stone-700">
              Correo *
            </label>
            <input
              id="correo"
              name="correo"
              type="email"
              required
              autoComplete="off"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <div>
            <label htmlFor="clave" className="block text-sm font-medium text-stone-700">
              Contraseña *
            </label>
            <input
              id="clave"
              name="clave"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
            <p className="mt-1 text-xs text-stone-500">Mínimo 6 caracteres. Compartila solo con el capitán.</p>
          </div>
          <div>
            <label htmlFor="clave_confirmacion" className="block text-sm font-medium text-stone-700">
              Repetir contraseña *
            </label>
            <input
              id="clave_confirmacion"
              name="clave_confirmacion"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            />
          </div>
          <button
            type="submit"
            disabled={!adminSupabaseConfigurado()}
            className="min-h-[48px] rounded-xl bg-emerald-700 px-6 text-base font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Crear capitán
          </button>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-stone-900">Cuentas de capitán</h2>
        {errorListado && (
          <p className="mt-4 text-sm text-red-700">Error al listar: {errorListado}</p>
        )}
        <TablaGestion vacio={!capitanes.length && !errorListado ? "Todavía no hay capitanes creados." : null}>
          <thead>
            <tr>
              <Th>Correo</Th>
              <Th>Creado</Th>
            </tr>
          </thead>
          <tbody>
            {capitanes.map((c) => (
              <tr key={c.id}>
                <Td>
                  <span className="font-medium">{c.correo}</span>
                </Td>
                <Td className="text-stone-600">{formatearFecha(c.creado_en)}</Td>
              </tr>
            ))}
          </tbody>
        </TablaGestion>
      </section>
    </ContenedorPagina>
  );
}
