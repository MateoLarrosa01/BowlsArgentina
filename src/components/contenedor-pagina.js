/** Contenedor de ancho acotado para lectura cómoda en pantallas grandes. */
export function ContenedorPagina({ children, className = "" }) {
  return (
    <div
      className={`mx-auto w-full max-w-5xl px-4 py-8 sm:py-10 ${className}`}
    >
      {children}
    </div>
  );
}
