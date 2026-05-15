export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-16 text-zinc-900">
      <main className="w-full max-w-xl space-y-8 text-center sm:text-left">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Bowls Argentina
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Plataforma en construcción
        </h1>
        <p className="text-lg leading-relaxed text-zinc-600">
          Estamos levantando la nueva web para gestionar torneos interclubes,
          resultados y tablas, con prioridad en uso claro desde el celular.
        </p>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-left shadow-sm">
          <h2 className="text-base font-semibold text-zinc-900">
            Consulta pública sin cuenta
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600">
            La navegación como espectador no requerirá usuario. Las funciones de
            administración y carga se habilitarán al iniciar sesión cuando
            incorporemos roles.
          </p>
        </div>
        <p className="text-sm text-zinc-500">
          Stack: Next.js (JavaScript), despliegue en Vercel y datos en Supabase.
        </p>
      </main>
    </div>
  );
}
