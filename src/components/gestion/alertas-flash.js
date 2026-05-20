export function AlertasFlash({
  mensaje,
  ok,
  okTexto = "Guardado correctamente.",
}) {
  return (
    <>
      {mensaje && (
        <p
          className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
          role="alert"
        >
          {mensaje}
        </p>
      )}
      {ok && (
        <p
          className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          {okTexto}
        </p>
      )}
    </>
  );
}
