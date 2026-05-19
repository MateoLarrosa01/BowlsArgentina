/** Slugs con enlace fijo en cabecera y pie (deben existir en paginas_institucionales). */
export const SLUGS_INSTITUCIONALES_NAV = [
  { slug: "quienes-somos", etiqueta: "Quiénes somos" },
  { slug: "autoridades", etiqueta: "Autoridades", href: "/institucional/autoridades" },
  { slug: "contacto", etiqueta: "Contacto" },
];

/** href opcional para rutas estáticas (ej. autoridades). */
export function rutaInstitucionalNav(item) {
  return item.href ?? `/institucional/${item.slug}`;
}

export function rutaInstitucional(slug) {
  return `/institucional/${slug}`;
}
