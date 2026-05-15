"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import {
  createBrowserSupabaseClient,
  supabaseConfigurado,
} from "@/lib/supabase/client";

export default function RegistroPage() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [tipoMensaje, setTipoMensaje] = useState("ok"); // ok | error
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setMensaje(null);
    if (!supabaseConfigurado()) {
      setTipoMensaje("error");
      setMensaje("Falta configurar Supabase (.env.local).");
      return;
    }
    setCargando(true);
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signUp({
        email: correo.trim(),
        password: clave,
      });
      if (error) {
        setTipoMensaje("error");
        setMensaje(error.message);
        setCargando(false);
        return;
      }
      if (data.session) {
        router.refresh();
        router.push("/panel");
      } else {
        setTipoMensaje("ok");
        setMensaje(
          "Revisá tu correo para confirmar la cuenta, si el proyecto tiene confirmación activada.",
        );
      }
    } catch (err) {
      setTipoMensaje("error");
      setMensaje(err?.message ?? "Error al registrarse.");
    }
    setCargando(false);
  }

  return (
    <ContenedorPagina className="max-w-md">
      <h1 className="text-2xl font-bold text-stone-900">Crear cuenta</h1>
      <p className="mt-2 text-base text-stone-600">
        El rol por defecto es <strong>capitán</strong>. La federación puede
        otorgar permisos de administración cuando corresponda.
      </p>

      {!supabaseConfigurado() && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          Configurá las variables públicas de Supabase en{" "}
          <code className="rounded bg-amber-100 px-1">.env.local</code>.
        </p>
      )}

      <form
        onSubmit={(e) => void enviar(e)}
        className="mt-8 space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label
            htmlFor="reg-correo"
            className="block text-sm font-medium text-stone-700"
          >
            Correo
          </label>
          <input
            id="reg-correo"
            type="email"
            autoComplete="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="mt-2 w-full min-h-[48px] rounded-lg border border-stone-300 px-3 text-base outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600"
          />
        </div>
        <div>
          <label
            htmlFor="reg-clave"
            className="block text-sm font-medium text-stone-700"
          >
            Contraseña
          </label>
          <input
            id="reg-clave"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            className="mt-2 w-full min-h-[48px] rounded-lg border border-stone-300 px-3 text-base outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        {mensaje && (
          <p
            className={
              tipoMensaje === "error"
                ? "rounded-lg bg-red-50 px-3 py-2 text-sm text-red-900"
                : "rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-950"
            }
            role={tipoMensaje === "error" ? "alert" : "status"}
          >
            {mensaje}
          </p>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="flex w-full min-h-[48px] items-center justify-center rounded-xl bg-emerald-700 text-base font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          {cargando ? "Creando…" : "Registrarme"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-600">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/iniciar-sesion"
          className="font-semibold text-emerald-800 underline-offset-2 hover:underline"
        >
          Iniciar sesión
        </Link>
      </p>
    </ContenedorPagina>
  );
}
