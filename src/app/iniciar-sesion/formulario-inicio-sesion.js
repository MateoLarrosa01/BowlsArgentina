"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import {
  createBrowserSupabaseClient,
  supabaseConfigurado,
} from "@/lib/supabase/client";

export function FormularioInicioSesion() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const siguiente = searchParams.get("siguiente") || "/panel";

  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setMensaje(null);
    if (!supabaseConfigurado()) {
      setMensaje("Falta configurar Supabase (.env.local).");
      return;
    }
    setCargando(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: correo.trim(),
        password: clave,
      });
      if (error) {
        setMensaje(error.message);
        setCargando(false);
        return;
      }
      router.refresh();
      router.push(siguiente.startsWith("/") ? siguiente : "/panel");
    } catch (err) {
      setMensaje(err?.message ?? "Error al iniciar sesión.");
    }
    setCargando(false);
  }

  return (
    <ContenedorPagina className="max-w-md">
      <h1 className="text-2xl font-bold text-stone-900">Iniciar sesión</h1>
      <p className="mt-2 text-base text-stone-600">
        Accedé con la cuenta que te dio la federación o la que registraste.
      </p>

      {!supabaseConfigurado() && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Definí{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          y{" "}
          <code className="rounded bg-amber-100 px-1">
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </code>{" "}
          en <code className="rounded bg-amber-100 px-1">.env.local</code>.
        </p>
      )}

      <form
        onSubmit={(e) => void enviar(e)}
        className="mt-8 space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="correo"
            className="block text-sm font-medium text-stone-700"
          >
            Correo
          </label>
          <input
            id="correo"
            name="correo"
            type="email"
            autoComplete="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="mt-2 w-full min-h-[48px] rounded-lg border border-stone-300 px-3 text-base text-stone-900 outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2"
          />
        </div>
        <div>
          <label
            htmlFor="clave"
            className="block text-sm font-medium text-stone-700"
          >
            Contraseña
          </label>
          <input
            id="clave"
            name="clave"
            type="password"
            autoComplete="current-password"
            required
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="mt-2 w-full min-h-[48px] rounded-lg border border-stone-300 px-3 text-base text-stone-900 outline-none ring-emerald-600 focus:border-emerald-600 focus:ring-2"
          />
        </div>

        {mensaje && (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900"
            role="alert"
          >
            {mensaje}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="flex w-full min-h-[48px] items-center justify-center rounded-xl bg-emerald-700 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
        >
          {cargando ? "Ingresando…" : "Ingresar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        ¿No tenés cuenta?{" "}
        <Link
          href="/registro"
          className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
        >
          Registrate
        </Link>
      </p>
    </ContenedorPagina>
  );
}
