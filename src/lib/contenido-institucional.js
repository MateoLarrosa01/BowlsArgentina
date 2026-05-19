/** Slugs con enlace fijo en cabecera y pie (deben existir en paginas_institucionales). */
/** Solo páginas editables en gestión/contenido (contacto usa /contacto con formulario). */
export const SLUGS_INSTITUCIONALES_NAV = [
  { slug: "quienes-somos", etiqueta: "Quiénes somos" },
];

/** href opcional para rutas estáticas (ej. autoridades). */
export function rutaInstitucionalNav(item) {
  return item.href ?? `/institucional/${item.slug}`;
}

export function rutaInstitucional(slug) {
  return `/institucional/${slug}`;
}
