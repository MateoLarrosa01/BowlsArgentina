import Link from "next/link";

export function PieSitio() {
  const anio = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-stone-200 bg-white py-8 text-stone-600">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed">
          © {anio} Bowls Argentina · Plataforma en desarrollo para la federación y
          los clubes.
        </p>
        <p className="text-sm">
          <Link
            href="https://bowlsargentina.org/"
            className="font-medium text-emerald-800 underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Sitio institucional
          </Link>
        </p>
      </div>
    </footer>
  );
}
