export function AlertasFlash({
  mensaje,
  ok,
  okTexto = "Guardado correctamente.",
  tipoMensaje = "error",
}) {
  const esAviso = tipoMensaje === "aviso";
  return (
    <>
      {mensaje && (
        <p
          className={`mt-6 rounded-xl border px-4 py-3 text-sm ${
            esAviso
              ? "border-amber-200 bg-amber-50 text-amber-950"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
          role={esAviso ? "status" : "alert"}
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
