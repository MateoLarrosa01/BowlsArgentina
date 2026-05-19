import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ContenedorPagina } from "@/components/contenedor-pagina";
import { crearTorneo } from "../actions";

export default function AdminTorneoNuevoPage() {
  return (
    <ContenedorPagina className="max-w-lg">
      <nav className="text-sm text-stone-500">
        <Link href="/gestion" className="font-medium text-emerald-800 hover:underline">
          Gestión
        </Link>
        <span className="mx-2">/</span>
        <Link href="/gestion/torneos" className="font-medium text-emerald-800 hover:underline">
          Torneos
        </Link>
        <span className="mx-2">/</span>
        <span className="text-stone-800">Nuevo</span>
      </nav>

      <h1 className="mt-4 text-2xl font-bold text-stone-900">Nuevo torneo</h1>
      <p className="mt-2 text-base text-stone-600">
        Se crea en estado <strong>borrador</strong>. Luego agregás divisiones y equipos
        y lo publicás cuando quieras mostrarlo.
      </p>

      <form action={crearTorneo} className="mt-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-stone-700">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            required
            className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            placeholder="Ej. Interclubes 2026"
          />
        </div>
        <div>
          <label htmlFor="temporada" className="block text-sm font-medium text-stone-700">
            Temporada
          </label>
          <input
            id="temporada"
            name="temporada"
            required
            className="mt-1 w-full min-h-[44px] rounded-lg border border-stone-300 px-3 text-base"
            placeholder="Ej. 2025/2026"
          />
        </div>
        <button
          type="submit"
          className="mt-2 min-h-[48px] w-full rounded-xl bg-emerald-700 text-base font-semibold text-white hover:bg-emerald-600"
        >
          Crear y continuar
        </button>
      </form>
    </ContenedorPagina>
  );
}
