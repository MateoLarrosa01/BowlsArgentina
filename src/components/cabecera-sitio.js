"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  createBrowserSupabaseClient,
  supabaseConfigurado,
} from "@/lib/supabase/client";
import {
  MENU_INSTITUCIONAL,
  MENU_PRINCIPAL,
  enlaceActivo,
  menuInstitucionalActivo,
} from "@/lib/navegacion-publica";

const claseEnlace =
  "shrink-0 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors min-h-[40px] inline-flex items-center sm:px-3";
const claseActivo = "bg-emerald-800 text-white";
const claseInactivo = "text-emerald-100 hover:bg-emerald-900/80 hover:text-white";

function etiquetaRol(rol) {
  if (rol === "super_admin") return "Superadmin";
  if (rol === "admin_fab") return "FAB";
  if (rol === "capitan") return "Capitán";
  return null;
}

function enlaceNav(pathname, href, etiqueta) {
  const activo = enlaceActivo(pathname, href);
  return (
    <Link
      href={href}
      className={`${claseEnlace} ${activo ? claseActivo : claseInactivo}`}
    >
      {etiqueta}
    </Link>
  );
}

export function CabeceraSitio() {
  const pathname = usePathname();
  const router = useRouter();
  const [sesion, setSesion] = useState(null);
  const [rol, setRol] = useState(null);
  const [listo, setListo] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [institucionalAbierto, setInstitucionalAbierto] = useState(false);

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

  useEffect(() => {
    setMenuAbierto(false);
    setInstitucionalAbierto(false);
  }, [pathname]);

  async function cerrarSesion() {
    if (!supabaseConfigurado()) return;
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
    setSesion(null);
    setRol(null);
    router.refresh();
    router.push("/");
  }

  const esAdmin = rol === "super_admin" || rol === "admin_fab";
  const esCapitan = rol === "capitan";
  const rolEtiqueta = etiquetaRol(rol);
  const institucionalActivo = menuInstitucionalActivo(pathname);

  return (
    <header className="border-b border-emerald-900/30 bg-emerald-950 text-emerald-50 shadow-md">
      <div className="mx-auto max-w-6xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-white"
          >
            <Image
              src="/logo-federacion.png"
              alt=""
              width={36}
              height={36}
              className="rounded-full bg-white/95"
            />
            <span className="hidden sm:inline">Bowls Argentina</span>
            <span className="sm:hidden">FAB</span>
          </Link>

          <div className="flex items-center gap-2">
            {!supabaseConfigurado() && (
              <span className="hidden text-xs text-amber-200/90 md:inline">
                Falta .env.local
              </span>
            )}
            {listo && !sesion && supabaseConfigurado() && (
              <>
                <Link
                  href="/iniciar-sesion"
                  className="rounded-lg border border-emerald-400/40 px-3 py-2 text-sm font-medium hover:bg-emerald-900/60 min-h-[40px] inline-flex items-center"
                >
                  Entrar
                </Link>
                <Link
                  href="/registro"
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 min-h-[40px] inline-flex items-center"
                >
                  Registro
                </Link>
              </>
            )}
            {listo && sesion && (
              <div className="flex items-center gap-2">
                {rolEtiqueta && (
                  <span className="hidden rounded-md bg-emerald-900/80 px-2 py-0.5 text-xs font-medium text-emerald-100 sm:inline">
                    {rolEtiqueta}
                  </span>
                )}
                <span className="max-w-[8rem] truncate text-xs text-emerald-200 sm:max-w-[12rem] sm:text-sm">
                  {sesion.email}
                </span>
                <button
                  type="button"
                  onClick={() => void cerrarSesion()}
                  className="rounded-lg bg-emerald-900 px-3 py-2 text-sm font-medium text-emerald-100 min-h-[40px] hover:bg-emerald-800"
                >
                  Salir
                </button>
              </div>
            )}
            <button
              type="button"
              className="rounded-lg border border-emerald-700 px-3 py-2 text-sm font-medium text-emerald-50 min-h-[40px] lg:hidden"
              aria-expanded={menuAbierto}
              aria-controls="nav-mobile"
              onClick={() => setMenuAbierto((v) => !v)}
            >
              Menú
            </button>
          </div>
        </div>

        <nav
          id="nav-mobile"
          className={`mt-3 border-t border-emerald-800/80 pt-3 ${menuAbierto ? "block" : "hidden lg:block"}`}
          aria-label="Principal"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-1">
              {MENU_PRINCIPAL.map((e) => (
                <span key={e.href}>{enlaceNav(pathname, e.href, e.etiqueta)}</span>
              ))}

              <div className="relative hidden lg:block">
                <button
                  type="button"
                  onClick={() => setInstitucionalAbierto((v) => !v)}
                  className={`${claseEnlace} gap-1 ${institucionalActivo ? claseActivo : claseInactivo}`}
                  aria-expanded={institucionalAbierto}
                >
                  Institucional
                  <span aria-hidden className="text-xs opacity-80">
                    ▾
                  </span>
                </button>
                {institucionalAbierto && (
                  <div className="absolute left-0 top-full z-50 mt-1 min-w-[12rem] rounded-xl border border-emerald-800 bg-emerald-950 py-1 shadow-lg">
                    {MENU_INSTITUCIONAL.map((e) => (
                      <Link
                        key={e.href}
                        href={e.href}
                        className={`block px-4 py-2.5 text-sm hover:bg-emerald-900 ${
                          enlaceActivo(pathname, e.href) ? "font-semibold text-white" : "text-emerald-100"
                        }`}
                      >
                        {e.etiqueta}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex w-full flex-wrap gap-1 lg:hidden">
                {MENU_INSTITUCIONAL.map((e) => (
                  <span key={e.href}>{enlaceNav(pathname, e.href, e.etiqueta)}</span>
                ))}
              </div>
            </div>

            {listo && sesion && (
              <div className="flex flex-wrap items-center gap-1 border-t border-emerald-800/60 pt-3 lg:border-t-0 lg:pt-0">
                {esCapitan && (
                  <Link
                    href="/panel/mis-encuentros"
                    className={`${claseEnlace} ${
                      pathname.startsWith("/panel/mis-encuentros") ? claseActivo : claseInactivo
                    }`}
                  >
                    Mis encuentros
                  </Link>
                )}
                {esAdmin && (
                  <Link
                    href="/gestion"
                    className={`${claseEnlace} ${
                      pathname.startsWith("/gestion") ? claseActivo : claseInactivo
                    }`}
                  >
                    Gestión
                  </Link>
                )}
                {!esAdmin && (
                  <Link
                    href="/panel"
                    className={`${claseEnlace} ${
                      pathname === "/panel" || pathname.startsWith("/panel/")
                        ? claseActivo
                        : claseInactivo
                    }`}
                  >
                    Mi panel
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

