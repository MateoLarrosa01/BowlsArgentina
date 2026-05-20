export function TablaGestion({ children, vacio, pie }) {
  if (vacio) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-stone-600">
        {vacio}
      </p>
    );
  }

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        {children}
      </table>
      {pie}
    </div>
  );
}

export function Th({ children, className = "" }) {
  return (
    <th
      className={`border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-stone-600 ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "" }) {
  return <td className={`border-b border-stone-100 px-4 py-3 align-middle text-stone-800 ${className}`}>{children}</td>;
}

export function FilaEdicion({ colSpan, children }) {
  return (
    <tr className="bg-emerald-50/50">
      <td colSpan={colSpan} className="border-b border-stone-200 px-4 py-5">
        {children}
      </td>
    </tr>
  );
}

export function BotonEditar({ href }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-[36px] items-center rounded-lg border border-emerald-700 px-3 text-sm font-medium text-emerald-800 hover:bg-emerald-50"
    >
      Editar
    </a>
  );
}

export function BotonCancelarEdicion({ href }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-[36px] items-center rounded-lg border border-stone-300 px-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
    >
      Cancelar
    </a>
  );
}
