"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  createBrowserSupabaseClient,
  supabaseConfigurado,
} from "@/lib/supabase/client";

const enlacesPublicos = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/torneos", etiqueta: "Torneos" },
];

function etiquetaRol(rol) {
  if (rol === "super_admin") return "Superadmin";
  if (rol === "admin_fab") return "Administración FAB";
  if (rol === "capitan") return "Capitán";
  return rol ?? "";
}

export function CabeceraSitio() {
  const pathname = usePathname();
  const router = useRouter();
  const [sesion, setSesion] = useState(null);
  const [rol, setRol] = useState(null);
  const [listo, setListo] = useState(false);

  const refrescarSesion = useCallback(async () => {
    if (!supabaseConfigurado()) {
      setSesion(null);
      setRol(null);
      setListo(true);
      return;
    }
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase.auth.getUser();
    const usuario = data.user;
    setSesion(usuario ?? null);
    if (usuario) {
      const { data: perfil } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", usuario.id)
        .maybeSingle();
      setRol(perfil?.rol ?? null);
    } else {
      setRol(null);
    }
    setListo(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void refrescarSesion();
    }, 0);
    return () => clearTimeout(t);
  }, [refrescarSesion, pathname]);

  async function cerrarSesion() {
    if (!supabaseConfigurado()) return;
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setSesion(null);
    setRol(null);
    router.refresh();
    router.push("/");
  }

  const panelActivo =
    pathname === "/panel" ||
    (pathname.startsWith("/panel") && !pathname.startsWith("/panel/admin"));

  const esAdmin = rol === "super_admin" || rol === "admin_fab";

  return (
    <header className="border-b border-emerald-900/30 bg-emerald-950 text-emerald-50 shadow-md">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-white sm:text-xl"
          >
            Bowls Argentina
          </Link>
          <span className="hidden h-6 w-px bg-emerald-700 sm:inline" aria-hidden />
          <nav className="flex flex-wrap gap-1" aria-label="Principal">
            {enlacesPublicos.map((e) => {
              const activo =
                e.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(e.href);
              return (
                <Link
                  key={e.href}
                  href={e.href}
                  className={`rounded-lg px-3 py-2 text-base font-medium transition-colors min-h-[44px] inline-flex items-center ${
                    activo
                      ? "bg-emerald-800 text-white"
                      : "text-emerald-100 hover:bg-emerald-900/80 hover:text-white"
                  }`}
                >
                  {e.etiqueta}
                </Link>
              );
            })}
            {listo && sesion && rol === "capitan" && (
              <Link
                href="/panel/mis-encuentros"
                className={`rounded-lg px-3 py-2 text-base font-medium transition-colors min-h-[44px] inline-flex items-center ${
                  pathname.startsWith("/panel/mis-encuentros")
                    ? "bg-emerald-800 text-white"
                    : "text-emerald-100 hover:bg-emerald-900/80 hover:text-white"
                }`}
              >
                Mis encuentros
              </Link>
            )}
            {listo && esAdmin && (
              <Link
                href="/panel/admin"
                className={`rounded-lg px-3 py-2 text-base font-medium transition-colors min-h-[44px] inline-flex items-center ${
                  pathname.startsWith("/panel/admin")
                    ? "bg-emerald-800 text-white"
                    : "text-emerald-100 hover:bg-emerald-900/80 hover:text-white"
                }`}
              >
                Administración
              </Link>
            )}
            {listo && sesion && (
              <Link
                href="/panel"
                className={`rounded-lg px-3 py-2 text-base font-medium transition-colors min-h-[44px] inline-flex items-center ${
                  panelActivo
                    ? "bg-emerald-800 text-white"
                    : "text-emerald-100 hover:bg-emerald-900/80 hover:text-white"
                }`}
              >
                Mi panel
              </Link>
            )}
            {listo && esAdmin && (
              <span className="rounded-lg bg-amber-500/20 px-3 py-2 text-base text-amber-100 min-h-[44px] inline-flex items-center">
                {etiquetaRol(rol)}
              </span>
            )}
          </nav>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {!supabaseConfigurado() && (
            <span className="text-sm text-amber-200/90">
              Falta configurar Supabase (.env.local)
            </span>
          )}
          {listo && !sesion && supabaseConfigurado() && (
            <>
              <Link
                href="/iniciar-sesion"
                className="rounded-lg border border-emerald-400/40 px-4 py-2 text-base font-medium text-emerald-50 min-h-[44px] inline-flex items-center hover:bg-emerald-900/60"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/registro"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-base font-semibold text-white min-h-[44px] inline-flex items-center hover:bg-emerald-500"
              >
                Registro
              </Link>
            </>
          )}
          {listo && sesion && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="max-w-[14rem] truncate text-sm text-emerald-200 sm:max-w-xs">
                {sesion.email}
              </span>
              <button
                type="button"
                onClick={() => void cerrarSesion()}
                className="rounded-lg bg-emerald-900 px-4 py-2 text-base font-medium text-emerald-100 min-h-[44px] hover:bg-emerald-800"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
