"use client";

import { useFormStatus } from "react-dom";

export function BotonIngresar() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full min-h-[48px] items-center justify-center rounded-xl bg-emerald-700 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"
    >
      {pending ? "Ingresando…" : "Ingresar"}
    </button>
  );
}
