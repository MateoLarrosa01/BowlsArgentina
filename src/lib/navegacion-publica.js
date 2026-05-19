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

export function enlaceActivo(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
