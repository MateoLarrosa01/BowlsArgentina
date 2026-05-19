export function ContenidoInstitucional({ texto }) {
  const parrafos = (texto ?? "")
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (!parrafos.length) {
    return <p className="text-stone-500">Sin contenido por el momento.</p>;
  }

  return (
    <div className="space-y-4 text-base leading-relaxed text-stone-700">
      {parrafos.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
