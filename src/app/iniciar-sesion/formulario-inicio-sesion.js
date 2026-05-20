import { ContenedorPagina } from "@/components/contenedor-pagina";
import { supabaseConfigurado } from "@/lib/supabase/client";
import { iniciarSesion } from "./actions";
import { BotonIngresar } from "./boton-ingresar";

export function FormularioInicioSesion({ siguiente, mensaje }) {
  return (
    <ContenedorPagina className="max-w-md">
      <h1 className="text-2xl font-bold text-stone-900">Iniciar sesión</h1>
      <p className="mt-2 text-base text-stone-600">
        Accedé con la cuenta que te dio la federación (correo y contraseña).
      </p>

      {!supabaseConfigurado() && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Definí{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en{" "}
          <code className="rounded bg-amber-100 px-1">.env.local</code>.
        </p>
      )}

      <form
        action={iniciarSesion}
        method="post"
        className="mt-8 space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="siguiente" value={siguiente} />

        <div>
          <label htmlFor="correo" className="block text-sm font-medium text-stone-700">
            Correo
          </label>
          <input
            id="correo"
            name="correo"
            type="email"
            autoComplete="email"
            required
            className="mt-2 w-full min-h-[48px] rounded-lg border border-stone-300 px-3 text-base text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div>
          <label htmlFor="clave" className="block text-sm font-medium text-stone-700">
            Contraseña
          </label>
          <input
            id="clave"
            name="clave"
            type="password"
            autoComplete="current-password"
            required
            className="mt-2 w-full min-h-[48px] rounded-lg border border-stone-300 px-3 text-base text-stone-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {mensaje && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
            {mensaje}
          </p>
        )}

        <BotonIngresar />
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        Las cuentas de capitán las crea la federación. Si no podés ingresar, contactá a la FAB.
      </p>
    </ContenedorPagina>
  );
}
