/** Menú principal del sitio público (orden alineado al sitio histórico). */
export const MENU_PUBLICO = [
  { href: "/", etiqueta: "Inicio" },
  { href: "/torneos", etiqueta: "Torneos" },
  { href: "/institucional/quienes-somos", etiqueta: "Quiénes somos" },
  { href: "/fotos", etiqueta: "Fotos" },
  { href: "/institucional/autoridades", etiqueta: "Autoridades" },
  { href: "/reglamentos", etiqueta: "Reglamentos" },
  { href: "/links", etiqueta: "Links" },
  { href: "/contacto", etiqueta: "Contacto" },
];

/** Enlaces visibles siempre en la barra principal. */
export const MENU_PRINCIPAL = MENU_PUBLICO.filter((e) =>
  ["/", "/torneos"].includes(e.href)
);

/** Resto del sitio institucional (menú desplegable). */
export const MENU_INSTITUCIONAL = MENU_PUBLICO.filter(
  (e) => !["/", "/torneos"].includes(e.href)
);

export function enlaceActivo(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function menuInstitucionalActivo(pathname) {
  return MENU_INSTITUCIONAL.some((e) => enlaceActivo(pathname, e.href));
}
