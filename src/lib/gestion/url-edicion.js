/** Id del ítem en edición desde ?editar=uuid */
export function idEnEdicion(searchParams) {
  const raw = searchParams?.editar;
  return raw ? String(raw) : null;
}

/** Id del ítem en detalle desde ?ver=uuid (mensajes, etc.). */
export function idEnDetalle(searchParams, param = "ver") {
  const raw = searchParams?.[param];
  return raw ? String(raw) : null;
}

/** URL para abrir el panel de edición de una fila. */
export function urlEditar(basePath, id, extraParams = {}) {
  const params = new URLSearchParams({ editar: id, ...extraParams });
  return `${basePath}?${params.toString()}`;
}

/** URL para ver detalle de una fila. */
export function urlVer(basePath, id, extraParams = {}) {
  const params = new URLSearchParams({ ver: id, ...extraParams });
  return `${basePath}?${params.toString()}`;
}

/** URL para cerrar edición o detalle (conserva otros query params). */
export function urlCerrarPanel(searchParams, basePath, omitir = ["editar", "ver"]) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (omitir.includes(key) || value == null) continue;
    params.set(key, String(value));
  }
  const q = params.toString();
  return q ? `${basePath}?${q}` : basePath;
}

/** @deprecated usa urlCerrarPanel */
export function urlCancelarEdicion(searchParams, basePath) {
  return urlCerrarPanel(searchParams, basePath, ["editar"]);
}
