/** Slugs con enlace fijo en cabecera y pie (deben existir en paginas_institucionales). */
export const SLUGS_INSTITUCIONALES_NAV = [
  { slug: "quienes-somos", etiqueta: "Quiénes somos" },
  { slug: "contacto", etiqueta: "Contacto" },
];

export function rutaInstitucional(slug) {
  return `/institucional/${slug}`;
}
